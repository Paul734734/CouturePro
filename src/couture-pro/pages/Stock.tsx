import { useEffect } from "react";
import { useStockStore } from "../stores/stockStore";

export default function Stock() {
  const { stock, fetchStock } = useStockStore();

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Quantité</th>
          <th>Catégorie</th>
        </tr>
      </thead>
      <tbody>
        {stock.map((s) => (
          <tr key={s.id}>
            <td>{s.nom}</td>
            <td>{s.quantite}</td>
            <td>{s.categorie}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
