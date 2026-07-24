import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { api, setToken, clearToken } from "@/lib/api";

export type Forfait = "starter" | "pro" | "elite";
export type Billing = "mensuel" | "annuel";

export const FORFAIT_PRIX: Record<Forfait, { mensuel: number; annuel: number }> = {
  starter: { mensuel: 1000, annuel: 10000 },
  pro:     { mensuel: 2300, annuel: 23000 },
  elite:   { mensuel: 4800, annuel: 48000 },
}

export interface ForfaitAcces {
  clientes: boolean;
  mesures: boolean;
  commandes: boolean;
  factures: boolean;
  paiements: boolean;
  multiAtelier: boolean;
  exportCompta: boolean;
  maxClientes: number | null;
}

// gardes en dur uniquement pour l'etat initial avant le premier appel API ;
// la vraie source de verite est desormais la reponse du backend (champ "acces")
const ACCES_PAR_DEFAUT: ForfaitAcces = {
  clientes: true,
  mesures: false,
  commandes: false,
  factures: false,
  paiements: false,
  multiAtelier: false,
  exportCompta: false,
  maxClientes: 0,
};

interface AuthState {
  user: User | null;
  acces: ForfaitAcces;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    nom: string;
    email: string;
    password: string;
    nomAtelier?: string;
    ville?: string;
    telephone?: string;
    forfait?: Forfait;
    billing?: Billing;
  }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  updateProfil: (data: Partial<User>) => Promise<void>;

  peutAcceder: (feature: keyof ForfaitAcces) => boolean;
}

// Extrait un message lisible depuis une erreur axios/FastAPI.
// FastAPI renvoie soit une string (detail: "..."), soit un tableau
// d'erreurs de validation Pydantic (detail: [{loc, msg, type}, ...]).
function extractErrorMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e: any) => {
        const field = Array.isArray(e?.loc) ? e.loc[e.loc.length - 1] : "champ";
        return `${field} : ${e?.msg || "invalide"}`;
      })
      .join(" \u00b7 ");
  }
  return fallback;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      acces: ACCES_PAR_DEFAUT,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/api/auth/login", { email, password });
          setToken(data.token);
          set({
            isLoading: false,
            isAuthenticated: true,
            user: data.user,
            acces: data.acces,
          });
        } catch (err: any) {
          set({ isLoading: false });
          const message = extractErrorMessage(err, "Erreur de connexion.");
          set({ error: message });
          throw new Error(message);
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/api/auth/register", payload);
          setToken(data.token);
          set({
            isLoading: false,
            isAuthenticated: true,
            user: data.user,
            acces: data.acces,
          });
        } catch (err: any) {
          set({ isLoading: false });
          const message = extractErrorMessage(err, "Erreur lors de l'inscription.");
          set({ error: message });
          throw new Error(message);
        }
      },

      logout: () => {
        clearToken();
        set({ user: null, isAuthenticated: false, acces: ACCES_PAR_DEFAUT });
      },

      // recharge le user + acces depuis le backend (ex: apres un refresh de page,
      // ou apres qu'un admin ait change le forfait de l'utilisatrice)
      refreshMe: async () => {
        try {
          const { data } = await api.get("/api/auth/me");
          set({
            isAuthenticated: true,
            user: data.user,
            acces: data.acces,
          });
        } catch {
          clearToken();
          set({ user: null, isAuthenticated: false, acces: ACCES_PAR_DEFAUT });
        }
      },

      updateProfil: async (payload) => {
        const { data } = await api.put("/api/auth/me", payload);
        set((state) => ({ user: state.user ? { ...state.user, ...data } : data }));
      },

      peutAcceder: (feature) => {
        return Boolean(get().acces[feature]);
      },
    }),
    {
      name: "couture-pro-auth",
      // on ne persiste pas isLoading/error, seulement l'etat utile entre sessions
      partialize: (state) => ({
        user: state.user,
        acces: state.acces,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
