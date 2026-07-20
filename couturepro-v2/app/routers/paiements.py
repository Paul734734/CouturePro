from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Paiement, Commande, Cliente, StatutCommande
from app.schemas import PaiementCreate, PaiementOut, PaiementEnrichiOut, SuiviPaiementOut, TotauxPaiementsOut
from app.dependencies import require_acces

router = APIRouter(prefix="/api/paiements", tags=["Paiements"])


def _get_commande_or_404(db: Session, commande_id: str, user_id: str) -> Commande:
    commande = db.query(Commande).filter(
        Commande.id == commande_id, Commande.user_id == user_id
    ).first()
    if not commande:
        raise HTTPException(status_code=404, detail="Commande introuvable.")
    return commande


@router.post("", response_model=PaiementOut, status_code=201)
def creer_paiement(
    payload: PaiementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("paiements")),
):
    commande = _get_commande_or_404(db, payload.commande_id, current_user.id)

    paiement = Paiement(user_id=current_user.id, **payload.model_dump())
    db.add(paiement)

    # met a jour automatiquement la commande liee
    commande.avance_paye = (commande.avance_paye or 0) + payload.montant
    commande.reste_a_payer = max((commande.prix_total or 0) - commande.avance_paye, 0)

    db.commit()
    db.refresh(paiement)
    return paiement


@router.get("", response_model=List[PaiementEnrichiOut])
def lister_tous_paiements(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("paiements")),
):
    # jointure dynamique : clienteNom et commandeLabel recalcules a chaque appel,
    # meme pattern que /suivi (pas de denormalisation stockee)
    paiements = db.query(Paiement).filter(
        Paiement.user_id == current_user.id
    ).order_by(Paiement.date.desc()).all()

    resultat = []
    for paiement in paiements:
        commande = db.query(Commande).filter(Commande.id == paiement.commande_id).first()
        cliente = db.query(Cliente).filter(Cliente.id == commande.cliente_id).first() if commande else None

        resultat.append(PaiementEnrichiOut(
            id=paiement.id,
            user_id=paiement.user_id,
            commande_id=paiement.commande_id,
            montant=paiement.montant,
            type=paiement.type,
            date=paiement.date,
            notes=paiement.notes,
            cliente_nom=cliente.nom if cliente else "",
            commande_label=commande.type_vetement if commande else "",
        ))
    return resultat


@router.get("/commande/{commande_id}", response_model=List[PaiementOut])
def lister_paiements_commande(
    commande_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("paiements")),
):
    _get_commande_or_404(db, commande_id, current_user.id)
    return db.query(Paiement).filter(
        Paiement.commande_id == commande_id, Paiement.user_id == current_user.id
    ).order_by(Paiement.date.desc()).all()


@router.get("/suivi", response_model=List[SuiviPaiementOut])
def suivi_paiements(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("paiements")),
):
    # jointure dynamique : clienteNom et commandeLabel recalcules a chaque appel,
    # jamais stockes en dur (decision prise pour rester toujours a jour)
    commandes = db.query(Commande).filter(Commande.user_id == current_user.id).all()

    resultat = []
    for commande in commandes:
        cliente = db.query(Cliente).filter(Cliente.id == commande.cliente_id).first()
        paiements = db.query(Paiement).filter(Paiement.commande_id == commande.id).all()
        total_paye = sum(p.montant for p in paiements)
        reste = max((commande.prix_total or 0) - total_paye, 0)

        if reste == 0:
            statut = "solde"
        elif total_paye == 0:
            statut = "impaye"
        else:
            statut = "partiel"

        resultat.append(SuiviPaiementOut(
            commande_id=commande.id,
            cliente_nom=cliente.nom if cliente else "",
            commande_label=commande.type_vetement,
            prix_total=commande.prix_total or 0,
            total_paye=total_paye,
            reste_a_payer=reste,
            statut=statut,
        ))
    return resultat


@router.get("/totaux", response_model=TotauxPaiementsOut)
def totaux_paiements(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("paiements")),
):
    commandes = db.query(Commande).filter(Commande.user_id == current_user.id).all()
    total_encaisse = sum(c.avance_paye or 0 for c in commandes)
    total_reste = sum(
        c.reste_a_payer or 0 for c in commandes
        if c.statut not in (StatutCommande.ANNULE, StatutCommande.LIVRE)
    )
    return TotauxPaiementsOut(total_encaisse=total_encaisse, total_reste=total_reste)
