import os
from fpdf import FPDF

from app.models import Facture

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


def _libelle_type(type_document: str) -> str:
    return {"facture": "FACTURE", "recu": "RECU", "devis": "DEVIS"}.get(type_document, "FACTURE")


def generer_pdf_facture(facture: Facture) -> str:
    """Genere le PDF sur disque et renvoie le chemin relatif (a servir via /uploads)."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)

    # en-tete atelier
    if facture.logo_atelier:
        logo_path = os.path.join(UPLOAD_DIR, os.path.basename(facture.logo_atelier))
        if os.path.exists(logo_path):
            pdf.image(logo_path, x=10, y=10, w=30)
            pdf.ln(25)

    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, facture.nom_atelier or "Atelier de couture", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 15, _libelle_type(facture.type.value if hasattr(facture.type, "value") else facture.type), new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 7, f"Numero : {facture.numero}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"Date d'emission : {facture.date_emission.strftime('%d/%m/%Y')}", new_x="LMARGIN", new_y="NEXT")
    if facture.date_echeance:
        pdf.cell(0, 7, f"Date d'echeance : {facture.date_echeance.strftime('%d/%m/%Y')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Client", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, facture.cliente_nom, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    if facture.commande_description:
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "Description", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 7, facture.commande_description)
        pdf.ln(5)

    # tableau des montants
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_fill_color(230, 230, 230)
    pdf.cell(120, 8, "Libelle", border=1, fill=True)
    pdf.cell(60, 8, "Montant (FCFA)", border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 11)
    pdf.cell(120, 8, "Montant total", border=1)
    pdf.cell(60, 8, f"{facture.montant_total:,.0f}".replace(",", " "), border=1, new_x="LMARGIN", new_y="NEXT")

    pdf.cell(120, 8, "Montant paye", border=1)
    pdf.cell(60, 8, f"{facture.montant_paye:,.0f}".replace(",", " "), border=1, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(120, 8, "Reste a payer", border=1)
    pdf.cell(60, 8, f"{facture.montant_reste:,.0f}".replace(",", " "), border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    if facture.notes:
        pdf.set_font("Helvetica", "I", 10)
        pdf.multi_cell(0, 6, f"Notes : {facture.notes}")

    filename = f"{facture.user_id}_{facture.numero.replace('/', '-')}.pdf"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(UPLOAD_DIR, filename)
    pdf.output(filepath)

    return f"/uploads/{filename}"
