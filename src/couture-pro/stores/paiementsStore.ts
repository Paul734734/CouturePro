import create from "zustand";
import api from "../lib/api";

interface Paiement {
  id: string;
  commandeId: string;
  montant: number;
  type: string;
  date: string;
  notes?: string;
  clienteNom?: string;
  commandeLabel?: string;
}

interface PaiementsState {
  paiements: Paiement[];
  fetchPaiements: () => Promise<void>;
}

export const usePaiementsStore = create<PaiementsState>((set) => ({
  paiements: [],
  fetchPaiements: async () => {
    const res = await api.get("/paiements");
    set({ paiements: res.data });
  },
}));
