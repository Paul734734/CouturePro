import { create } from "zustand";
import { api } from "@/lib/api";
import type { Commande, FormulaireCommande, StatutCommande } from "@/types";

interface CommandesState {
  commandes: Commande[];
  isLoading: boolean;
  error: string | null;

  fetchCommandes: (params?: { statut?: StatutCommande; clienteId?: string }) => Promise<void>;
  ajouterCommande: (data: FormulaireCommande) => Promise<Commande>;
  modifierCommande: (id: string, data: Partial<FormulaireCommande>) => Promise<Commande>;
  changerStatut: (id: string, statut: StatutCommande) => Promise<Commande>;
  supprimerCommande: (id: string) => Promise<void>;

  getCommandeById: (id: string) => Commande | undefined;
  getCommandesByCliente: (clienteId: string) => Commande[];
}

export const useCommandesStore = create<CommandesState>()((set, get) => ({
  commandes: [],
  isLoading: false,
  error: null,

  fetchCommandes: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Commande[]>("/api/commandes", { params });
      set({ commandes: data, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.detail || "Erreur lors du chargement des commandes.",
      });
    }
  },

  ajouterCommande: async (data) => {
    const { data: created } = await api.post<Commande>("/api/commandes", data);
    set((state) => ({ commandes: [created, ...state.commandes] }));
    return created;
  },

  modifierCommande: async (id, data) => {
    const { data: updated } = await api.put<Commande>(`/api/commandes/${id}`, data);
    set((state) => ({
      commandes: state.commandes.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  changerStatut: async (id, statut) => {
    const { data: updated } = await api.patch<Commande>(`/api/commandes/${id}/statut`, { statut });
    set((state) => ({
      commandes: state.commandes.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  supprimerCommande: async (id) => {
    await api.delete(`/api/commandes/${id}`);
    set((state) => ({ commandes: state.commandes.filter((c) => c.id !== id) }));
  },

  getCommandeById: (id) => get().commandes.find((c) => c.id === id),
  getCommandesByCliente: (clienteId) => get().commandes.filter((c) => c.clienteId === clienteId),
}));
