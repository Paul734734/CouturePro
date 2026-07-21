// src/types/index.ts
// ─── REMPLACE TON FICHIER EXISTANT PAR CELUI-CI ──────────────────────────────

export type Forfait = 'starter' | 'pro' | 'elite'
export type Billing = 'mensuel' | 'annuel'
export type StatutUser = 'essai' | 'actif' | 'suspendu' | 'expire'

export interface User {
  id: string
  nom: string
  email: string
  nomAtelier?: string
  ville?: string
  telephone?: string
  description?: string
  logoUrl?: string
  role: 'couturiere' | 'admin'

  // ── Abonnement ────────────────────────────────────
  statut: StatutUser
  forfait?: Forfait          // 'starter' | 'pro' | 'elite'
  billing?: Billing          // 'mensuel' | 'annuel'
  dateInscription: string
  dateExpiration?: string
  joursRestants?: number
}

export type StatutCommande = 'en_attente' | 'en_cours' | 'essayage' | 'pret' | 'livre' | 'annule'

export interface Cliente {
  id: string
  nom: string
  telephone?: string
  ville?: string
  quartier?: string
  adresse?: string
  profession?: string
  dateAnniversaire?: string
  stylePreference?: string
  budgetHabituel?: number
  tailleVetement?: string   // S/M/L/XL... — distinct de Mesure.taille (tour de taille en cm)
  hauteur?: number          // en metres, ex: 1.72
  notes?: string
  dateAjout: string
  userId: string
}

// Donnees du formulaire, avant que le backend n'assigne id/userId/dateAjout
export type FormulaireCliente = Omit<Cliente, 'id' | 'userId' | 'dateAjout'>

export interface Mesure {
  id: string
  clienteId: string
  userId: string
  poitrine?: number
  taille?: number
  hanche?: number
  longueurRobe?: number
  manches?: number
  epaules?: number
  bras?: number
  sousPoitrine?: number
  hauteurPoitrine?: number
  ecartPoitrine?: number
  longueurJupe?: number
  pantalon?: number
  notesMorphologie?: string
  dateModification: string
}

export interface Commande {
  id: string
  clienteId: string
  userId: string
  typeVetement: string
  description?: string
  prixTotal: number
  avancePaye: number
  resteAPayer: number
  dateCommande: string
  dateEssayage?: string
  dateLivraison?: string
  statut: StatutCommande
  notes?: string
}

export interface Paiement {
  id: string
  commandeId: string
  clienteId: string
  userId: string
  montant: number
  type: 'avance' | 'solde' | 'partiel'
  date: string
  notes?: string
}

export interface Facture {
  id: string
  numero: string
  commandeId: string
  clienteId: string
  userId: string
  type: 'facture' | 'devis' | 'recu'
  montantTotal: number
  avance: number
  reste: number
  dateEmission: string
  statut: 'payee' | 'impayee' | 'partielle'
}