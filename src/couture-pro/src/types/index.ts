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

  // Tete et cou
  tourTete?: number
  tourCou?: number
  hauteurCou?: number

  // Epaules et buste
  largeurEpaules?: number
  longueurEpaule?: number
  tourPoitrine?: number
  tourSousPoitrine?: number
  ecartPoitrine?: number
  hauteurPoitrine?: number
  tourCarrureDos?: number
  tourCarrureDevant?: number

  // Dos et longueur de buste
  longueurDos?: number
  longueurTailleDevant?: number
  longueurTailleHanches?: number

  // Taille et hanches
  tourTaille?: number
  tourHanches?: number
  hauteurTaille?: number
  tourVentre?: number

  // Bras
  tourBras?: number
  tourCoude?: number
  tourPoignet?: number
  longueurBras?: number
  longueurEpauleCoude?: number
  longueurCoudePoignet?: number

  // Jambes
  tourCuisse?: number
  tourGenou?: number
  tourMollet?: number
  tourCheville?: number
  longueurEntrejambe?: number
  longueurTotaleJambe?: number
  hauteurGenou?: number

  // Longueurs generales
  hauteurTotale?: number
  longueurTotaleVetement?: number
  longueurJupePantalon?: number

  // Mesures specifiques optionnelles
  tourTeteCapuche?: number
  profondeurEmmanchure?: number
  largeurDosTaille?: number

  notesMorphologie?: string
  dateModification: string
}

// Categories de mesures pour l'affichage/saisie groupee dans l'UI
export const CATEGORIES_MESURES: { titre: string; champs: { key: keyof Mesure; label: string }[] }[] = [
  {
    titre: 'Tête et cou',
    champs: [
      { key: 'tourTete', label: 'Tour de tête' },
      { key: 'tourCou', label: 'Tour de cou' },
      { key: 'hauteurCou', label: 'Hauteur de cou' },
    ],
  },
  {
    titre: 'Épaules et buste',
    champs: [
      { key: 'largeurEpaules', label: "Largeur d'épaules" },
      { key: 'longueurEpaule', label: "Longueur d'épaule" },
      { key: 'tourPoitrine', label: 'Tour de poitrine' },
      { key: 'tourSousPoitrine', label: 'Tour sous-poitrine' },
      { key: 'ecartPoitrine', label: 'Écartement de poitrine' },
      { key: 'hauteurPoitrine', label: 'Hauteur de poitrine' },
      { key: 'tourCarrureDos', label: 'Tour de carrure dos' },
      { key: 'tourCarrureDevant', label: 'Tour de carrure devant' },
    ],
  },
  {
    titre: 'Dos et longueur de buste',
    champs: [
      { key: 'longueurDos', label: 'Longueur du dos' },
      { key: 'longueurTailleDevant', label: 'Longueur taille devant' },
      { key: 'longueurTailleHanches', label: 'Longueur taille-hanches' },
    ],
  },
  {
    titre: 'Taille et hanches',
    champs: [
      { key: 'tourTaille', label: 'Tour de taille' },
      { key: 'tourHanches', label: 'Tour de hanches' },
      { key: 'hauteurTaille', label: 'Hauteur de taille (du sol)' },
      { key: 'tourVentre', label: 'Tour de ventre' },
    ],
  },
  {
    titre: 'Bras',
    champs: [
      { key: 'tourBras', label: 'Tour de bras' },
      { key: 'tourCoude', label: 'Tour de coude' },
      { key: 'tourPoignet', label: 'Tour de poignet' },
      { key: 'longueurBras', label: 'Longueur de bras' },
      { key: 'longueurEpauleCoude', label: 'Longueur épaule-coude' },
      { key: 'longueurCoudePoignet', label: 'Longueur coude-poignet' },
    ],
  },
  {
    titre: 'Jambes',
    champs: [
      { key: 'tourCuisse', label: 'Tour de cuisse' },
      { key: 'tourGenou', label: 'Tour de genou' },
      { key: 'tourMollet', label: 'Tour de mollet' },
      { key: 'tourCheville', label: 'Tour de chevilles' },
      { key: 'longueurEntrejambe', label: "Longueur d'entrejambe" },
      { key: 'longueurTotaleJambe', label: 'Longueur totale de jambe' },
      { key: 'hauteurGenou', label: 'Hauteur du genou' },
    ],
  },
  {
    titre: 'Longueurs générales',
    champs: [
      { key: 'hauteurTotale', label: 'Hauteur totale' },
      { key: 'longueurTotaleVetement', label: 'Longueur totale du vêtement' },
      { key: 'longueurJupePantalon', label: 'Longueur de jupe/pantalon' },
    ],
  },
  {
    titre: 'Mesures spécifiques optionnelles',
    champs: [
      { key: 'tourTeteCapuche', label: 'Tour de tête pour capuche' },
      { key: 'profondeurEmmanchure', label: "Profondeur d'emmanchure" },
      { key: 'largeurDosTaille', label: 'Largeur de dos à la taille' },
    ],
  },
]

export type FormulaireCommande = Omit<Commande, 'id' | 'userId' | 'resteAPayer'>

export interface Commande {
  id: string
  clienteId: string
  clienteNom?: string
  userId: string
  typeVetement: string
  description?: string
  photoUrl?: string
  prixTotal: number
  avancePaye: number
  resteAPayer: number
  dateCommande: string
  dateEssayage?: string
  dateLivraison?: string
  modeLivraison?: 'retrait_atelier' | 'livraison_domicile'
  prixLivraison?: number
  adresseLivraison?: string
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