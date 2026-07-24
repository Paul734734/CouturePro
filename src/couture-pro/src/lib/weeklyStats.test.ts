import { describe, it, expect } from 'vitest'
import { calculerSemaines, variationPct } from './weeklyStats'

describe('calculerSemaines', () => {
  it('renvoie tout à zéro quand il n\'y a aucune commande ni paiement', () => {
    const semaines = calculerSemaines([], [], 4, new Date('2026-07-24'))
    expect(semaines).toHaveLength(4)
    for (const s of semaines) {
      expect(s.recettes).toBe(0)
      expect(s.reste).toBe(0)
      expect(s.commandes).toBe(0)
      expect(s.livrees).toBe(0)
      expect(s.enCours).toBe(0)
      expect(s.enRetard).toBe(0)
      expect(s.tauxRecouvrement).toBe(0)
    }
  })

  it('place une commande dans la bonne semaine et met à jour les compteurs', () => {
    const maintenant = new Date('2026-07-24') // vendredi
    const commandes = [
      { dateCommande: '2026-07-21', statut: 'livre' as const, resteAPayer: 0 }, // même semaine (lundi 20/07)
      { dateCommande: '2026-07-14', statut: 'en_cours' as const, resteAPayer: 5000 }, // semaine précédente (lundi 13/07)
    ]
    const semaines = calculerSemaines(commandes, [], 4, maintenant)
    const derniere = semaines[semaines.length - 1]
    const avantDerniere = semaines[semaines.length - 2]

    expect(derniere.commandes).toBe(1)
    expect(derniere.livrees).toBe(1)
    expect(avantDerniere.commandes).toBe(1)
    expect(avantDerniere.enCours).toBe(1)
    expect(avantDerniere.reste).toBe(5000)
  })

  it('additionne les paiements réels dans les recettes de la semaine', () => {
    const maintenant = new Date('2026-07-24')
    const paiements = [
      { date: '2026-07-22', montant: 15000 },
      { date: '2026-07-23', montant: 5000 },
    ]
    const semaines = calculerSemaines([], paiements, 2, maintenant)
    const derniere = semaines[semaines.length - 1]
    expect(derniere.recettes).toBe(20000)
  })

  it('calcule un taux de recouvrement cohérent, jamais de division par zéro', () => {
    const maintenant = new Date('2026-07-24')
    const commandes = [{ dateCommande: '2026-07-21', statut: 'en_cours' as const, resteAPayer: 25000 }]
    const paiements = [{ date: '2026-07-21', montant: 75000 }]
    const semaines = calculerSemaines(commandes, paiements, 1, maintenant)
    expect(semaines[0].tauxRecouvrement).toBe(75) // 75000 / (75000+25000)
  })

  it('ignore les dates hors de la période demandée', () => {
    const maintenant = new Date('2026-07-24')
    const commandes = [{ dateCommande: '2020-01-01', statut: 'livre' as const, resteAPayer: 0 }]
    const semaines = calculerSemaines(commandes, [], 4, maintenant)
    expect(semaines.reduce((s, w) => s + w.commandes, 0)).toBe(0)
  })
})

describe('variationPct', () => {
  it('renvoie 0 quand les deux valeurs sont nulles', () => {
    expect(variationPct(0, 0)).toBe(0)
  })
  it('renvoie 100 quand on part de 0 vers une valeur positive', () => {
    expect(variationPct(0, 500)).toBe(100)
  })
  it('calcule un pourcentage de variation classique', () => {
    expect(variationPct(100, 150)).toBe(50)
    expect(variationPct(200, 100)).toBe(-50)
  })
})
