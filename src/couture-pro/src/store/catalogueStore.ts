import { create } from "zustand";
import { api } from "@/lib/api";

export interface ArticleCatalogue {
  id: string;
  userId: string;
  nom: string;
  categorie?: string;
  description?: string;
  prixIndicatif?: number;
  tempsConceptionEstime?: number;
  imageUrl?: string;
  actif: boolean;
  dateAjout: string;
}

export type FormulaireArticleCatalogue = Omit<ArticleCatalogue, "id" | "userId" | "dateAjout">;

interface CatalogueState {
  catalogue: ArticleCatalogue[];
  isLoading: boolean;
  error: string | null;

  fetchCatalogue: () => Promise<void>;
  ajouterItem: (data: FormulaireArticleCatalogue) => Promise<ArticleCatalogue>;
  modifierItem: (id: string, data: Partial<FormulaireArticleCatalogue>) => Promise<ArticleCatalogue>;
  supprimerItem: (id: string) => Promise<void>;
  getItemById: (id: string) => ArticleCatalogue | undefined;
}

export const useCatalogueStore = create<CatalogueState>()((set, get) => ({
  catalogue: [],
  isLoading: false,
  error: null,

  fetchCatalogue: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<ArticleCatalogue[]>("/api/catalogue");
      set({ catalogue: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.detail || "Erreur chargement du catalogue." });
    }
  },

  ajouterItem: async (data) => {
    const { data: created } = await api.post<ArticleCatalogue>("/api/catalogue", data);
    set((state) => ({ catalogue: [created, ...state.catalogue] }));
    return created;
  },

  modifierItem: async (id, data) => {
    const { data: updated } = await api.put<ArticleCatalogue>(`/api/catalogue/${id}`, data);
    set((state) => ({
      catalogue: state.catalogue.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  supprimerItem: async (id) => {
    await api.delete(`/api/catalogue/${id}`);
    set((state) => ({ catalogue: state.catalogue.filter((c) => c.id !== id) }));
  },

  getItemById: (id) => get().catalogue.find((c) => c.id === id),
}));
