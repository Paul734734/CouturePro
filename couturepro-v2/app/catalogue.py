from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/catalogue", response_model=list[schemas.CatalogueOut])
def get_catalogue(db: Session = Depends(get_db)):
    return db.query(models.Catalogue).all()

@router.post("/catalogue", response_model=schemas.CatalogueOut)
def add_item(item: schemas.CatalogueCreate, db: Session = Depends(get_db)):
    db_item = models.Catalogue(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
