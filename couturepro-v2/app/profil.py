from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/profil", response_model=schemas.ProfilOut)
def get_profil(db: Session = Depends(get_db)):
    profil = db.query(models.Profil).first()
    return profil

@router.post("/profil", response_model=schemas.ProfilOut)
def update_profil(data: schemas.ProfilUpdate, db: Session = Depends(get_db)):
    profil = db.query(models.Profil).first()
    if profil:
        for key, value in data.dict(exclude_unset=True).items():
            setattr(profil, key, value)
    else:
        profil = models.Profil(**data.dict())
        db.add(profil)
    db.commit()
    db.refresh(profil)
    return profil
