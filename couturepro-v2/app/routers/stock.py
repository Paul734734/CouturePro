from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, ArticleStock
from app.schemas import ArticleStockCreate, ArticleStockUpdate, ArticleStockOut
from app.dependencies import get_current_user
from app.atelier_scope import valider_atelier_id, filtrer_par_atelier

router = APIRouter(prefix="/api/stock", tags=["Stock"])


def _get_article_or_404(db: Session, article_id: str, user_id: str) -> ArticleStock:
    article = db.query(ArticleStock).filter(
        ArticleStock.id == article_id, ArticleStock.user_id == user_id
    ).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article de stock introuvable.")
    return article


@router.post("", response_model=ArticleStockOut, status_code=201)
def creer_article(
    payload: ArticleStockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valider_atelier_id(db, current_user, payload.atelier_id)
    article = ArticleStock(user_id=current_user.id, **payload.model_dump())
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.get("", response_model=List[ArticleStockOut])
def lister_stock(
    categorie: Optional[str] = None,
    alerte: Optional[bool] = None,
    atelier_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ArticleStock).filter(ArticleStock.user_id == current_user.id)
    query = filtrer_par_atelier(query, ArticleStock, atelier_id)
    if categorie:
        query = query.filter(ArticleStock.categorie == categorie)
    articles = query.order_by(ArticleStock.nom.asc()).all()
    if alerte:
        articles = [a for a in articles if a.seuil_alerte is not None and a.quantite <= a.seuil_alerte]
    return articles


@router.get("/{article_id}", response_model=ArticleStockOut)
def obtenir_article(
    article_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_article_or_404(db, article_id, current_user.id)


@router.put("/{article_id}", response_model=ArticleStockOut)
def modifier_article(
    article_id: str,
    payload: ArticleStockUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = _get_article_or_404(db, article_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(article, field, value)
    db.commit()
    db.refresh(article)
    return article


@router.delete("/{article_id}", status_code=204)
def supprimer_article(
    article_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = _get_article_or_404(db, article_id, current_user.id)
    db.delete(article)
    db.commit()
