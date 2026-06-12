import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TypeDocument = 'facture' | 'recu' | 'devis'
export type StatutFacture = 'payee' | 'partielle' | 'impayee'

export interface Facture {
  id: string
  userId: string
  clienteId: string
  clienteNom: string
  commandeId: string
  commandeDescription: string
  numero: string
  type: TypeDocument
  statut: StatutFacture
  montantTotal: number
  montantPaye: number
  montantReste: number
  dateEmission: string
  dateEcheance: string
  logoAtelier?: string
  nomAtelier: string
  notes: string
}

interface FacturesState {
  factures: Facture[]
  getFacturesByUser: (userId: string) => Facture[]
  getFactureById: (id: string) => Facture | undefined
  getFacturesByCliente: (clienteId: string) => Facture[]
  ajouterFacture: (f: Omit<Facture, 'id' | 'numero'>) => void
  modifierFacture: (id: string, f: Partial<Facture>) => void
  supprimerFacture: (id: string) => void
  genererNumero: (userId: string) => string
}

const MOCK_FACTURES: Facture[] = [
  {
    id: 'f1',
    userId: '1',
    clienteId: 'c1',
    clienteNom: 'Aminata Diallo',
    commandeId: 'cmd1',
    commandeDescription: 'Robe ankara',
    numero: 'FAC-2026-001',
    type: 'facture',
    statut: 'partielle',
    montantTotal: 25000,
    montantPaye: 15000,
    montantReste: 10000,
    dateEmission: '2026-06-10',
    dateEcheance: '2026-06-30',
    nomAtelier: 'Couture Pro',
    notes: '',
  },
  {
    id: 'f2',
    userId: '1',
    clienteId: 'c2',
    clienteNom: 'Fatoumata Koné',
    commandeId: 'cmd2',
    commandeDescription: 'Ensemble 2 pièces',
    numero: 'FAC-2026-002',
    type: 'facture',
    statut: 'partielle',
    montantTotal: 45000,
    montantPaye: 20000,
    montantReste: 25000,
    dateEmission: '2026-06-08',
    dateEcheance: '2026-06-28',
    nomAtelier: 'Couture Pro',
    notes: '',
  },
  {
    id: 'f3',
    userId: '1',
    clienteId: 'c3',
    clienteNom: 'Mariam Traoré',
    commandeId: 'cmd3',
    commandeDescription: 'Boubou cérémonie',
    numero: 'REC-2026-001',
    type: 'recu',
    statut: 'payee',
    montantTotal: 35000,
    montantPaye: 35000,
    montantReste: 0,
    dateEmission: '2026-06-05',
    dateEcheance: '2026-06-05',
    nomAtelier: 'Couture Pro',
    notes: 'Payé en espèces',
  },
  {
    id: 'f4',
    userId: '1',
    clienteId: 'c1',
    clienteNom: 'Aminata Diallo',
    commandeId: '',
    commandeDescription: 'Tailleur bureau',
    numero: 'DEV-2026-001',
    type: 'devis',
    statut: 'impayee',
    montantTotal: 60000,
    montantPaye: 0,
    montantReste: 60000,
    dateEmission: '2026-06-09',
    dateEcheance: '2026-06-25',
    nomAtelier: 'Couture Pro',
    notes: 'Devis en attente de validation',
  },
]

export const useFacturesStore = create<FacturesState>()(
  persist(
    (set, get) => ({
      factures: MOCK_FACTURES,

      getFacturesByUser: (userId) =>
        get().factures.filter((f) => f.userId === userId),

      getFactureById: (id) =>
        get().factures.find((f) => f.id === id),

      getFacturesByCliente: (clienteId) =>
        get().factures.filter((f) => f.clienteId === clienteId),

      genererNumero: (userId) => {
        const factures = get().getFacturesByUser(userId)
        const annee = new Date().getFullYear()
        const num = (factures.length + 1).toString().padStart(3, '0')
        return `FAC-${annee}-${num}`
      },

      ajouterFacture: (f) => {
        const numero = get().genererNumero(f.userId)
        set((s) => ({
          factures: [
            ...s.factures,
            { ...f, id: Date.now().toString(), numero },
          ],
        }))
      },

      modifierFacture: (id, f) =>
        set((s) => ({
          factures: s.factures.map((x) => (x.id === id ? { ...x, ...f } : x)),
        })),

      supprimerFacture: (id) =>
        set((s) => ({
          factures: s.factures.filter((x) => x.id !== id),
        })),
    }),
    { name: 'couture-factures' }
  )
)
