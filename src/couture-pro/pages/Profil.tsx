import { useEffect } from "react";
import { useProfilStore } from "../stores/profilStore";

export default function Profil() {
  const { profil, fetchProfil } = useProfilStore();

  useEffect(() => {
    fetchProfil();
  }, []);

  if (!profil) return <p>Chargement...</p>;

  return (
    <div className="profil-container">
      <img src={profil.logoUrl} alt="Logo atelier" className="profil-logo" />
      <h2>{profil.nomAtelier}</h2>
      <p>{profil.description}</p>
      <p><strong>Contact :</strong> {profil.contact}</p>
      <p><strong>Localisation :</strong> {profil.localisation}</p>
    </div>
  );
}
