import { useEffect } from "react";
import { useFacturesStore } from "../stores/facturesStore";

export default function Factures() {
  const { factures, fetchFactures } = useFacturesStore();

  useEffect(() => {
    fetchFactures();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Commande</th>
          <th>Montant</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {factures.map((f) => (
          <tr key={f.id}>
            <td>{f.date}</td>
            <td>{f.commandeId}</td>
            <td>{f.montant} FCFA</td>
            <td>{f.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
