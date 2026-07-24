import { useEffect } from "react";
import { usePaiementsStore } from "@/store/paiementsStore";
import { formatMontant, formatDate } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";

function Paiements() {
  const { paiements, fetchPaiements, isLoading, error } = usePaiementsStore();

  useEffect(() => {
    fetchPaiements();
  }, [fetchPaiements]);

  if (isLoading) {
    return (
      <AppLayout titre="Paiements" sousTitre="Historique des paiements reçus">
        <p style={{ color: "#888", fontSize: 14 }}>Chargement des paiements...</p>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout titre="Paiements" sousTitre="Historique des paiements reçus">
        <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout titre="Paiements" sousTitre="Historique des paiements reçus">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Paiements</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
            {paiements.length} paiement{paiements.length > 1 ? "s" : ""} enregistré{paiements.length > 1 ? "s" : ""}
          </p>
        </div>

        {paiements.length === 0 ? (
          <div style={{
            background: "white", borderRadius: 16, border: "1px solid #f0ede8",
            padding: "48px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
            <p style={{ color: "#888", fontSize: 14, margin: 0 }}>Aucun paiement enregistré pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {paiements.map((p) => (
              <div
                key={p.id}
                className="cp-grid-row-3auto"
                style={{
                  background: "white", borderRadius: 16, border: "1px solid #f0ede8",
                  padding: "20px 24px",
                  gap: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%", background: "#FBF3DC",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color: "#C9A227", flexShrink: 0,
                  }}>
                    {p.clienteNom?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{p.clienteNom}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{p.commandeLabel}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Montant</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#16a34a" }}>{formatMontant(p.montant)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Date</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(p.date)}</div>
                </div>
                <span style={{
                  fontSize: 12, padding: "5px 14px", borderRadius: 50, fontWeight: 600,
                  background: "#FBF3DC", color: "#C9A227", whiteSpace: "nowrap",
                }}>
                  {p.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Paiements;
