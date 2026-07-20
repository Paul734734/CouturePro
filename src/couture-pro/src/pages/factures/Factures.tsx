import { useEffect } from "react";
import { useFacturesStore } from "@/store/facturesStore";
import AppLayout from "@/components/AppLayout";

function Factures() {
  const { factures, fetchFactures, supprimerFacture, isLoading, error } = useFacturesStore();

  useEffect(() => {
    fetchFactures();
  }, [fetchFactures]);

  if (isLoading) {
    return <AppLayout titre="Factures"><p>Chargement...</p></AppLayout>;
  }

  if (error) {
    return <AppLayout titre="Factures"><p style={{color:"red"}}>{error}</p></AppLayout>;
  }

  return (
    <AppLayout titre="Factures">
      <h2>Liste des factures</h2>
      <ul>
        {factures.map((f) => (
          <li key={f.id} style={{margin:"10px 0"}}>
            <strong>Commande {f.commandeId}</strong> — {f.montant} FCFA
            <br />
            Date : {new Date(f.date).toLocaleDateString()}
            <br />
            Notes : {f.notes || ""}
            <br />
            <button onClick={() => supprimerFacture(f.id)}>🗑️ Supprimer</button>
          </li>
        ))}
      </ul>
    </AppLayout>
  );
}

export default Factures;
