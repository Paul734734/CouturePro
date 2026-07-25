from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, ArticleCatalogue
from app.schemas import ArticleCatalogueCreate, ArticleCatalogueUpdate, ArticleCatalogueOut
from app.dependencies import get_current_user
from app.atelier_scope import valider_atelier_id, filtrer_par_atelier

router = APIRouter(prefix="/api/catalogue", tags=["Catalogue"])


def _get_item_or_404(db: Session, item_id: str, user_id: str) -> ArticleCatalogue:
    item = db.query(ArticleCatalogue).filter(
        ArticleCatalogue.id == item_id, ArticleCatalogue.user_id == user_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Modèle de catalogue introuvable.")
    return item


@router.post("", response_model=ArticleCatalogueOut, status_code=201)
def creer_item(
    payload: ArticleCatalogueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valider_atelier_id(db, current_user, payload.atelier_id)
    item = ArticleCatalogue(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("", response_model=List[ArticleCatalogueOut])
def lister_catalogue(
    categorie: Optional[str] = None,
    actif: Optional[bool] = None,
    atelier_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ArticleCatalogue).filter(ArticleCatalogue.user_id == current_user.id)
    query = filtrer_par_atelier(query, ArticleCatalogue, atelier_id)
    if categorie:
        query = query.filter(ArticleCatalogue.categorie == categorie)
    if actif is not None:
        query = query.filter(ArticleCatalogue.actif == actif)
    return query.order_by(ArticleCatalogue.date_ajout.desc()).all()


@router.get("/{item_id}", response_model=ArticleCatalogueOut)
def obtenir_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_item_or_404(db, item_id, current_user.id)


@router.put("/{item_id}", response_model=ArticleCatalogueOut)
def modifier_item(
    item_id: str,
    payload: ArticleCatalogueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = _get_item_or_404(db, item_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def supprimer_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = _get_item_or_404(db, item_id, current_user.id)
    db.delete(item)
    db.commit()
