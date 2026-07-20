import { create } from "zustand";
import { api } from "@/lib/api";

export interface Mesure {
  id: string;
  userId: string;
  clienteId: string;
  poitrine?: number;
  taille?: number;
  hanche?: number;
  longueurRobe?: number;
  manches?: number;
  epaules?: number;
  bras?: number;
  sousPoitrine?: number;
  hauteurPoitrine?: number;
  ecartPoitrine?: number;
  longueurJupe?: number;
  pantalon?: number;
  notesMorphologie?: string;
  updatedAt: string;
}

export type FormulaireMesure = Omit<Mesure, "id" | "userId" | "updatedAt">;

interface MesuresState {
  // historique complet, indexe par clienteId pour un acces rapide
  parCliente: Record<string, Mesure[]>;
  isLoading: boolean;
  error: string | null;

  fetchMesuresCliente: (clienteId: string) => Promise<void>;
  ajouterMesure: (data: FormulaireMesure) => Promise<Mesure>;
  modifierMesure: (id: string, clienteId: string, data: Partial<FormulaireMesure>) => Promise<Mesure>;
  supprimerMesure: (id: string, clienteId: string) => Promise<void>;

  getHistoriqueCliente: (clienteId: string) => Mesure[];
  getDerniereMesure: (clienteId: string) => Mesure | undefined;
}

export const useMesuresStore = create<MesuresState>()((set, get) => ({
  parCliente: {},
  isLoading: false,
  error: null,

  fetchMesuresCliente: async (clienteId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Mesure[]>(`/api/mesures/cliente/${clienteId}`);
      set((state) => ({
        parCliente: { ...state.parCliente, [clienteId]: data },
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.detail || "Erreur lors du chargement des mesures.",
      });
    }
  },

  ajouterMesure: async (data) => {
    const { data: created } = await api.post<Mesure>("/api/mesures", data);
    set((state) => ({
      parCliente: {
        ...state.parCliente,
        // nouvelle mesure en tete, coherent avec le tri updated_at desc du backend
        [data.clienteId]: [created, ...(state.parCliente[data.clienteId] || [])],
      },
    }));
    return created;
  },

  modifierMesure: async (id, clienteId, data) => {
    const { data: updated } = await api.put<Mesure>(`/api/mesures/${id}`, data);
    set((state) => ({
      parCliente: {
        ...state.parCliente,
        [clienteId]: (state.parCliente[clienteId] || []).map((m) => (m.id === id ? updated : m)),
      },
    }));
    return updated;
  },

  supprimerMesure: async (id, clienteId) => {
    await api.delete(`/api/mesures/${id}`);
    set((state) => ({
      parCliente: {
        ...state.parCliente,
        [clienteId]: (state.parCliente[clienteId] || []).filter((m) => m.id !== id),
      },
    }));
  },

  getHistoriqueCliente: (clienteId) => get().parCliente[clienteId] || [],

  // pratique pour un affichage type "carte resume" -> la plus recente du tableau
  getDerniereMesure: (clienteId) => (get().parCliente[clienteId] || [])[0],
}));
