import type { StatutCommande, StatutPaiement, TypeDocument, StatutCompte } from "@/types";

// ─────────────────────────────────────────
// FORMATAGE MONÉTAIRE
// ─────────────────────────────────────────

export function formatFCFA(montant: number): string {
  return montant.toLocaleString("fr-FR") + " FCFA";
}

export function formatMontant(montant: number): string {
  return formatFCFA(montant);
}

export function formatFCFACourt(montant: number): string {
  if (montant >= 1_000_000) return (montant / 1_000_000).toFixed(1) + "M FCFA";
  if (montant >= 1_000) return (montant / 1_000).toFixed(0) + "k FCFA";
  return montant + " FCFA";
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getStatutLabel(statut: string): string {
  return statutCommandeLabel[statut as keyof typeof statutCommandeLabel] ?? "Inconnu";
}

export function getStatutColor(statut: string): string {
  return statutCommandeStyle[statut as keyof typeof statutCommandeStyle] ?? "bg-gray-100 text-gray-600";
}

export function calculReste(total: number, avance: number): number {
  return Math.max(0, total - avance);
}

export function calculPourcentagePaye(total: number, avance: number): number {
  if (total === 0) return 0;
  return Math.round((avance / total) * 100);
}

// ─────────────────────────────────────────
// FORMATAGE DATES
// ─────────────────────────────────────────

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateCourte(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateAujourdhui(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function joursAvantDate(dateStr: string): number {
  const today = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function estEnRetard(dateStr: string): boolean {
  return joursAvantDate(dateStr) < 0;
}

export function estUrgent(dateStr: string, seuilJours = 3): boolean {
  const jours = joursAvantDate(dateStr);
  return jours >= 0 && jours <= seuilJours;
}

// ─────────────────────────────────────────
// INITIALES
// ─────────────────────────────────────────

export function getInitiale(nom: string): string {
  return nom.trim().charAt(0).toUpperCase();
}

export function getInitiales(nom: string, prenom?: string): string {
  const i1 = nom.trim().charAt(0).toUpperCase();
  const i2 = prenom ? prenom.trim().charAt(0).toUpperCase() : "";
  return i1 + i2;
}

// ─────────────────────────────────────────
// GÉNÉRATION IDs / NUMÉROS
// ─────────────────────────────────────────

export function genererIdUnique(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function genererNumeroFacture(type: TypeDocument, index: number): string {
  const annee = new Date().getFullYear();
  const prefix =
    type === "facture" ? "FAC" : type === "devis" ? "DEV" : "REC";
  const num = String(index).padStart(3, "0");
  return `${prefix}-${annee}-${num}`;
}

// ─────────────────────────────────────────
// STATUTS — LABELS ET COULEURS
// ─────────────────────────────────────────

export const statutCommandeLabel: Record<StatutCommande, string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  essayage: "Essayage",
  pret: "Prêt",
  livre: "Livré",
  annule: "Annulé",
};

export const statutCommandeStyle: Record<StatutCommande, string> = {
  en_attente: "bg-gray-100 text-gray-600",
  en_cours: "bg-blue-100 text-blue-700",
  essayage: "bg-purple-100 text-purple-700",
  pret: "bg-green-100 text-green-700",
  livre: "bg-gold-100 text-gold-700",
  annule: "bg-red-100 text-red-700",
};

export const statutPaiementLabel: Record<StatutPaiement, string> = {
  solde: "Soldé",
  partiel: "Partiel",
  impaye: "Impayé",
};

export const statutPaiementStyle: Record<StatutPaiement, string> = {
  solde: "bg-green-100 text-green-700",
  partiel: "bg-gold-100 text-gold-700",
  impaye: "bg-red-100 text-red-700",
};

export const statutCompteLabel: Record<StatutCompte, string> = {
  actif: "Actif",
  suspendu: "Suspendu",
  essai: "Essai",
  grace: "Grâce",
};

export const statutCompteStyle: Record<StatutCompte, string> = {
  actif: "bg-green-100 text-green-700",
  suspendu: "bg-red-100 text-red-700",
  essai: "bg-blue-100 text-blue-700",
  grace: "bg-yellow-100 text-yellow-700",
};

// ─────────────────────────────────────────
// RECHERCHE / FILTRES
// ─────────────────────────────────────────

export function filtrerParRecherche<T>(
  liste: T[],
  query: string,
  champs: (keyof T)[]
): T[] {
  if (!query.trim()) return liste;
  const q = query.toLowerCase();
  return liste.filter((item) =>
    champs.some((champ) =>
      String(item[champ] ?? "").toLowerCase().includes(q)
    )
  );
}

// ─────────────────────────────────────────
// COULEURS AVATAR
// ─────────────────────────────────────────

const couleursAvatar = [
  "bg-gold-100 text-gold-600",
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-yellow-100 text-yellow-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
];

export function getCouleurAvatar(id: string): string {
  const index = id.charCodeAt(0) % couleursAvatar.length;
  return couleursAvatar[index];
}
