import { create } from "zustand";
import { api } from "@/lib/api";
import type { Facture } from "@/types";

export type FormulaireFacture = { clienteId: string; commandeId?: string; type?: "facture" | "devis" | "recu"; montantTotal: number; montantPaye: number; dateEcheance?: string; notes?: string };

interface FacturesState {
  factures: Facture[];
  isLoading: boolean;
  error: string | null;

  fetchFactures: () => Promise<void>;
  ajouterFacture: (data: FormulaireFacture) => Promise<Facture>;
  supprimerFacture: (id: string) => Promise<void>;
  getFacturesByCliente: (clienteId: string) => Facture[];
  getFactureById: (id: string) => Facture | undefined;
}

export const useFacturesStore = create<FacturesState>()((set, get) => ({
  factures: [],
  isLoading: false,
  error: null,

  fetchFactures: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Facture[]>("/api/factures");
      set({ factures: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.detail || "Erreur chargement factures." });
    }
  },

  ajouterFacture: async (data) => {
    const { data: created } = await api.post<Facture>("/api/factures", data);
    set((state) => ({ factures: [...state.factures, created] }));
    return created;
  },

  supprimerFacture: async (id) => {
    await api.delete(`/api/factures/${id}`);
    set((state) => ({
      factures: state.factures.filter((f) => f.id !== id),
    }));
  },

  getFacturesByCliente: (clienteId) => get().factures.filter((f) => f.clienteId === clienteId),
  getFactureById: (id) => get().factures.find((f) => f.id === id),
}));
