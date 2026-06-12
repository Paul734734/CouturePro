import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Paiement, SuiviPaiement, FormulairePaiement } from "@/types";
import { genererIdUnique, calculReste } from "@/lib/utils";
import { useCommandesStore } from "./commandesStore";

interface PaiementsState {
  paiements: Paiement[];
  ajouterPaiement: (
    data: FormulairePaiement,
    userId: string,
    clienteNom: string,
    commandeLabel: string
  ) => void;
  getPaiementsByUser: (userId: string) => Paiement[];
  getPaiementsByCommande: (commandeId: string) => Paiement[];
  getSuiviByUser: (userId: string) => SuiviPaiement[];
  getTotalEncaisseByUser: (userId: string) => number;
  getTotalResteByUser: (userId: string) => number;
}

export const usePaiementsStore = create<PaiementsState>()(
  persist(
    (set, get) => ({
      paiements: [],

      ajouterPaiement: (data, userId, clienteNom, commandeLabel) => {
        const nouveau: Paiement = {
          ...data,
          id: genererIdUnique(),
          userId,
          clienteNom,
          commandeLabel,
          date: new Date().toISOString(),
        };

        set((state) => ({ paiements: [...state.paiements, nouveau] }));

        const commandes = useCommandesStore.getState();
        const commande = commandes.getCommandeById(data.commandeId);
        if (commande) {
          const nouveauTotal = commande.avancePaye + data.montant;
          commandes.modifierCommande(data.commandeId, {
            avancePaye: nouveauTotal,
            resteAPayer: calculReste(commande.prixTotal, nouveauTotal),
          });
        }
      },

      getPaiementsByUser: (userId) => {
        return get().paiements.filter((p) => p.userId === userId);
      },

      getPaiementsByCommande: (commandeId) => {
        return get().paiements.filter((p) => p.commandeId === commandeId);
      },

      getSuiviByUser: (userId) => {
        const commandes = useCommandesStore.getState().getCommandesByUser(userId);

        return commandes.map((cmd) => {
          const paiementsCmd = get().getPaiementsByCommande(cmd.id);
          const totalPaye = paiementsCmd.reduce((s, p) => s + p.montant, 0);
          const reste = calculReste(cmd.prixTotal, totalPaye);
          return {
            commandeId: cmd.id,
            clienteNom: cmd.clienteNom,
            commandeLabel: cmd.typeVetement,
            prixTotal: cmd.prixTotal,
            totalPaye,
            resteAPayer: reste,
            statut: reste === 0 ? "solde" : totalPaye === 0 ? "impaye" : "partiel",
            paiements: paiementsCmd,
          } satisfies SuiviPaiement;
        });
      },

      getTotalEncaisseByUser: (userId) => {
        return get().getPaiementsByUser(userId).reduce((s, p) => s + p.montant, 0);
      },

      getTotalResteByUser: (userId) => {
        return get().getSuiviByUser(userId).reduce((s, p) => s + p.resteAPayer, 0);
      },
    }),
    {
      name: "couture-pro-paiements",
    }
  )
);
