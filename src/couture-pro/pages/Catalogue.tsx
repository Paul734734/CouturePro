import { useEffect } from "react";
import { useCatalogueStore } from "../stores/catalogueStore";

export default function Catalogue() {
  const { catalogue, fetchCatalogue } = useCatalogueStore();

  useEffect(() => {
    fetchCatalogue();
  }, []);

  return (
    <div className="catalogue-grid">
      {catalogue.map((item) => (
        <div key={item.id} className="catalogue-card">
          <img src={item.imageUrl} alt={item.nom} />
          <h3>{item.nom}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
