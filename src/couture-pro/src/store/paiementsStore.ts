import { create } from "zustand";
import { api } from "@/lib/api";
import type { Paiement } from "@/types";
import { useCommandesStore } from "./commandesStore";

export interface FormulairePaiement {
  commandeId: string;
  montant: number;
  type: "avance" | "solde" | "partiel";
  notes?: string;
}

export interface SuiviPaiement {
  commandeId: string;
  clienteNom: string;
  commandeLabel: string;
  prixTotal: number;
  totalPaye: number;
  resteAPayer: number;
  statut: "solde" | "impaye" | "partiel";
}

export interface TotauxPaiements {
  totalEncaisse: number;
  totalReste: number;
}

interface PaiementsState {
  parCommande: Record<string, Paiement[]>;
  suivi: SuiviPaiement[];
  totaux: TotauxPaiements;
  isLoading: boolean;
  error: string | null;

  fetchPaiementsCommande: (commandeId: string) => Promise<void>;
  ajouterPaiement: (data: FormulairePaiement) => Promise<Paiement>;
  fetchSuivi: () => Promise<void>;
  fetchTotaux: () => Promise<void>;

  getPaiementsByCommande: (commandeId: string) => Paiement[];
}

export const usePaiementsStore = create<PaiementsState>()((set, get) => ({
  parCommande: {},
  suivi: [],
  totaux: { totalEncaisse: 0, totalReste: 0 },
  isLoading: false,
  error: null,

  fetchPaiementsCommande: async (commandeId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Paiement[]>(`/api/paiements/commande/${commandeId}`);
      set((state) => ({
        parCommande: { ...state.parCommande, [commandeId]: data },
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.detail || "Erreur lors du chargement des paiements.",
      });
    }
  },

  ajouterPaiement: async (data) => {
    const { data: created } = await api.post<Paiement>("/api/paiements", data);
    set((state) => ({
      parCommande: {
        ...state.parCommande,
        [data.commandeId]: [created, ...(state.parCommande[data.commandeId] || [])],
      },
    }));
    // la commande liee a ete mise a jour cote serveur (avancePaye/resteAPayer) -> resynchroniser
    await useCommandesStore.getState().fetchCommandes();
    await get().fetchSuivi();
    await get().fetchTotaux();
    return created;
  },

  fetchSuivi: async () => {
    const { data } = await api.get<SuiviPaiement[]>("/api/paiements/suivi");
    set({ suivi: data });
  },

  fetchTotaux: async () => {
    const { data } = await api.get<TotauxPaiements>("/api/paiements/totaux");
    set({ totaux: data });
  },

  getPaiementsByCommande: (commandeId) => get().parCommande[commandeId] || [],
}));
