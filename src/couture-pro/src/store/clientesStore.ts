import { create } from "zustand";
import type { Cliente, FormulaireCliente } from "@/types";
import { api } from "@/lib/api";

interface ClientesState {
  clientes: Cliente[];
  isLoading: boolean;
  error: string | null;

  fetchClientes: () => Promise<void>;
  fetchClienteById: (id: string) => Promise<Cliente | null>;
  ajouterCliente: (data: FormulaireCliente) => Promise<Cliente>;
  modifierCliente: (id: string, data: Partial<FormulaireCliente>) => Promise<Cliente>;
  supprimerCliente: (id: string) => Promise<void>;
  getClienteById: (id: string) => Cliente | undefined;
}

export const useClientesStore = create<ClientesState>()((set, get) => ({
  clientes: [],
  isLoading: false,
  error: null,

  // charge toutes les clientes de l'utilisatrice connectee (le backend filtre
  // deja par user_id via le token, pas besoin de le repreciser cote front)
  fetchClientes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Cliente[]>("/api/clientes");
      set({ clientes: data, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.detail || "Erreur lors du chargement des clientes.",
      });
    }
  },

  // utile pour une navigation directe vers /clientes/:id sans etre passe
  // par la liste avant (cache local vide) -> va chercher la cliente seule
  fetchClienteById: async (id) => {
    try {
      const { data } = await api.get<Cliente>(`/api/clientes/${id}`);
      set((state) => ({
        clientes: state.clientes.some((c) => c.id === id)
          ? state.clientes.map((c) => (c.id === id ? data : c))
          : [...state.clientes, data],
      }));
      return data;
    } catch {
      return null;
    }
  },

  ajouterCliente: async (data) => {
    const { data: created } = await api.post<Cliente>("/api/clientes", data);
    set((state) => ({ clientes: [...state.clientes, created] }));
    return created;
  },

  modifierCliente: async (id, data) => {
    const { data: updated } = await api.put<Cliente>(`/api/clientes/${id}`, data);
    set((state) => ({
      clientes: state.clientes.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  supprimerCliente: async (id) => {
    await api.delete(`/api/clientes/${id}`);
    set((state) => ({ clientes: state.clientes.filter((c) => c.id !== id) }));
  },

  // lecture synchrone depuis le cache local (rempli par fetchClientes/fetchClienteById)
  getClienteById: (id) => get().clientes.find((c) => c.id === id),
}));
