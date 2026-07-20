import create from "zustand";
import api from "../lib/api";

interface Catalogue {
  id: string;
  nom: string;
  description: string;
  imageUrl: string;
}

interface CatalogueState {
  catalogue: Catalogue[];
  fetchCatalogue: () => Promise<void>;
  ajouterItem: (data: Partial<Catalogue>) => Promise<void>;
}

export const useCatalogueStore = create<CatalogueState>((set) => ({
  catalogue: [],
  fetchCatalogue: async () => {
    const res = await api.get("/catalogue");
    set({ catalogue: res.data });
  },
  ajouterItem: async (data) => {
    await api.post("/catalogue", data);
    const res = await api.get("/catalogue");
    set({ catalogue: res.data });
  },
}));
