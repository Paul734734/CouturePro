import csv
import io

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Facture, Paiement, Commande, Cliente
from app.dependencies import require_acces

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.get("/comptabilite")
def export_comptabilite(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_acces("exportCompta")),
):
    """Export CSV des factures et paiements de l'atelier — reservé au forfait Elite.
    Encodage UTF-8 avec BOM pour un affichage correct des accents dans Excel."""

    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output, delimiter=";")

    writer.writerow(["=== FACTURES ==="])
    writer.writerow(["Numero", "Date", "Cliente", "Montant total (FCFA)", "Montant paye (FCFA)", "Reste (FCFA)", "Statut"])
    factures = (
        db.query(Facture)
        .filter(Facture.user_id == current_user.id)
        .order_by(Facture.date_emission.asc())
        .all()
    )
    for f in factures:
        writer.writerow([
            f.numero,
            f.date_emission.strftime("%d/%m/%Y") if f.date_emission else "",
            f.cliente_nom or "",
            f"{f.montant_total or 0:.0f}",
            f"{f.montant_paye or 0:.0f}",
            f"{f.montant_reste or 0:.0f}",
            f.statut.value if hasattr(f.statut, "value") else f.statut,
        ])

    writer.writerow([])
    writer.writerow(["=== PAIEMENTS ==="])
    writer.writerow(["Date", "Cliente", "Montant (FCFA)", "Type"])
    paiements = (
        db.query(Paiement, Cliente.nom)
        .join(Commande, Commande.id == Paiement.commande_id)
        .join(Cliente, Cliente.id == Commande.cliente_id)
        .filter(Paiement.user_id == current_user.id)
        .order_by(Paiement.date.asc())
        .all()
    )
    for p, cliente_nom in paiements:
        writer.writerow([
            p.date.strftime("%d/%m/%Y") if p.date else "",
            cliente_nom or "",
            f"{p.montant or 0:.0f}",
            p.type.value if hasattr(p.type, "value") else p.type,
        ])

    csv_content = output.getvalue()
    filename = f"comptabilite-{(current_user.nom_atelier or 'couturepro').replace(' ', '-')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
