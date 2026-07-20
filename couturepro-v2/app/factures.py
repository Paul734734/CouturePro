from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/factures", response_model=list[schemas.FactureOut])
def get_factures(db: Session = Depends(get_db)):
    return db.query(models.Facture).all()

@router.post("/factures", response_model=schemas.FactureOut)
def create_facture(facture: schemas.FactureCreate, db: Session = Depends(get_db)):
    db_facture = models.Facture(**facture.dict())
    db.add(db_facture)
    db.commit()
    db.refresh(db_facture)
    return db_facture
