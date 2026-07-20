from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/paiements", response_model=list[schemas.PaiementOutEnrichi])
def get_paiements(db: Session = Depends(get_db)):
    paiements = (
        db.query(models.Paiement)
        .options(
            joinedload(models.Paiement.commande).joinedload(models.Commande.cliente)
        )
        .all()
    )
    result = []
    for p in paiements:
        result.append({
            "id": str(p.id),
            "commandeId": str(p.commande_id),
            "montant": p.montant,
            "type": p.type,
            "date": p.date,
            "notes": p.notes,
            "clienteNom": p.commande.cliente.nom if p.commande and p.commande.cliente else None,
            "commandeLabel": p.commande.label if p.commande else None,
        })
    return result
