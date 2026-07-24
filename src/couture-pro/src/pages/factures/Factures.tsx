import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFacturesStore } from "@/store/facturesStore";
import { formatMontant, formatDate } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";

const statutColor: Record<string, { bg: string; color: string; label: string }> = {
  payee: { bg: "#dcfce7", color: "#16a34a", label: "Payée" },
  partielle: { bg: "#fcf6e0", color: "#C9A227", label: "Partielle" },
  impayee: { bg: "#fee2e2", color: "#ef4444", label: "Impayée" },
};

function Factures() {
  const navigate = useNavigate();
  const { factures, fetchFactures, supprimerFacture, isLoading, error } = useFacturesStore();

  useEffect(() => {
    fetchFactures();
  }, [fetchFactures]);

  if (isLoading) {
    return (
      <AppLayout titre="Factures" sousTitre="Factures, devis et reçus">
        <p style={{ color: "#888", fontSize: 14 }}>Chargement...</p>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout titre="Factures" sousTitre="Factures, devis et reçus">
        <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout titre="Factures" sousTitre="Factures, devis et reçus">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Factures</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
            {factures.length} document{factures.length > 1 ? "s" : ""} au total
          </p>
        </div>

        {factures.length === 0 ? (
          <div style={{
            background: "white", borderRadius: 16, border: "1px solid #f0ede8",
            padding: "48px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
            <p style={{ color: "#888", fontSize: 14, margin: 0 }}>Aucune facture pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {factures.map((f) => {
              const sc = statutColor[f.statut] || { bg: "#f3f4f6", color: "#555", label: f.statut };
              return (
                <div
                  key={f.id}
                  onClick={() => navigate(`/factures/${f.id}`)}
                  className="cp-grid-row-3auto2"
                  style={{
                    background: "white", borderRadius: 16, border: "1px solid #f0ede8",
                    padding: "20px 24px", cursor: "pointer",
                    gap: 20,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(201, 162, 39,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{f.numero}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{f.clienteNom}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Montant</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{formatMontant(f.montantTotal)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Date</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(f.dateEmission)}</div>
                  </div>
                  <span className="cp-row-status-col" style={{
                    fontSize: 12, padding: "5px 14px", borderRadius: 50, fontWeight: 600,
                    background: sc.bg, color: sc.color, whiteSpace: "nowrap",
                  }}>
                    {sc.label}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); supprimerFacture(f.id); }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 18, color: "#aaa", padding: 8, alignSelf: "center",
                    }}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Factures;
