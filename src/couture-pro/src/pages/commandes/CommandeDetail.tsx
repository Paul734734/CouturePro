import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCommandesStore } from "@/store/commandesStore";
import { usePaiementsStore } from "@/store/paiementsStore";
import { useFacturesStore } from "@/store/facturesStore";
import AppLayout from "@/components/layout/AppLayout";
import { useClientesStore } from "@/store/clientesStore";

const card: CSSProperties = {
  background: "white",
  borderRadius: 16,
  border: "1px solid #f0ede8",
  padding: 24,
  marginBottom: 20,
};

const label: CSSProperties = { fontSize: 12, color: "#888", marginBottom: 4 };
const value: CSSProperties = { fontSize: 16, fontWeight: 600, color: "#1a1a1a" };

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e5e0d8",
  fontSize: 14,
  outline: "none",
};

const btnPrimary: CSSProperties = {
  background: "#C9A227",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

const btnSecondary: CSSProperties = {
  background: "white",
  color: "#1a1a1a",
  border: "1.5px solid #e5e0d8",
  borderRadius: 10,
  padding: "10px 18px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
};

function CommandeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { commandes, fetchCommandes } = useCommandesStore();
  const { ajouterPaiement } = usePaiementsStore();
  const { factures, fetchFactures, ajouterFacture } = useFacturesStore();
  const [montant, setMontant] = useState("");
  const [genererFactureLoading, setGenererFactureLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetchCommandes();
    fetchFactures();
  }, [fetchCommandes, fetchFactures]);

  const commande = commandes.find((c) => c.id === id);
  const clienteNom = useClientesStore((s) =>
    commande ? s.getClienteById(commande.clienteId)?.nom : undefined
  );

  const factureLiee = commande
    ? factures.find((f) => f.commandeId === commande.id)
    : undefined;

  if (!commande) {
    return (
      <AppLayout titre="Commande">
        <p>Commande introuvable</p>
      </AppLayout>
    );
  }

  const resteAPayer = commande.prixTotal - commande.avancePaye;

  const handlePaiement = async () => {
    const montantNum = parseFloat(montant);
    if (!montantNum || montantNum <= 0) return;

    // Détermination automatique du type
    let type: "avance" | "solde" | "partiel";
    if (montantNum === resteAPayer) {
      type = "solde";
    } else if (commande.avancePaye === 0) {
      type = "avance";
    } else {
      type = "partiel";
    }

    await ajouterPaiement({
      commandeId: commande.id,
      montant: montantNum,
      type,
      notes: "",
    });

    // Recharger les commandes après paiement
    await fetchCommandes();
    setMontant("");
  };

  const handleGenererFacture = async () => {
    setErreur("");
    setGenererFactureLoading(true);
    try {
      const facture = await ajouterFacture({
        clienteId: commande.clienteId,
        commandeId: commande.id,
        type: "facture",
        montantTotal: commande.prixTotal,
        montantPaye: commande.avancePaye,
      });
      navigate(`/factures/${facture.id}`);
    } catch (err: any) {
      setErreur(err.response?.data?.detail || "Erreur lors de la génération de la facture.");
    } finally {
      setGenererFactureLoading(false);
    }
  };

  return (
    <AppLayout titre="Détail de la commande" sousTitre={commande.typeVetement}>
      <div style={{ maxWidth: 640 }}>
        <div style={card}>
          <div className="cp-grid-2" style={{ gap: 18 }}>
            <div>
              <div style={label}>Cliente</div>
              <div style={value}>{clienteNom ?? "Inconnue"}</div>
            </div>
            <div>
              <div style={label}>Type de vêtement</div>
              <div style={value}>{commande.typeVetement}</div>
            </div>
            <div>
              <div style={label}>Statut</div>
              <div style={value}>{commande.statut}</div>
            </div>
            {commande.tempsConception != null && (
              <div>
                <div style={label}>Temps de conception estimé</div>
                <div style={value}>{commande.tempsConception} jour(s)</div>
              </div>
            )}
          </div>

          <div className="cp-grid-3" style={{ gap: 12, marginTop: 20, paddingTop: 20, borderTop: "1px solid #f0ede8" }}>
            <div>
              <div style={label}>Prix total</div>
              <div style={{ ...value, color: "#1a1a1a" }}>{commande.prixTotal.toLocaleString()} FCFA</div>
            </div>
            <div>
              <div style={label}>Total payé</div>
              <div style={{ ...value, color: "#16a34a" }}>{commande.avancePaye.toLocaleString()} FCFA</div>
            </div>
            <div>
              <div style={label}>Reste à payer</div>
              <div style={{ ...value, color: resteAPayer > 0 ? "#C9A227" : "#16a34a" }}>{resteAPayer.toLocaleString()} FCFA</div>
            </div>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>💰 Ajouter un paiement</h3>
          <div className="cp-form-row-mobile-col" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="Montant en FCFA"
              style={{ ...inputStyle, maxWidth: 220 }}
            />
            <button onClick={handlePaiement} className="cp-btn-mobile-full" style={btnPrimary}>Valider le paiement</button>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🧾 Facture</h3>
          {erreur && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>{erreur}</p>}
          {factureLiee ? (
            <div className="cp-form-row-mobile-col" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...value, overflowWrap: "break-word" }}>Facture {factureLiee.numero}</div>
                <div style={{ ...label, overflowWrap: "break-word" }}>
                  {factureLiee.montantPaye.toLocaleString()} / {factureLiee.montantTotal.toLocaleString()} FCFA — {factureLiee.statut}
                </div>
              </div>
              <button onClick={() => navigate(`/factures/${factureLiee.id}`)} className="cp-btn-mobile-full" style={btnSecondary}>
                Voir la facture
              </button>
            </div>
          ) : (
            <div className="cp-form-row-mobile-col" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <p style={{ fontSize: 13.5, color: "#666", margin: 0 }}>
                Aucune facture générée pour cette commande.
              </p>
              <button onClick={handleGenererFacture} disabled={genererFactureLoading} className="cp-btn-mobile-full" style={btnPrimary}>
                {genererFactureLoading ? "Génération..." : "Générer la facture"}
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default CommandeDetail;
