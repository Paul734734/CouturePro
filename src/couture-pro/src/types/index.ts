// src/types/index.ts
// ─── REMPLACE TON FICHIER EXISTANT PAR CELUI-CI ──────────────────────────────

export type Forfait = 'starter' | 'pro' | 'elite'
export type Billing = 'mensuel' | 'annuel'
export type StatutUser = 'essai' | 'actif' | 'suspendu' | 'expire'
export type StatutPaiement = 'solde' | 'partiel' | 'impaye'
export type TypeDocument = 'facture' | 'devis' | 'recu'
export type StatutCompte = 'actif' | 'suspendu' | 'essai' | 'grace'

export interface User {
  id: string
  nom: string
  email: string
  nomAtelier?: string
  ville?: string
  quartier?: string
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

export type FormulaireCommande = Omit<Commande, 'id' | 'userId' | 'resteAPayer'>

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
  tempsConception?: number
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

export type StatutFacture = 'payee' | 'partielle' | 'impayee'

export interface Facture {
  id: string
  userId: string
  clienteId: string
  commandeId?: string
  clienteNom: string
  commandeDescription?: string
  numero: string
  type: 'facture' | 'devis' | 'recu'
  statut: StatutFacture
  montantTotal: number
  montantPaye: number
  montantReste: number
  dateEmission: string
  dateEcheance?: string
  logoAtelier?: string
  nomAtelier?: string
  notes?: string
}