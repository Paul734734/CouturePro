import create from "zustand";
import api from "../lib/api";

interface Facture {
  id: string;
  commandeId: string;
  montant: number;
  date: string;
  notes?: string;
}

interface FacturesState {
  factures: Facture[];
  fetchFactures: () => Promise<void>;
  ajouterFacture: (data: Partial<Facture>) => Promise<void>;
}

export const useFacturesStore = create<FacturesState>((set) => ({
  factures: [],
  fetchFactures: async () => {
    const res = await api.get("/factures");
    set({ factures: res.data });
  },
  ajouterFacture: async (data) => {
    await api.post("/factures", data);
    const res = await api.get("/factures");
    set({ factures: res.data });
  },
}));
