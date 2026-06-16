import AppLayout from '../../components/layout/AppLayout'
import { formatMontant, formatDate } from '../../lib/utils'

import { useAuthStore } from '@/store/authStore'
import { useCommandesStore } from '@/store/commandesStore'
import { useClientesStore } from '@/store/clientesStore'
import { usePaiementsStore } from '@/store/paiementsStore'
import { useEffect, useMemo, useState } from 'react'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Area,
  Line,
  ReferenceLine,
  LabelList,
} from 'recharts'


type StatutCommande = import('@/types').StatutCommande

type CommandeUi = {
  id?: string
  userId?: string
  typeVetement: string
  statut: StatutCommande
  prixTotal?: number
  avancePaye?: number
  resteAPayer?: number
  dateLivraison?: string
  dateCommande?: string
  clienteId?: string
  clienteNom?: string
  nom?: string
}

const statutConfig: Record<string, { label: string; bg: string; color: string }> = {
  en_attente: { label: 'En attente', bg: '#FFF4ED', color: '#F97316' },
  en_cours: { label: 'En cours', bg: '#EFF6FF', color: '#2563eb' },
  essayage: { label: 'Essayage', bg: '#F5F3FF', color: '#7c3aed' },
  pret: { label: 'Prêt', bg: '#ECFDF5', color: '#059669' },
  livre: { label: 'Livré', bg: '#F0FDF4', color: '#16a34a' },
}

function SectionFactures() {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f0ede8', marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🧾 Factures PDF</div>
      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Accédez à vos factures et générez des PDFs pour vos clientes.</p>
    </div>
  )
}

function SectionPaiements() {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f0ede8', marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>💳 Suivi des paiements</div>
      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Suivez les avances, soldes et dettes de vos clientes.</p>
    </div>
  )
}

function SectionMultiAtelier() {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #f0ede8', marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🏪 Multi-atelier</div>
      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Gérez plusieurs ateliers depuis un seul compte.</p>
    </div>
  )
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const update = () => setReduced(!!mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])
  return reduced
}

function AnimatedStatCard({
  title,
  icon,
  value,
  change,
  ok,
}: {
  title: string
  icon: string
  value: string
  change: string
  ok: boolean
}) {
  const reduced = useReducedMotion()
  const [localValue, setLocalValue] = useState(value)

  const numericValue = useMemo(() => {
    const digits = value.replace(/[^0-9]/g, '')
    return digits ? Number(digits) : null
  }, [value])

  useEffect(() => {
    if (reduced) {
      setLocalValue(value)
      return
    }

    if (numericValue === null) {
      setLocalValue(value)
      return
    }

    const digitsStart = String(localValue).replace(/[^0-9]/g, '')
    const from = digitsStart ? Number(digitsStart) : 0
    const to = numericValue

    const duration = 650
    const t0 = performance.now()

    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const cur = Math.round(from + (to - from) * (p * (2 - p)))
      const suffix = value.includes('FCFA') ? ' FCFA' : ''
      setLocalValue(`${cur.toLocaleString('fr-FR')}${suffix}`)
      if (p < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        padding: 20,
        border: '1px solid #f0ede8',
        transform: 'translateZ(0)',
        animation: reduced ? undefined : 'none',
      }}
      onMouseMove={(e) => {
        if (reduced) return
        const el = e.currentTarget as HTMLDivElement
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        el.style.transform = `rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'rotateX(0deg) rotateY(0deg)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>{localValue}</div>
        </div>
        <div style={{ fontSize: 24 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 12, color: ok ? '#22c55e' : '#ef4444', marginTop: 12 }}>{change}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user, getAcces } = useAuthStore()
  const acces = getAcces()

  const [periodKey, setPeriodKey] = useState<'7' | '4' | '12'>('4')





  const userId = user?.id

  const { getCommandesByUser } = useCommandesStore()
  const { getClientesByUser } = useClientesStore()
  const { getTotalEncaisseByUser, getSuiviByUser } = usePaiementsStore()

  const forfait = user?.forfait ?? 'starter'
  const forfaitLabel = forfait.charAt(0).toUpperCase() + forfait.slice(1)

  const commandes = userId ? getCommandesByUser(userId) : []
  const clientes = userId ? getClientesByUser(userId) : []

  const commandesUi = commandes as unknown as CommandeUi[]

  // Normalisation : selon les données, le nom du client peut être stocké sous `clienteNom` ou `nom`.
  const commandesUiNormalized = useMemo(
    () =>
      commandesUi.map((c) => ({
        ...c,
        clienteNom: c.clienteNom ?? c.nom,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commandesUi]
  )

  const commandesNonSoldnees = commandesUiNormalized.filter((c) => (c.resteAPayer ?? 0) > 0 && c.statut !== 'annule')
  const commandesEnCours = commandesUiNormalized.filter((c) => ['en_cours', 'essayage', 'en_attente'].includes(c.statut))

  const totalEncaisse = userId ? getTotalEncaisseByUser(userId) : 0
  const restesAEncaisser = userId ? getSuiviByUser(userId).reduce((s, x) => s + (x.resteAPayer ?? 0), 0) : 0

  const commandesLivrerCetteSemaine = commandesUiNormalized.filter((c) => ['pret', 'essayage'].includes(c.statut)).slice(0, 4)

  const stats = [
    {
      label: 'Clientes actives',
      value: String(clientes.length),
      change: acces.maxClientes ? `Limite : ${acces.maxClientes} clients` : 'Illimité',
      ok: true,
      icon: '👩',
    },
    {
      label: 'Commandes en cours',
      value: String(commandesEnCours.length),
      change: `${commandesNonSoldnees.length} commande(s) avec reste`,
      ok: true,
      icon: '📋',
    },
    {
      label: 'Recettes encaissées',
      value: formatMontant(totalEncaisse),
      change: 'Somme des paiements enregistrés',
      ok: true,
      icon: '💰',
    },
    {
      label: 'Reste à encaisser',
      value: formatMontant(restesAEncaisser),
      change: commandesNonSoldnees.length ? `${commandesNonSoldnees.length} commande(s) impayée(s)` : 'Aucun impayé',
      ok: restesAEncaisser === 0,
      icon: restesAEncaisser === 0 ? '✅' : '⚠️',
    },
    {
      label: 'À livrer cette semaine',
      value: String(commandesLivrerCetteSemaine.length),
      change: 'Focus livraison (données fictives)',
      ok: true,
      icon: '📦',
    },
  ]

  const actionsRapides = [
    { icon: '👩', label: 'Ajouter une cliente', href: '/clientes/ajouter' },
    { icon: '📋', label: 'Nouvelle commande', href: '/commandes/ajouter' },
    ...(acces.factures ? [{ icon: '🧾', label: 'Créer une facture', href: '/factures' }] : []),
    { icon: '📏', label: 'Saisir des mesures', href: '/mesures' },
    ...(acces.exportCompta ? [{ icon: '📊', label: 'Exporter comptabilité', href: '/admin/abonnements' }] : []),
  ]

  return (
    <AppLayout titre="Tableau de bord" sousTitre="Résumé de votre atelier">
      <div style={{ maxWidth: 1400, position: 'relative' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: -120,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: -60,
              width: 240,
              height: 240,
              background: 'radial-gradient(circle at 30% 30%, rgba(249,115,22,0.35), rgba(249,115,22,0) 60%)',
              filter: 'blur(4px)',
              animation: 'bb-float-1 7.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 180,
              right: -80,
              width: 300,
              height: 300,
              background: 'radial-gradient(circle at 70% 20%, rgba(37,99,235,0.25), rgba(37,99,235,0) 62%)',
              filter: 'blur(5px)',
              animation: 'bb-float-2 8.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 120,
              left: 40,
              width: 260,
              height: 260,
              background: 'radial-gradient(circle at 40% 60%, rgba(16,185,129,0.22), rgba(16,185,129,0) 62%)',
              filter: 'blur(6px)',
              animation: 'bb-float-3 9.2s ease-in-out infinite',
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* BLOC 1 — Bonjour + sous-titre */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
              Bonjour{user?.nom ? `, ${user.nom.split(' ')[0]}` : ''} 👋
            </h2>
            <p style={{ color: '#666', fontSize: 14 }}>
              {user?.nomAtelier ? `Voici le résumé de votre atelier "${user.nomAtelier}" aujourd'hui.` : "Voici le résumé de votre atelier aujourd'hui."}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
            {stats.map((s) => (
              <AnimatedStatCard
                key={s.label}
                title={s.label}
                icon={s.icon}
                value={s.value}
                change={s.change}
                ok={s.ok}
              />
            ))}
          </div>

          {/* BLOC 3 — Commandes récentes (pleine largeur) */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Commandes récentes</h3>
              <a href="#" style={{ fontSize: 13, color: '#F97316', textDecoration: 'none' }}>
                Voir tout →
              </a>
            </div>

            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0ede8', background: '#fafaf8' }}>
                    {['Cliente', 'Vêtement', 'Livraison', 'Avance', 'Statut'].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#888' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commandesUiNormalized.slice(0, 5).map((c, i) => {
                    const s = statutConfig[c.statut] ?? { label: c.statut, bg: '#F0F0F0', color: '#374151' }
                    const avatarInitial = ((c as any).clienteNom || (c as any).nom || '').toString().trim().charAt(0) || '?' 

                    return (
                      <tr
                        key={c.id ?? i}
                        style={{ borderBottom: i < Math.min(commandesUiNormalized.length, 5) - 1 ? '1px solid #f0ede8' : 'none' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: '#F97316',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
 fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {avatarInitial}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{c.clienteNom}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>{c.typeVetement}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>{c.dateLivraison ? formatDate(c.dateLivraison) : '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{formatMontant(c.avancePaye || 0)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 50, fontWeight: 600, background: s.bg, color: s.color }}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BLOC 4 — 📊 Analyse & Performance — Vue hebdomadaire */}
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #f0ede8',
              marginBottom: 24,
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 16, fontWeight: 900 }}>📊 Analyse & Performance — Vue hebdomadaire</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</div>
            </div>

            {/* Toggle période */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              {([
                { key: '7', label: '7 jours' },
                { key: '4', label: '4 semaines' },
                { key: '12', label: '12 semaines' },
              ] as const).map((t) => {
                const active = periodKey === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setPeriodKey(t.key)}
                    style={{
                      border: '1px solid #f0ede8',
                      background: active ? '#F97316' : 'white',
                      color: active ? 'white' : '#374151',
                      borderRadius: 999,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 800,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* Données fictives par semaine */}
            {(() => {
              type Week = {
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

              const base: Array<Pick<Week, 'recettes' | 'reste' | 'commandes'>> = [
                { recettes: 185000, reste: 32000, commandes: 6 },
                { recettes: 210000, reste: 41000, commandes: 8 },
                { recettes: 175000, reste: 28000, commandes: 5 },
                { recettes: 230000, reste: 52000, commandes: 9 },
                { recettes: 195000, reste: 35000, commandes: 7 },
                { recettes: 255000, reste: 48000, commandes: 10 },
                { recettes: 240000, reste: 43000, commandes: 9 },
                { recettes: 280000, reste: 55000, commandes: 11 },
                { recettes: 260000, reste: 38000, commandes: 9 },
                { recettes: 310000, reste: 62000, commandes: 13 },
                { recettes: 290000, reste: 47000, commandes: 11 },
                { recettes: 340000, reste: 58000, commandes: 14 },
              ]


              const weekDates = [
                '06 jan',
                '13 jan',
                '20 jan',
                '27 jan',
                '03 fév',
                '10 fév',
                '17 fév',
                '24 fév',
                '03 mar',
                '10 mar',
                '17 mar',
                '24 mar',
              ]

              const weeksAll: Week[] = base.map((w, i) => {
                const livrees = Math.max(0, Math.round(w.commandes * (0.55 + (i % 3) * 0.03)))
                const enCours = Math.max(0, Math.round(w.commandes * (0.30 + (i % 2) * 0.02)))
                const enRetard = Math.max(0, w.commandes - livrees - enCours)
                const taux = Math.round((w.recettes / Math.max(1, w.recettes + w.reste)) * 100)
                const idx = i + 1
                const label = `S${idx} ${weekDates[i].split(' ')[0].padStart(2, '0')}/${weekDates[i].split(' ')[1]}`
                const dateLabel = `Semaine du ${weekDates[i]}`
                return { idx, label, dateLabel, ...w, livrees, enCours, enRetard, tauxRecouvrement: taux }
              })

              const weeksForPeriod =
                periodKey === '7'
                  ? weeksAll.slice(-7)
                  : periodKey === '12'
                    ? weeksAll.slice(-12)
                    : weeksAll.slice(-4)

              const avgRecettes = weeksForPeriod.reduce((s, x) => s + x.recettes, 0) / Math.max(1, weeksForPeriod.length)
              const avgRecouvrement = weeksForPeriod.reduce((s, x) => s + x.tauxRecouvrement, 0) / Math.max(1, weeksForPeriod.length)

              const prev = weeksForPeriod.length >= 2 ? weeksForPeriod[weeksForPeriod.length - 2] : null
              const curr = weeksForPeriod[weeksForPeriod.length - 1]

              const changePct = (a: number, b: number) => (b === 0 ? 0 : Math.round(((b - a) / a) * 100))

              const lastRecouv = prev ? changePct(prev.tauxRecouvrement, curr.tauxRecouvrement) : 0
              const lastRecetteChange = prev ? changePct(prev.recettes, curr.recettes) : 0
              const lastCmdChange = prev ? changePct(prev.commandes, curr.commandes) : 0

              const spark7 = [...weeksAll.slice(-7).map((w) => w.recettes)]

              const makeSpark = (arr: number[]) => arr.map((v) => ({ v }))

              const sparkRecouv7 = makeSpark(spark7.map((_, i) => 60 + (i * 3) % 30))

              const kpiA = {
                value: `${curr.tauxRecouvrement}%`,
                subtitle: 'des commandes payées cette semaine',
                badgeUp: lastRecouv >= 0,
                badgeText: `${lastRecouv >= 0 ? '↑' : '↓'} ${Math.abs(lastRecouv)}% vs semaine dernière`,
                spark: makeSpark(weeksAll.slice(-7).map((w) => w.tauxRecouvrement)),
              }

              const kpiB = {
                value: `${Math.round(weeksForPeriod.reduce((s, x) => s + x.recettes, 0) / Math.max(1, weeksForPeriod.length)).toLocaleString('fr-FR')} FCFA`,
                subtitle: 'moyenne des 4 dernières semaines',
                badgeUp: lastRecetteChange >= 0,
                badgeText: `${lastRecetteChange >= 0 ? '↑' : '↓'} ${Math.abs(lastRecetteChange)}%`,
                spark: makeSpark(weeksAll.slice(-4).map((w) => w.recettes)),
              }

              const kpiC = {
                value: `${curr.commandes} commandes`,
                subtitle: `dont ${weeksForPeriod.filter((w) => w.idx >= weeksForPeriod[Math.max(0, weeksForPeriod.length - 1)].idx - 2).slice(0, 3).length ? Math.max(1, Math.round(curr.livrees)) : Math.round(curr.livrees)} à livrer cette semaine`,
                badgeUp: lastCmdChange >= 0,
                badgeText: `${lastCmdChange >= 0 ? '↑' : '↓'} ${Math.abs(lastCmdChange)}%`,
                spark: makeSpark(weeksAll.slice(-4).map((w) => w.commandes)),
              }

              const getBadgeBg = (n: number) => {
                if (n > 70) return '#DCFCE7'
                if (n >= 50) return '#FFF4ED'
                return '#FEE2E2'
              }

              return (
                <>
                  {/* KPI cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                    {[kpiA, kpiB, kpiC].map((k, idx) => {
                      const isA = idx === 0

                      const badgeBg = isA ? getBadgeBg(Math.round(curr.tauxRecouvrement)) : '#F0FDF4'

                      const badgeColor = isA
                        ? k.badgeUp
                          ? '#16a34a'
                          : '#ef4444'
                        : k.badgeUp
                          ? '#16a34a'
                          : '#ef4444'

                      return (
                        <div
                          key={idx}
                          style={{
                            background: '#FAFAF8',
                            border: '1px solid #f0ede8',
                            borderRadius: 16,
                            padding: 16,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                          }}
                        >
                          <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 800, marginBottom: 6 }}>
                            {idx === 0 ? 'Taux de recouvrement semaine' : idx === 1 ? 'Recette moyenne par semaine' : 'Commandes cette semaine'}
                          </div>
                          <div style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 2 }}>{k.value}</div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{k.subtitle}</div>

                          <div style={{ width: '100%', height: 40, marginBottom: 10 }}>
                            <ResponsiveContainer width="100%" height={40}>

                              {/* using AreaChart mini with Recharts, but keep simple line */}
                              <BarChart data={k.spark} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                <Bar dataKey="v" fill={idx === 0 ? '#22c55e' : idx === 1 ? '#3B82F6' : '#F97316'} radius={[999, 999, 0, 0]} opacity={0.5} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: badgeBg, color: badgeColor, fontSize: 12, fontWeight: 900 }}>
                            {k.badgeText}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Graph 1: ComposedChart */}
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10 }}>Évolution hebdomadaire du chiffre d'affaires</div>

                          <div style={{ width: '100%', height: 330 }}>
                      <ResponsiveContainer width="100%" height="100%">

                        <ComposedChart data={weeksForPeriod.map((w) => ({
                          semaine: `S${w.idx}`,
                          xLabel: w.label,
                          dateLabel: w.dateLabel,
                          recettes: w.recettes,
                          reste: w.reste,
                          commandes: w.commandes,
                          moyenne: avgRecettes,
                          variation: prev ? changePct(prev.recettes, w.recettes) : 0,
                        }))} margin={{ top: 12, right: 10, left: 0, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="semaine" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: any) => `${Number(v).toLocaleString('fr-FR')}`} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />

                          <Tooltip />
                          <Legend />

                          {/* average reference */}
                          <ReferenceLine yAxisId="left" y={avgRecettes} label={{ value: 'Moy.', position: 'insideBottom', fill: '#9CA3AF', fontSize: 12, fontStyle: 'italic', strokeDasharray: '4 4' }} stroke="#9CA3AF" strokeDasharray="4 4" />

                          <defs>
                            <linearGradient id="recettesGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                          </defs>

                          {/* Area (green) */}
                          <Area dataKey="recettes" yAxisId="left" type="monotone" stroke="#22c55e" fill="url(#recettesGradient)" />

                          {/* Dotted line (orange) */}
                          <Line dataKey="reste" yAxisId="left" type="monotone" stroke="#F97316" strokeWidth={3} strokeDasharray="6 6" dot={{ r: 3, fill: '#F97316' }} />

                          {/* Bars transparent (commands) */}
                          <Bar dataKey="commandes" yAxisId="right" fill="#3B82F6" opacity={0.3} radius={[4, 4, 0, 0]} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Graph 2: BarChart groupé */}
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0ede8', padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10 }}>Commandes par statut — par semaine</div>

                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={weeksForPeriod.map((w) => ({
                            semaine: `S${w.idx}`,
                            livrees: w.livrees,
                            enCours: w.enCours,
                            enRetard: w.enRetard,
                            details: w.dateLabel,
                          }))}
                          margin={{ top: 12, right: 10, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="semaine" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />

                          <Tooltip />

                          <Bar dataKey="livrees" name="Livrées" fill="#1d4ed8" radius={[4, 4, 0, 0]} >
                            <LabelList dataKey="livrees" position="top" fill="#1d4ed8" style={{ fontSize: 12, fontWeight: 800 }} />
                          </Bar>
                          <Bar dataKey="enCours" name="En cours" fill="#F97316" radius={[4, 4, 0, 0]} >
                            <LabelList dataKey="enCours" position="top" fill="#F97316" style={{ fontSize: 12, fontWeight: 800 }} />
                          </Bar>
                          <Bar dataKey="enRetard" name="En retard / impayées" fill="#EF4444" radius={[4, 4, 0, 0]} >
                            <LabelList dataKey="enRetard" position="top" fill="#EF4444" style={{ fontSize: 12, fontWeight: 800 }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>
                    Données fictives — connectées à vos vraies données bientôt
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

