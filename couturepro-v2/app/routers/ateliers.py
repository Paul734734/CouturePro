from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Atelier
from app.schemas import AtelierCreate, AtelierUpdate, AtelierOut
from app.dependencies import require_acces

router = APIRouter(prefix="/api/ateliers", tags=["Ateliers"])

MAX_ATELIERS = 3


def _get_atelier_or_404(db: Session, atelier_id: str, user_id: str) -> Atelier:
    atelier = db.query(Atelier).filter(
        Atelier.id == atelier_id, Atelier.user_id == user_id
    ).first()
    if not atelier:
        raise HTTPException(status_code=404, detail="Atelier introuvable.")
    return atelier


@router.get("", response_model=List[AtelierOut])
def lister_ateliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("multiAtelier")),
):
    return (
        db.query(Atelier)
        .filter(Atelier.user_id == current_user.id)
        .order_by(Atelier.created_at.asc())
        .all()
    )


@router.post("", response_model=AtelierOut, status_code=201)
def creer_atelier(
    payload: AtelierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("multiAtelier")),
):
    nb = db.query(Atelier).filter(Atelier.user_id == current_user.id).count()
    if nb >= MAX_ATELIERS:
        raise HTTPException(
            status_code=403,
            detail=f"Le forfait Elite permet au maximum {MAX_ATELIERS} ateliers.",
        )

    atelier = Atelier(user_id=current_user.id, **payload.model_dump())
    db.add(atelier)
    db.commit()
    db.refresh(atelier)
    return atelier


@router.put("/{atelier_id}", response_model=AtelierOut)
def modifier_atelier(
    atelier_id: str,
    payload: AtelierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("multiAtelier")),
):
    atelier = _get_atelier_or_404(db, atelier_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(atelier, field, value)
    db.commit()
    db.refresh(atelier)
    return atelier


@router.delete("/{atelier_id}", status_code=204)
def supprimer_atelier(
    atelier_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("multiAtelier")),
):
    atelier = _get_atelier_or_404(db, atelier_id, current_user.id)
    db.delete(atelier)
    db.commit()
