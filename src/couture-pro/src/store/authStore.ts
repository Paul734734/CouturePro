import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

// ─── Définition des accès par forfait ────────────────────────────────────────
export type Forfait = "starter" | "pro" | "elite";
export type Billing = "mensuel" | "annuel";

export interface ForfaitAcces {
  clientes: boolean;
  mesures: boolean;
  commandes: boolean;
  factures: boolean;       // PDF — bloqué sur Starter
  paiements: boolean;      // Suivi avancé — bloqué sur Starter
  multiAtelier: boolean;   // Elite uniquement
  exportCompta: boolean;   // Elite uniquement
  maxClientes: number | null; // null = illimité
}

export const FORFAIT_ACCES: Record<Forfait, ForfaitAcces> = {
  starter: {
    clientes: true,
    mesures: true,
    commandes: true,
    factures: false,
    paiements: false,
    multiAtelier: false,
    exportCompta: false,
    maxClientes: 30,
  },
  pro: {
    clientes: true,
    mesures: true,
    commandes: true,
    factures: true,
    paiements: true,
    multiAtelier: false,
    exportCompta: false,
    maxClientes: null,
  },
  elite: {
    clientes: true,
    mesures: true,
    commandes: true,
    factures: true,
    paiements: true,
    multiAtelier: true,
    exportCompta: true,
    maxClientes: null,
  },
};

export const FORFAIT_PRIX = {
  starter: { mensuel: 2500, annuel: 25000 },
  pro:     { mensuel: 5000, annuel: 50000 },
  elite:   { mensuel: 9000, annuel: 90000 },
};

// ─── Store ────────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: Partial<User> & { password: string; forfait?: Forfait; billing?: Billing }) => Promise<void>;
  logout: () => void;
  updateProfil: (data: Partial<User>) => void;

  // Helper : renvoie les accès du user connecté
  getAcces: () => ForfaitAcces;
  // Helper : vrai si la feature est accessible
  peutAcceder: (feature: keyof ForfaitAcces) => boolean;
}

const ESSAI_ACCES: ForfaitAcces = {
  clientes: true,
  mesures: true,
  commandes: true,
  factures: true,    // essai = tout débloquer 7j
  paiements: true,
  multiAtelier: false,
  exportCompta: false,
  maxClientes: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // ── Login ──────────────────────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Admin
        if (email === "admin@couturepro.app" && password === "change-moi-avec-un-mot-de-passe-fort-et-unique") {
          set({
            isLoading: false,
            isAuthenticated: true,
            user: {
              id: "admin-001",
              nom: "Administrateur",
              email,
              nomAtelier: "Couture Pro Admin",
              ville: "",
              telephone: "",
              role: "admin",
              statut: "actif",
              forfait: "elite",
              billing: "annuel",
              dateInscription: "2026-01-01",
              dateExpiration: "2027-01-01",
              joursRestants: 365,
            },
          });
          return;
        }

        // Couturière (mock — en prod : appel API)
        set({
          isLoading: false,
          isAuthenticated: true,
          user: {
            id: "user-001",
            nom: "Mon Atelier",
            email,
            nomAtelier: "Mon Atelier Couture",
            ville: "Yaoundé",
            telephone: "",
            role: "couturiere",
            statut: "actif",
            forfait: "pro",          // ← valeur mock ; en prod : lire depuis DB
            billing: "mensuel",
            dateInscription: "2026-01-01",
            dateExpiration: "2026-09-15",
            joursRestants: 96,
          },
        });
      },

      // ── Register ───────────────────────────────────────────────────────────
      register: async (data) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 800));

        const forfait: Forfait = data.forfait ?? "starter";
        const billing: Billing = data.billing ?? "mensuel";

        // Essai 7 jours
        const dateExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        set({
          isLoading: false,
          isAuthenticated: true,
          user: {
            id: "user-" + Date.now(),
            nom: data.nom ?? "",
            email: data.email ?? "",
            nomAtelier: data.nomAtelier ?? "",
            ville: data.ville ?? "",
            telephone: data.telephone ?? "",
            role: "couturiere",
            statut: "essai",
            forfait,
            billing,
            dateInscription: new Date().toISOString(),
            dateExpiration,
            joursRestants: 7,
          },
        });
      },

      // ── Logout ─────────────────────────────────────────────────────────────
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      // ── Profil ─────────────────────────────────────────────────────────────
      updateProfil: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },

      // ── Helpers accès ──────────────────────────────────────────────────────
      getAcces: () => {
        const user = get().user;
        if (!user) return ESSAI_ACCES;
        if (user.statut === "essai") return ESSAI_ACCES;
        if (user.statut !== "actif") {
          // Compte suspendu / expiré : accès lecture seule minimal
          return {
            clientes: true,
            mesures: false,
            commandes: false,
            factures: false,
            paiements: false,
            multiAtelier: false,
            exportCompta: false,
            maxClientes: 0,
          };
        }
        return FORFAIT_ACCES[user.forfait ?? "starter"];
      },

      peutAcceder: (feature) => {
        return get().getAcces()[feature] as boolean;
      },
    }),
    {
      name: "couture-pro-auth",
    }
  )
);