import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Commande, FormulaireCommande, StatutCommande } from "@/types";
import { genererIdUnique, calculReste } from "@/lib/utils";

interface CommandesState {
  commandes: Commande[];
  ajouterCommande: (data: FormulaireCommande, userId: string) => void;
  modifierCommande: (id: string, data: Partial<Commande>) => void;
  changerStatut: (id: string, statut: StatutCommande) => void;
  supprimerCommande: (id: string) => void;
  getCommandeById: (id: string) => Commande | undefined;
  getCommandesByUser: (userId: string) => Commande[];
  getCommandesByCliente: (clienteId: string) => Commande[];
}

export const useCommandesStore = create<CommandesState>()(
  persist(
    (set, get) => ({
      commandes: [],

      ajouterCommande: (data, userId) => {
        const nouvelle: Commande = {
          ...data,
          id: genererIdUnique(),
          userId,
          dateCommande: new Date().toISOString(),
          resteAPayer: calculReste(data.prixTotal, data.avancePaye),
        };
        set((state) => ({ commandes: [...state.commandes, nouvelle] }));
      },

      modifierCommande: (id, data) => {
        set((state) => ({
          commandes: state.commandes.map((c) => {
            if (c.id !== id) return c;
            const updated = { ...c, ...data };
            const prixTotal = updated.prixTotal ?? c.prixTotal;
            const avancePaye = updated.avancePaye ?? c.avancePaye;
            updated.resteAPayer = calculReste(prixTotal, avancePaye);
            return updated;
          }),
        }));
      },

      changerStatut: (id, statut) => {
        set((state) => ({
          commandes: state.commandes.map((c) => (c.id === id ? { ...c, statut } : c)),
        }));
      },

      supprimerCommande: (id) => {
        set((state) => ({
          commandes: state.commandes.filter((c) => c.id !== id),
        }));
      },

      getCommandeById: (id) => {
        return get().commandes.find((c) => c.id === id);
      },

      getCommandesByUser: (userId) => {
        return get().commandes.filter((c) => c.userId === userId);
      },

      getCommandesByCliente: (clienteId) => {
        return get().commandes.filter((c) => c.clienteId === clienteId);
      },
    }),
    {
      name: "couture-pro-commandes",
    }
  )
);
