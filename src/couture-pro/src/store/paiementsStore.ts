import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Paiement } from "@/types";
import type { Commande } from "@/types";



import { genererIdUnique, calculReste } from "@/lib/utils";
import { useCommandesStore } from "./commandesStore";

type SuiviPaiement = {
  commandeId?: string
  clienteNom?: string
  commandeLabel?: string
  prixTotal?: number
  totalPaye: number
  resteAPayer: number
  statut: 'solde' | 'impaye' | 'partiel'
  paiements: Paiement[]
}

interface PaiementsState {
  paiements: Paiement[];

  ajouterPaiement: (
    data: {
      commandeId: string
      montant: number
      type: 'avance' | 'solde' | 'partiel'
      date: string
      notes?: string
    },

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
        const commandes = useCommandesStore.getState().commandes.filter((c) => c.userId === userId)

        return commandes.map((cmd) => {
          const paiementsCmd = get().getPaiementsByCommande(cmd.id)
          const totalPaye = paiementsCmd.reduce((s, p) => s + p.montant, 0)
          const reste = calculReste(cmd.prixTotal, totalPaye)

          return {
            commandeId: cmd.id,
            // Certaines données de commande peuvent ne pas porter directement clienteNom.
            clienteNom: (cmd as any).clienteNom ?? '',
            commandeLabel: cmd.typeVetement,
            prixTotal: cmd.prixTotal,
            totalPaye: Math.max(0, cmd.avancePaye ?? totalPaye),
            resteAPayer: Math.max(0, reste),
            statut:
              Math.max(0, reste) === 0
                ? 'solde'
                : Math.max(0, totalPaye) === 0
                  ? 'impaye'
                  : 'partiel',
            paiements: paiementsCmd,
          } satisfies SuiviPaiement
        })
      },


      getTotalEncaisseByUser: (userId) => {
        const commandes = useCommandesStore.getState().commandes.filter((c) => c.userId === userId);
        return commandes.reduce((s, c) => s + Math.max(0, c.avancePaye ?? 0), 0);
      },

      getTotalResteByUser: (userId) => {
        const commandes = useCommandesStore.getState().commandes.filter((c) => c.userId === userId);
        return commandes
          .filter((c) => c.statut !== 'annule' && c.statut !== 'livre')
          .reduce((s, c) => s + Math.max(0, c.resteAPayer ?? 0), 0);
      },

    }),
    {
      name: "couture-pro-paiements",
    }
  )
);
