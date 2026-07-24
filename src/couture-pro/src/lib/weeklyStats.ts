// Calcul des statistiques hebdomadaires du tableau de bord à partir des
// VRAIES commandes et VRAIS paiements de l'utilisatrice — plus aucune
// donnée fictive. Quand il n'y a pas encore de commandes/paiements, tous
// les compteurs et graphes valent 0 : c'est l'usage réel du dashboard
// (saisie de commandes/paiements) qui les fait bouger.

export type StatutCommandeLite = 'en_attente' | 'en_cours' | 'essayage' | 'pret' | 'livre' | 'annule'

export interface CommandeForStats {
  dateCommande?: string
  statut: StatutCommandeLite
  resteAPayer?: number
}

export interface PaiementForStats {
  date: string
  montant: number
}

export interface Week {
  idx: number
  label: string
  dateLabel: string
  recettes: number
  reste: number
  commandes: number
  livrees: number
  enCours: number
  enRetard: number
  tauxRecouvrement: number
}

const MS_PAR_JOUR = 24 * 60 * 60 * 1000

/** Lundi 00:00:00 de la semaine contenant `date`. */
function debutSemaine(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const jour = d.getDay() // 0 = dimanche
  const decalage = jour === 0 ? -6 : 1 - jour
  d.setDate(d.getDate() + decalage)
  return d
}

function formatLabelCourt(date: Date): string {
  const jj = String(date.getDate()).padStart(2, '0')
  const mois = date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
  return `${jj} ${mois}`
}

/**
 * Construit `nbSemaines` semaines consécutives se terminant à la semaine
 * courante (incluse), à partir des commandes et paiements réels. Chaque
 * semaine sans donnée reste à 0 partout — aucune valeur inventée.
 */
export function calculerSemaines(
  commandes: CommandeForStats[],
  paiements: PaiementForStats[],
  nbSemaines: number,
  maintenant: Date = new Date()
): Week[] {
  const semaineActuelle = debutSemaine(maintenant)
  const premiereSemaine = new Date(semaineActuelle)
  premiereSemaine.setDate(premiereSemaine.getDate() - 7 * (nbSemaines - 1))

  const semaines: Week[] = Array.from({ length: nbSemaines }, (_, i) => {
    const debut = new Date(premiereSemaine)
    debut.setDate(debut.getDate() + 7 * i)
    return {
      idx: i + 1,
      label: `S${i + 1} ${formatLabelCourt(debut)}`,
      dateLabel: `Semaine du ${formatLabelCourt(debut)}`,
      recettes: 0,
      reste: 0,
      commandes: 0,
      livrees: 0,
      enCours: 0,
      enRetard: 0,
      tauxRecouvrement: 0,
    }
  })

  const indexPourDate = (dateStr?: string): number | null => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return null
    const debutJour = debutSemaine(d)
    const diffSemaines = Math.round((debutJour.getTime() - premiereSemaine.getTime()) / (7 * MS_PAR_JOUR))
    if (diffSemaines < 0 || diffSemaines >= nbSemaines) return null
    return diffSemaines
  }

  for (const c of commandes) {
    const i = indexPourDate(c.dateCommande)
    if (i === null) continue
    const s = semaines[i]
    s.commandes += 1
    if (c.statut === 'livre') s.livrees += 1
    else if (['en_cours', 'essayage', 'en_attente'].includes(c.statut)) s.enCours += 1
    if ((c.resteAPayer ?? 0) > 0 && c.statut !== 'annule') s.reste += c.resteAPayer ?? 0
  }
  for (const s of semaines) {
    s.enRetard = Math.max(0, s.commandes - s.livrees - s.enCours)
  }

  for (const p of paiements) {
    const i = indexPourDate(p.date)
    if (i === null) continue
    semaines[i].recettes += p.montant ?? 0
  }

  for (const s of semaines) {
    const denom = s.recettes + s.reste
    s.tauxRecouvrement = denom > 0 ? Math.round((s.recettes / denom) * 100) : 0
  }

  return semaines
}

export function variationPct(a: number, b: number): number {
  if (a === 0) return b === 0 ? 0 : 100
  return Math.round(((b - a) / a) * 100)
}
