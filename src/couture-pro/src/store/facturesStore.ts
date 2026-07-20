import { create } from "zustand";
import { api } from "@/lib/api";

export interface Facture {
  id: string;
  userId: string;
  commandeId: string;
  montant: number;
  date: string;
  notes?: string;
}

export type FormulaireFacture = Omit<Facture, "id" | "userId" | "date">;

interface FacturesState {
  factures: Facture[];
  isLoading: boolean;
  error: string | null;

  fetchFactures: () => Promise<void>;
  ajouterFacture: (data: FormulaireFacture) => Promise<Facture>;
  supprimerFacture: (id: string) => Promise<void>;
}

export const useFacturesStore = create<FacturesState>()((set) => ({
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
}));
