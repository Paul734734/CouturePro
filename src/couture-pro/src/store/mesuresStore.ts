import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Mesures {
  id: string
  clienteId: string
  userId: string
  poitrine: number
  taille: number
  hanche: number
  longueurRobe: number
  manches: number
  epaules: number
  bras: number
  sousPoitrine: number
  hauteurPoitrine: number
  ecartPoitrine: number
  longueurJupe: number
  pantalon: number
  notesMorphologie: string
  updatedAt: string
}

interface MesuresState {
  mesures: Mesures[]
  getMesuresByCliente: (clienteId: string) => Mesures | undefined
  getMesuresByUser: (userId: string) => Mesures[]
  sauvegarderMesures: (data: Omit<Mesures, 'id' | 'updatedAt'>) => void
  modifierMesures: (clienteId: string, data: Partial<Mesures>) => void
  supprimerMesures: (clienteId: string) => void
}

const MOCK_MESURES: Mesures[] = [
  {
    id: 'm1',
    clienteId: 'c1',
    userId: '1',
    poitrine: 92,
    taille: 72,
    hanche: 98,
    longueurRobe: 130,
    manches: 58,
    epaules: 38,
    bras: 28,
    sousPoitrine: 78,
    hauteurPoitrine: 24,
    ecartPoitrine: 18,
    longueurJupe: 65,
    pantalon: 100,
    notesMorphologie: 'Morphologie en sablier, épaules larges',
    updatedAt: '2026-06-01',
  },
  {
    id: 'm2',
    clienteId: 'c2',
    userId: '1',
    poitrine: 88,
    taille: 68,
    hanche: 94,
    longueurRobe: 125,
    manches: 55,
    epaules: 36,
    bras: 26,
    sousPoitrine: 74,
    hauteurPoitrine: 22,
    ecartPoitrine: 16,
    longueurJupe: 62,
    pantalon: 98,
    notesMorphologie: 'Morphologie en poire',
    updatedAt: '2026-06-03',
  },
]

export const useMesuresStore = create<MesuresState>()(
  persist(
    (set, get) => ({
      mesures: MOCK_MESURES,

      getMesuresByCliente: (clienteId) =>
        get().mesures.find((m) => m.clienteId === clienteId),

      getMesuresByUser: (userId) =>
        get().mesures.filter((m) => m.userId === userId),

      sauvegarderMesures: (data) => {
        const existing = get().mesures.find((m) => m.clienteId === data.clienteId)

        if (existing) {
          set((s) => ({
            mesures: s.mesures.map((m) =>
              m.clienteId === data.clienteId
                ? { ...m, ...data, updatedAt: new Date().toISOString().split('T')[0] }
                : m
            ),
          }))
          return
        }

        set((s) => ({
          mesures: [
            ...s.mesures,
            {
              ...data,
              id: Date.now().toString(),
              updatedAt: new Date().toISOString().split('T')[0],
            },
          ],
        }))
      },

      modifierMesures: (clienteId, data) =>
        set((s) => ({
          mesures: s.mesures.map((m) =>
            m.clienteId === clienteId
              ? { ...m, ...data, updatedAt: new Date().toISOString().split('T')[0] }
              : m
          ),
        })),

      supprimerMesures: (clienteId) =>
        set((s) => ({
          mesures: s.mesures.filter((m) => m.clienteId !== clienteId),
        })),
    }),
    { name: 'couture-mesures' }
  )
)
