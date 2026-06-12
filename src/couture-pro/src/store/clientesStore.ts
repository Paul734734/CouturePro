import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cliente, FormulaireCliente } from "@/types";
import { genererIdUnique, getInitiale } from "@/lib/utils";

interface ClientesState {
  clientes: Cliente[];
  isLoading: boolean;
  ajouterCliente: (data: FormulaireCliente, userId: string) => void;
  modifierCliente: (id: string, data: Partial<Cliente>) => void;
  supprimerCliente: (id: string) => void;
  getClienteById: (id: string) => Cliente | undefined;
  getClientesByUser: (userId: string) => Cliente[];
}

export const useClientesStore = create<ClientesState>()(
  persist(
    (set, get) => ({
      clientes: [],
      isLoading: false,

      ajouterCliente: (data, userId) => {
        const nouvelle: Cliente = {
          ...data,
          id: genererIdUnique(),
          userId,
          dateCreation: new Date().toISOString(),
          initiale: getInitiale(data.nom),
        };
        set((state) => ({ clientes: [...state.clientes, nouvelle] }));
      },

      modifierCliente: (id, data) => {
        set((state) => ({
          clientes: state.clientes.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },

      supprimerCliente: (id) => {
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
        }));
      },

      getClienteById: (id) => {
        return get().clientes.find((c) => c.id === id);
      },

      getClientesByUser: (userId) => {
        return get().clientes.filter((c) => c.userId === userId);
      },
    }),
    {
      name: "couture-pro-clientes",
    }
  )
);
