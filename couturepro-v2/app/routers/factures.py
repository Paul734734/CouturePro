from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Facture, Cliente, StatutFacture
from app.schemas import FactureCreate, FactureOut
from app.dependencies import require_acces
from app.acces import calculer_acces
from app.pdf_generator import generer_pdf_facture

router = APIRouter(prefix="/api/factures", tags=["Factures"])


def _get_facture_or_404(db: Session, facture_id: str, user_id: str) -> Facture:
    facture = db.query(Facture).filter(
        Facture.id == facture_id, Facture.user_id == user_id
    ).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture introuvable.")
    return facture


def _calculer_statut(montant_total: float, montant_paye: float) -> StatutFacture:
    if montant_paye <= 0:
        return StatutFacture.IMPAYEE
    if montant_paye >= montant_total:
        return StatutFacture.PAYEE
    return StatutFacture.PARTIELLE


def _prochain_numero(db: Session, user_id: str) -> str:
    nb = db.query(Facture).filter(Facture.user_id == user_id).count()
    return f"FAC-{nb + 1:03d}"


@router.post("", response_model=FactureOut, status_code=201)
def creer_facture(
    payload: FactureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("factures")),
):
    cliente = db.query(Cliente).filter(
        Cliente.id == payload.cliente_id, Cliente.user_id == current_user.id
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente introuvable.")

    data = payload.model_dump(exclude={"cliente_id"})
    montant_total = data.pop("montant_total", 0) or 0
    montant_paye = data.pop("montant_paye", 0) or 0
    montant_reste = max(0.0, montant_total - montant_paye)
    statut = _calculer_statut(montant_total, montant_paye)

    acces = calculer_acces(current_user)
    facture = Facture(
        user_id=current_user.id,
        cliente_id=cliente.id,
        cliente_nom=cliente.nom,
        numero=_prochain_numero(db, current_user.id),
        montant_total=montant_total,
        montant_paye=montant_paye,
        montant_reste=montant_reste,
        statut=statut,
        logo_atelier=current_user.logo_url if acces.get("logoPersonnalise") else None,
        nom_atelier=current_user.nom_atelier,
        **data,
    )
    db.add(facture)
    db.commit()
    db.refresh(facture)
    return facture


@router.get("", response_model=list[FactureOut])
def lister_factures(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("factures")),
):
    return db.query(Facture).filter(Facture.user_id == current_user.id).all()


@router.get("/{facture_id}", response_model=FactureOut)
def get_facture(
    facture_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("factures")),
):
    return _get_facture_or_404(db, facture_id, current_user.id)


@router.get("/{facture_id}/pdf")
def telecharger_pdf_facture(
    facture_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("factures")),
):
    facture = _get_facture_or_404(db, facture_id, current_user.id)
    pdf_bytes = generer_pdf_facture(facture)
    return Response(content=pdf_bytes, media_type="application/pdf")


@router.delete("/{facture_id}", status_code=204)
def supprimer_facture(
    facture_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("factures")),
):
    facture = _get_facture_or_404(db, facture_id, current_user.id)
    db.delete(facture)
    db.commit()
    return Response(status_code=204)
