import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// injecte automatiquement le token JWT sur chaque requete si present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("couturepro_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// gestion centralisee des erreurs d'auth / abonnement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token invalide ou expire -> on deconnecte proprement
      localStorage.removeItem("couturepro_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    // 402 = fonctionnalite non incluse dans le forfait -> laisse le composant
    // appelant gerer l'affichage (message d'upgrade), pas de redirection ici
    return Promise.reject(error);
  }
);

export function setToken(token: string) {
  localStorage.setItem("couturepro_token", token);
}

export function clearToken() {
  localStorage.removeItem("couturepro_token");
}

export function getToken(): string | null {
  return localStorage.getItem("couturepro_token");
}
