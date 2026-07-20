from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/stock", response_model=list[schemas.StockOut])
def get_stock(db: Session = Depends(get_db)):
    return db.query(models.Stock).all()

@router.post("/stock", response_model=schemas.StockOut)
def add_stock(item: schemas.StockCreate, db: Session = Depends(get_db)):
    db_item = models.Stock(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
