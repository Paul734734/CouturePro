import type { Facture } from "@/types";
import { formatFCFA, formatDate } from "@/lib/utils";

// NOTE: Cette app utilise surtout Factures.tsx qui génère un HTML pour l'impression.
// pdfGenerator.ts peut être appelé par d'autres pages; ici on ne touche qu'au CSS.

interface DonneesFacture {
  facture: any; // compatibilité avec les champs réellement présents (Factures.tsx)
  cliente?: any;
  commande?: any;
}

function genererHTMLFacture(data: DonneesFacture): string {
  const { facture, cliente, commande } = data as any;

  const typeLabel =
    facture.type === "facture" ? "FACTURE" : facture.type === "devis" ? "DEVIS" : "REÇU";

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Inter, sans-serif; color: #1f2937; background: #fff; }
        .header { background: #f97316; color: white; padding: 32px 40px; display: flex; justify-content: space-between; align-items: flex-start; }
        .header h1 { font-size: 22px; font-weight: 700; }
        .header p { font-size: 13px; opacity: 0.85; margin-top: 4px; }
        .badge-type { background: rgba(255,255,255,0.2); border-radius: 8px; padding: 6px 16px; font-size: 13px; font-weight: 700; letter-spacing: 1px; }
        .numero { font-size: 12px; opacity: 0.8; margin-top: 4px; text-align: right; }
        .body { padding: 32px 40px; }
        .infos-row { display: flex; justify-content: space-between; margin-bottom: 28px; }
        .infos-bloc h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 6px; }
        .infos-bloc p { font-size: 14px; color: #1f2937; }
        .infos-bloc .nom { font-weight: 700; font-size: 15px; }
        .divider { border: none; border-top: 1px solid #f3f4f6; margin: 20px 0; }
        .tableau { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .tableau { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        /* En-têtes de colonnes */
        .tableau thead tr { background: #fff7ed; }
        .tableau thead th {
          padding: 10px 12px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #b45309;
          font-weight: 800;
        }
        .tableau tbody td { padding: 14px 12px; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
        .tableau tbody td.montant { text-align: right; font-weight: 700; }

        /* Totaux */
        .totaux { margin-left: auto; width: 320px; }
        .totaux-ligne { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
        .totaux-ligne .label { color: #6b7280; }

        /* Reste à payer (total) : fond orange + texte blanc */
        .totaux-ligne.total {
          margin-top: 10px;
          font-weight: 900;
          font-size: 16px;
          color: white;
          border-bottom: none;
          padding: 12px 16px;
          background: #f97316;
          border-radius: 12px;
        }

        .hr-orange {
          border: none;
          border-top: 2px solid #f97316;
          margin: 18px 0;
        }

        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; }

        .footer p { font-size: 12px; color: #9ca3af; }
        .footer .merci { font-size: 14px; color: #f97316; font-weight: 600; margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${facture.nomAtelier}</h1>
          <p>Couturière professionnelle</p>
        </div>
        <div style="text-align:right">
          <div class="badge-type">${typeLabel}</div>
          <div class="numero">${facture.numero}</div>
        </div>
      </div>
      <div class="body">
        <div class="infos-row">
          <div class="infos-bloc">
            <h3>Cliente</h3>
            <p class="nom">${cliente.nom} ${cliente.prenom}</p>
            <p>${cliente.telephone}</p>
            <p>${cliente.ville}${cliente.quartier ? ", " + cliente.quartier : ""}</p>
          </div>
          <div class="infos-bloc" style="text-align:right">
            <h3>Date d'émission</h3>
            <p>${formatDate(facture.dateEmission)}</p>
            ${
              facture.dateEcheance
                ? `<h3 style="margin-top:12px">Date d'échéance</h3><p>${formatDate(facture.dateEcheance)}</p>`
                : ""
            }
          </div>
        </div>
        <hr class="divider" />
        <table class="tableau">
          <thead>
            <tr>
              <th>Description</th>
              <th>Type</th>
              <th style="text-align:right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${commande.description || facture.commandeLabel}</td>
              <td>${commande.typeVetement}</td>
              <td class="montant">${formatFCFA(facture.prixTotal)}</td>
            </tr>
          </tbody>
        </table>
        <div class="totaux">
          <div class="totaux-ligne">
            <span class="label">Sous-total</span>
            <span>${formatFCFA(facture.prixTotal)}</span>
          </div>
          <div class="totaux-ligne">
            <span class="label">Avance reçue</span>
            <span class="valeur-verte">- ${formatFCFA(facture.avancePaye)}</span>
          </div>
          <div class="totaux-ligne total">
            <span>Reste à payer</span>
            <span class="${facture.resteAPayer === 0 ? "valeur-verte" : "valeur-rouge"}">${formatFCFA(facture.resteAPayer)}</span>
          </div>
        </div>
        ${
          facture.note
            ? `<div style="margin-top:24px; background:#fff7ed; border-radius:12px; padding:14px 16px;"><p style="font-size:12px; color:#9a3412; font-weight:600; margin-bottom:4px;">NOTE</p><p style="font-size:13px; color:#7c3d12;">${facture.note}</p></div>`
            : ""
        }
        <div class="footer">
          <p class="merci">Merci pour votre confiance 🙏</p>
          <p>Ce document a été généré par Couture Pro</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function telechargerFacturePDF(data: DonneesFacture): void {
  const html = genererHTMLFacture(data);
  const fenetre = window.open("", "_blank");
  if (!fenetre) {
    alert("Autorisez les popups pour télécharger le PDF.");
    return;
  }
  fenetre.document.write(html);
  fenetre.document.close();
  fenetre.focus();
  setTimeout(() => {
    fenetre.print();
    fenetre.close();
  }, 500);
}

export async function partagerFacture(facture: any): Promise<void> {
  if (!navigator.share) {
    alert("Le partage n'est pas supporté sur ce navigateur.");
    return;
  }

  // Compat champs (Factures.tsx) : facture.type / facture.clienteNom / facture.montantTotal / facture.reste
  await navigator.share({
    title: `${facture.type === "facture" ? "Facture" : facture.type === "devis" ? "Devis" : "Reçu"} - ${facture.clienteNom ?? "Client"}`,
    text: `Montant: ${formatFCFA(facture.montantTotal ?? facture.prixTotal ?? 0)} | Reste: ${formatFCFA(facture.reste ?? facture.resteAPayer ?? 0)}`,
  });
}


export { genererHTMLFacture };
