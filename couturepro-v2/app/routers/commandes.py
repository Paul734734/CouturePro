from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Commande, Cliente, StatutCommande, Paiement, TypePaiement, Facture, StatutFacture, TypeDocument
from app.schemas import CommandeCreate, CommandeUpdate, CommandeOut, CommandeStatutUpdate
from app.dependencies import require_acces
from app.acces import calculer_acces
from app.atelier_scope import valider_atelier_id, filtrer_par_atelier

router = APIRouter(prefix="/api/commandes", tags=["Commandes"])


def _check_cliente(db: Session, cliente_id: str, user_id: str):
    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id, Cliente.user_id == user_id
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente introuvable.")


def _get_commande_or_404(db: Session, commande_id: str, user_id: str) -> Commande:
    commande = db.query(Commande).filter(
        Commande.id == commande_id, Commande.user_id == user_id
    ).first()
    if not commande:
        raise HTTPException(status_code=404, detail="Commande introuvable.")
    return commande


def _calculer_statut_facture(montant_total: float, montant_paye: float) -> StatutFacture:
    if montant_paye <= 0:
        return StatutFacture.IMPAYEE
    if montant_paye >= montant_total:
        return StatutFacture.PAYEE
    return StatutFacture.PARTIELLE


def _prochain_numero_facture(db: Session, user_id: str) -> str:
    nb = db.query(Facture).filter(Facture.user_id == user_id).count()
    return f"FAC-{nb + 1:03d}"


def _synchroniser_facture_commande(db: Session, commande: Commande, current_user: User):
    """Crée ou met à jour la facture liée à la commande pour qu'elle reflète
    toujours le prix total et le montant réellement payé de la commande."""
    facture = db.query(Facture).filter(Facture.commande_id == commande.id).first()
    montant_total = (commande.prix_total or 0) + (commande.prix_livraison or 0)
    montant_paye = commande.avance_paye or 0
    montant_reste = max(0.0, montant_total - montant_paye)
    statut = _calculer_statut_facture(montant_total, montant_paye)

    if facture:
        facture.montant_total = montant_total
        facture.montant_paye = montant_paye
        facture.montant_reste = montant_reste
        facture.statut = statut
    else:
        cliente = db.query(Cliente).filter(Cliente.id == commande.cliente_id).first()
        acces = calculer_acces(current_user)
        facture = Facture(
            user_id=current_user.id,
            cliente_id=commande.cliente_id,
            cliente_nom=cliente.nom if cliente else "",
            commande_id=commande.id,
            commande_description=commande.type_vetement,
            numero=_prochain_numero_facture(db, current_user.id),
            type=TypeDocument.FACTURE,
            montant_total=montant_total,
            montant_paye=montant_paye,
            montant_reste=montant_reste,
            statut=statut,
            logo_atelier=current_user.logo_url if acces.get("logoPersonnalise") else None,
            nom_atelier=current_user.nom_atelier,
        )
        db.add(facture)


@router.post("", response_model=CommandeOut, status_code=201)
def creer_commande(
    payload: CommandeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("commandes")),
):
    _check_cliente(db, payload.cliente_id, current_user.id)
    valider_atelier_id(db, current_user, payload.atelier_id)
    data = payload.model_dump()
    reste = max(data["prix_total"] - data["avance_paye"], 0)
    commande = Commande(user_id=current_user.id, reste_a_payer=reste, **data)
    db.add(commande)
    db.commit()
    db.refresh(commande)

    # Si une avance a été renseignée dès la création, elle doit apparaître
    # dans le suivi des paiements et générer directement une facture qui
    # reflète les montants réels de la commande (pas seulement stockée sur
    # la commande elle-même).
    if (commande.avance_paye or 0) > 0:
        paiement = Paiement(
            user_id=current_user.id,
            commande_id=commande.id,
            montant=commande.avance_paye,
            type=TypePaiement.AVANCE,
            notes="Avance enregistrée à la création de la commande",
        )
        db.add(paiement)
        _synchroniser_facture_commande(db, commande, current_user)
        db.commit()
        db.refresh(commande)

    return commande


@router.get("", response_model=List[CommandeOut])
def lister_commandes(
    statut: Optional[StatutCommande] = None,
    cliente_id: Optional[str] = None,
    atelier_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("commandes")),
):
    query = db.query(Commande).filter(Commande.user_id == current_user.id)
    query = filtrer_par_atelier(query, Commande, atelier_id)
    if statut:
        query = query.filter(Commande.statut == statut)
    if cliente_id:
        query = query.filter(Commande.cliente_id == cliente_id)
    return query.order_by(Commande.date_commande.desc()).all()


@router.get("/{commande_id}", response_model=CommandeOut)
def obtenir_commande(
    commande_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("commandes")),
):
    return _get_commande_or_404(db, commande_id, current_user.id)


@router.put("/{commande_id}", response_model=CommandeOut)
def modifier_commande(
    commande_id: str,
    payload: CommandeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("commandes")),
):
    commande = _get_commande_or_404(db, commande_id, current_user.id)
    updates = payload.model_dump(exclude_unset=True)
    ancienne_avance = commande.avance_paye or 0

    for field, value in updates.items():
        setattr(commande, field, value)
    commande.reste_a_payer = max((commande.prix_total or 0) - (commande.avance_paye or 0), 0)

    # Si l'avance payée a augmenté (montant ajouté directement depuis le
    # formulaire de modification), on enregistre la différence comme un
    # paiement traçable et on garde la facture liée synchronisée.
    nouvelle_avance = commande.avance_paye or 0
    if "avance_paye" in updates and nouvelle_avance > ancienne_avance:
        paiement = Paiement(
            user_id=current_user.id,
            commande_id=commande.id,
            montant=nouvelle_avance - ancienne_avance,
            type=TypePaiement.SOLDE if commande.reste_a_payer == 0 else TypePaiement.PARTIEL,
            notes="Paiement ajouté depuis la modification de la commande",
        )
        db.add(paiement)

    if "avance_paye" in updates or "prix_total" in updates:
        if nouvelle_avance > 0 or db.query(Facture).filter(Facture.commande_id == commande.id).first():
            _synchroniser_facture_commande(db, commande, current_user)

    db.commit()
    db.refresh(commande)
    return commande


@router.patch("/{commande_id}/statut", response_model=CommandeOut)
def changer_statut_commande(
    commande_id: str,
    payload: CommandeStatutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("commandes")),
):
    commande = _get_commande_or_404(db, commande_id, current_user.id)
    commande.statut = payload.statut
    db.commit()
    db.refresh(commande)
    return commande


@router.delete("/{commande_id}", status_code=204)
def supprimer_commande(
    commande_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("commandes")),
):
    commande = _get_commande_or_404(db, commande_id, current_user.id)
    db.delete(commande)
    db.commit()
