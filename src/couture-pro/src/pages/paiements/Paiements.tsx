import { useEffect } from "react";
import { usePaiementsStore } from "@/store/paiementsStore";
import AppLayout from "@/components/layout/AppLayout";

function Paiements() {
  const { paiements, fetchPaiements, isLoading, error } = usePaiementsStore();

  useEffect(() => {
    fetchPaiements(); // charge tous les paiements enrichis depuis /api/paiements
  }, [fetchPaiements]);

  if (isLoading) {
    return (
      <AppLayout titre="Paiements">
        <p>Chargement des paiements...</p>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout titre="Paiements">
        <p style={{ color: "red" }}>{error}</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout titre="Paiements">
      <h2>Historique des paiements</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th>Cliente</th>
            <th>Commande</th>
            <th>Montant</th>
            <th>Type</th>
            <th>Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {paiements.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{p.clienteNom}</td>
              <td>{p.commandeLabel}</td>
              <td>{p.montant} FCFA</td>
              <td>{p.type}</td>
              <td>{new Date(p.date).toLocaleDateString()}</td>
              <td>{p.notes || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppLayout>
  );
}

export default Paiements;
