import { create } from "zustand";
import { api } from "@/lib/api";
import type { Forfait, Billing, StatutUser } from "@/types";

export interface AdminUtilisatrice {
  id: string;
  nom: string;
  email: string;
  nomAtelier?: string;
  ville?: string;
  telephone?: string;
  role: string;
  statut: StatutUser;
  forfait?: Forfait;
  billing?: Billing;
  dateInscription: string;
  dateExpiration?: string;
  joursRestants: number;
  abonnementBloque: boolean;
}

export interface AdminDashboardStats {
  nbUtilisatricesTotal: number;
  nbUtilisatricesActives: number;
  nbUtilisatricesEssai: number;
  nbUtilisatricesExpirees: number;
  nbUtilisatricesSuspendues: number;
  revenusEstimesMensuel: number;
}

interface AdminState {
  utilisatrices: AdminUtilisatrice[];
  stats: AdminDashboardStats | null;
  isLoading: boolean;
  error: string | null;

  fetchUtilisatrices: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  modifierUtilisatrice: (id: string, data: Partial<{
    statut: StatutUser;
    forfait: Forfait;
    billing: Billing;
    dateExpiration: string;
  }>) => Promise<void>;
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  utilisatrices: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchUtilisatrices: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<AdminUtilisatrice[]>("/api/admin/utilisatrices");
      set({ utilisatrices: data, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.detail || "Erreur lors du chargement des utilisatrices.",
      });
    }
  },

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<AdminDashboardStats>("/api/admin/dashboard");
      set({ stats: data, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.detail || "Erreur lors du chargement des statistiques.",
      });
    }
  },

  modifierUtilisatrice: async (id, data) => {
    const { data: updated } = await api.put<AdminUtilisatrice>(`/api/admin/utilisatrices/${id}`, data);
    set((state) => ({
      utilisatrices: state.utilisatrices.map((u) => (u.id === id ? updated : u)),
    }));
    // recharge aussi les stats globales puisqu'un changement de statut les affecte
    get().fetchDashboard();
  },
}));
