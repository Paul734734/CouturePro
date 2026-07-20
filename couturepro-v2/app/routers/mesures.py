from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Mesure, Cliente
from app.schemas import MesureCreate, MesureUpdate, MesureOut
from app.dependencies import require_acces

router = APIRouter(prefix="/api/mesures", tags=["Mesures"])


def _check_cliente(db: Session, cliente_id: str, user_id: str):
    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id, Cliente.user_id == user_id
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente introuvable.")


def _get_mesure_or_404(db: Session, mesure_id: str, user_id: str) -> Mesure:
    mesure = db.query(Mesure).filter(
        Mesure.id == mesure_id, Mesure.user_id == user_id
    ).first()
    if not mesure:
        raise HTTPException(status_code=404, detail="Mesure introuvable.")
    return mesure


@router.post("", response_model=MesureOut, status_code=201)
def creer_mesure(
    payload: MesureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("mesures")),
):
    _check_cliente(db, payload.cliente_id, current_user.id)
    mesure = Mesure(user_id=current_user.id, **payload.model_dump())
    db.add(mesure)
    db.commit()
    db.refresh(mesure)
    return mesure


@router.get("/cliente/{cliente_id}", response_model=List[MesureOut])
def lister_mesures_cliente(
    cliente_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("mesures")),
):
    _check_cliente(db, cliente_id, current_user.id)
    return db.query(Mesure).filter(
        Mesure.cliente_id == cliente_id, Mesure.user_id == current_user.id
    ).order_by(Mesure.updated_at.desc()).all()


@router.get("/{mesure_id}", response_model=MesureOut)
def obtenir_mesure(
    mesure_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("mesures")),
):
    return _get_mesure_or_404(db, mesure_id, current_user.id)


@router.put("/{mesure_id}", response_model=MesureOut)
def modifier_mesure(
    mesure_id: str,
    payload: MesureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("mesures")),
):
    mesure = _get_mesure_or_404(db, mesure_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(mesure, field, value)
    db.commit()
    db.refresh(mesure)
    return mesure


@router.delete("/{mesure_id}", status_code=204)
def supprimer_mesure(
    mesure_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("mesures")),
):
    mesure = _get_mesure_or_404(db, mesure_id, current_user.id)
    db.delete(mesure)
    db.commit()
