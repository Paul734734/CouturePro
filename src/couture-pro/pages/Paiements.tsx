import { useEffect } from "react";
import { usePaiementsStore } from "../stores/paiementsStore";

export default function Paiements() {
  const { paiements, fetchPaiements } = usePaiementsStore();

  useEffect(() => {
    fetchPaiements();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Cliente</th>
          <th>Commande</th>
          <th>Montant</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {paiements.map((p) => (
          <tr key={p.id}>
            <td>{p.date}</td>
            <td>{p.clienteNom}</td>
            <td>{p.commandeLabel}</td>
            <td>{p.montant} FCFA</td>
            <td>{p.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
