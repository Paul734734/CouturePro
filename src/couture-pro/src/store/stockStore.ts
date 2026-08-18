import { create } from "zustand";
import { api } from "@/lib/api";

export interface ArticleStock {
  id: string;
  userId: string;
  nom: string;
  categorie?: string;
  quantite: number;
  unite: string;
  seuilAlerte?: number;
  dateAjout: string;
  dateMaj: string;
}

export type FormulaireArticleStock = Omit<ArticleStock, "id" | "userId" | "dateAjout" | "dateMaj">;

interface StockState {
  articles: ArticleStock[];
  isLoading: boolean;
  error: string | null;

  fetchStock: () => Promise<void>;
  ajouterArticle: (data: FormulaireArticleStock) => Promise<ArticleStock>;
  modifierArticle: (id: string, data: Partial<FormulaireArticleStock>) => Promise<ArticleStock>;
  supprimerArticle: (id: string) => Promise<void>;
  getArticleById: (id: string) => ArticleStock | undefined;
}

export const useStockStore = create<StockState>()((set, get) => ({
  articles: [],
  isLoading: false,
  error: null,

  fetchStock: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<ArticleStock[]>("/api/stock");
      set({ articles: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.detail || "Erreur chargement du stock." });
    }
  },

  ajouterArticle: async (data) => {
    const { data: created } = await api.post<ArticleStock>("/api/stock", data);
    set((state) => ({ articles: [created, ...state.articles] }));
    return created;
  },

  modifierArticle: async (id, data) => {
    const { data: updated } = await api.put<ArticleStock>(`/api/stock/${id}`, data);
    set((state) => ({
      articles: state.articles.map((a) => (a.id === id ? updated : a)),
    }));
    return updated;
  },

  supprimerArticle: async (id) => {
    await api.delete(`/api/stock/${id}`);
    set((state) => ({ articles: state.articles.filter((a) => a.id !== id) }));
  },

  getArticleById: (id) => get().articles.find((a) => a.id === id),
}));
