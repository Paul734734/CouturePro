import create from "zustand";
import api from "../lib/api";

interface Stock {
  id: string;
  nom: string;
  quantite: number;
  categorie: string;
}

interface StockState {
  stock: Stock[];
  fetchStock: () => Promise<void>;
  ajouterStock: (data: Partial<Stock>) => Promise<void>;
}

export const useStockStore = create<StockState>((set) => ({
  stock: [],
  fetchStock: async () => {
    const res = await api.get("/stock");
    set({ stock: res.data });
  },
  ajouterStock: async (data) => {
    await api.post("/stock", data);
    const res = await api.get("/stock");
    set({ stock: res.data });
  },
}));
