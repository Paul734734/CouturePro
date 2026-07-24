import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://couturepro.app/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Le dossier /uploads est servi par le backend hors du prefixe /api
// (voir app.mount("/uploads", ...) cote FastAPI) : on retire /api pour
// obtenir l'origine du serveur et construire une URL absolue vers l'image.
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function resolveFileUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<{ url: string }>("/api/upload/photo", formData);
  return resolveFileUrl(data.url);
}

const TOKEN_KEY = "couture-pro-token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// injecte automatiquement le token dans chaque requête si présent
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
