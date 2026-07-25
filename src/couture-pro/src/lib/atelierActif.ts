// Atelier actuellement sélectionné (multi-atelier, forfait Elite).
// Volontairement en dehors de zustand : lib/api.ts a besoin de lire cette
// valeur dans son intercepteur de requêtes, et un store zustand importerait
// lui-même `api` → import circulaire. Ce module n'importe rien.

const STORAGE_KEY = "couture-pro-atelier-actif";

type Listener = (id: string | null) => void;

let current: string | null =
  typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

const listeners = new Set<Listener>();

/** null = espace principal (comportement historique, inchangé). */
export function getAtelierActif(): string | null {
  return current;
}

export function setAtelierActif(id: string | null): void {
  current = id;
  if (typeof window !== "undefined") {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((listener) => listener(current));
}

export function subscribeAtelierActif(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
