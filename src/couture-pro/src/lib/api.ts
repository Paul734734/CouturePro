import axios from "axios";

// Tous les appels du store incluent déjà leur propre prefixe "/api/..."
// (ex: api.get("/api/catalogue")). On normalise donc ici l'origine du serveur
// en retirant un éventuel suffixe "/api" final de VITE_API_URL, pour éviter
// un double prefixe (https://host/api/api/...) si la variable d'env sur
// Netlify est definie avec ou sans ce suffixe.
const RAW_API_URL = import.meta.env.VITE_API_URL || "https://couturepro.app";
const API_BASE_URL = RAW_API_URL.replace(/\/api\/?$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Le dossier /uploads est servi par le backend hors du prefixe /api
// (voir app.mount("/uploads", ...) cote FastAPI). API_BASE_URL est deja
// l'origine nue (sans /api), donc on l'utilise directement.
const API_ORIGIN = API_BASE_URL;

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

export async function exporterComptabilite(): Promise<void> {
  const response = await api.get("/api/export/comptabilite", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = "comptabilite-couturepro.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
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
