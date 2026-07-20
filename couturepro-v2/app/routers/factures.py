from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app import models

router = APIRouter(
    prefix="/api/factures",
    tags=["factures"]
)

class FactureResponse(BaseModel):
    id: int
    numeroFacture: str
    commandeId: int
    clienteNom: Optional[str] = None
    commandeLabel: Optional[str] = None
    montantTotal: float
    montantPaye: float
    resteAPayer: float
    statut: str
    dateEmission: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[FactureResponse])
def get_factures(db: Session = Depends(get_db)):
    commandes = db.query(models.Commande).all()
    factures = []

    for cmd in commandes:
        cliente = db.query(models.Cliente).filter(models.Cliente.id == cmd.cliente_id).first()
        paiements = db.query(models.Paiement).filter(models.Paiement.commande_id == cmd.id).all()
        
        total_paye = sum(p.montant for p in paiements)
        total_cmd = getattr(cmd, 'prix_total', getattr(cmd, 'montant', 0.0))
        reste = max(0.0, total_cmd - total_paye)

        if reste == 0 and total_cmd > 0:
            statut = "Payée"
        elif total_paye > 0:
            statut = "Partiellement payée"
        else:
            statut = "En attente"

        factures.append(FactureResponse(
            id=cmd.id,
            numeroFacture=f"FAC-{cmd.id:04d}",
            commandeId=cmd.id,
            clienteNom=f"{cliente.prenom} {cliente.nom}" if cliente else "Cliente inconnue",
            commandeLabel=getattr(cmd, 'description', getattr(cmd, 'titre', f"Commande #{cmd.id}")),
            montantTotal=total_cmd,
            montantPaye=total_paye,
            resteAPayer=reste,
            statut=statut,
            dateEmission=getattr(cmd, 'date_creation', datetime.now())
        ))

    return factures
