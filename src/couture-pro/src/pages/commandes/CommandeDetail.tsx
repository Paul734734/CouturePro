import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCommandesStore } from "@/store/commandesStore";
import { usePaiementsStore } from "@/store/paiementsStore";
import AppLayout from "@/components/layout/AppLayout";
import { useClientesStore } from "@/store/clientesStore";

function CommandeDetail() {
  const { id } = useParams();
  const { commandes, fetchCommandes } = useCommandesStore();
  const { ajouterPaiement } = usePaiementsStore();
  const [montant, setMontant] = useState("");

  useEffect(() => {
    fetchCommandes();
  }, [fetchCommandes]);

  const commande = commandes.find((c) => c.id === id);
  const clienteNom = useClientesStore((s) =>
    commande ? s.getClienteById(commande.clienteId)?.nom : undefined
  );
  if (!commande) {
    return (
      <AppLayout titre="Commande">
        <p>Commande introuvable</p>
      </AppLayout>
    );
  }

  const handlePaiement = async () => {
    const resteAPayer = commande.prixTotal - commande.avancePaye;
    const montantNum = parseFloat(montant);

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

  return (
    <AppLayout titre="Commande">
      <h2>Détails de la commande</h2>
      <p>Cliente : {clienteNom ?? "Inconnue"}</p>
      <p>Type vêtement : {commande.typeVetement}</p>
      <p>Prix total : {commande.prixTotal} FCFA</p>
      <p>Total payé : {commande.avancePaye} FCFA</p>
      <p>Reste à payer : {commande.prixTotal - commande.avancePaye} FCFA</p>
      {commande.tempsConception != null && (
        <p>Temps de conception estimé : {commande.tempsConception} jour(s)</p>
      )}

      <h3>Ajouter un paiement</h3>
      <input
        type="number"
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
        placeholder="Montant en FCFA"
      />
      <button onClick={handlePaiement}>Valider paiement</button>
    </AppLayout>
  );
}

export default CommandeDetail;
