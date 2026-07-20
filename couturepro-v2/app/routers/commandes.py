from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Commande, Cliente, StatutCommande
from app.schemas import CommandeCreate, CommandeUpdate, CommandeOut, CommandeStatutUpdate
from app.dependencies import require_acces

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


@router.post("", response_model=CommandeOut, status_code=201)
def creer_commande(
    payload: CommandeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("commandes")),
):
    _check_cliente(db, payload.cliente_id, current_user.id)
    data = payload.model_dump()
    reste = max(data["prix_total"] - data["avance_paye"], 0)
    commande = Commande(user_id=current_user.id, reste_a_payer=reste, **data)
    db.add(commande)
    db.commit()
    db.refresh(commande)
    return commande


@router.get("", response_model=List[CommandeOut])
def lister_commandes(
    statut: Optional[StatutCommande] = None,
    cliente_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("commandes")),
):
    query = db.query(Commande).filter(Commande.user_id == current_user.id)
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
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(commande, field, value)
    commande.reste_a_payer = max((commande.prix_total or 0) - (commande.avance_paye or 0), 0)
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
