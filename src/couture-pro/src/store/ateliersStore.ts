import { create } from "zustand";
import { api } from "@/lib/api";

export interface Atelier {
  id: string;
  userId: string;
  nom: string;
  ville?: string;
  quartier?: string;
  telephone?: string;
  createdAt: string;
}

export type FormulaireAtelier = Pick<Atelier, "nom" | "ville" | "quartier" | "telephone">;

interface AteliersState {
  ateliers: Atelier[];
  isLoading: boolean;
  error: string | null;

  fetchAteliers: () => Promise<void>;
  ajouterAtelier: (data: Partial<FormulaireAtelier>) => Promise<Atelier>;
  modifierAtelier: (id: string, data: Partial<FormulaireAtelier>) => Promise<Atelier>;
  supprimerAtelier: (id: string) => Promise<void>;
}

export const useAteliersStore = create<AteliersState>()((set) => ({
  ateliers: [],
  isLoading: false,
  error: null,

  fetchAteliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Atelier[]>("/api/ateliers");
      set({ ateliers: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.detail || "Erreur chargement des ateliers." });
    }
  },

  ajouterAtelier: async (data) => {
    const { data: created } = await api.post<Atelier>("/api/ateliers", data);
    set((state) => ({ ateliers: [...state.ateliers, created] }));
    return created;
  },

  modifierAtelier: async (id, data) => {
    const { data: updated } = await api.put<Atelier>(`/api/ateliers/${id}`, data);
    set((state) => ({
      ateliers: state.ateliers.map((a) => (a.id === id ? updated : a)),
    }));
    return updated;
  },

  supprimerAtelier: async (id) => {
    await api.delete(`/api/ateliers/${id}`);
    set((state) => ({ ateliers: state.ateliers.filter((a) => a.id !== id) }));
  },
}));
