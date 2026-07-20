import create from "zustand";
import api from "../lib/api";

interface Profil {
  id: string;
  nomAtelier: string;
  description: string;
  contact: string;
  localisation: string;
  logoUrl: string;
}

interface ProfilState {
  profil: Profil | null;
  fetchProfil: () => Promise<void>;
  updateProfil: (data: Partial<Profil>) => Promise<void>;
}

export const useProfilStore = create<ProfilState>((set) => ({
  profil: null,
  fetchProfil: async () => {
    const res = await api.get("/profil");
    set({ profil: res.data });
  },
  updateProfil: async (data) => {
    await api.post("/profil", data);
    const res = await api.get("/profil");
    set({ profil: res.data });
  },
}));
