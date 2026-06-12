import AppLayout from '../../components/layout/AppLayout'
import { formatMontant, formatDate } from '../../lib/utils'

import { useAuthStore } from '@/store/authStore'
import { useCommandesStore } from '@/store/commandesStore'
import { useClientesStore } from '@/store/clientesStore'
import { usePaiementsStore } from '@/store/paiementsStore'
import { useEffect, useMemo, useState } from 'react'

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
          {user?.statut === 'essai' && (
            <div
              style={{
                background: '#FFF4ED',
                border: '1px solid #FED7AA',
                borderRadius: 12,
                padding: '12px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 13, color: '#C2410C', fontWeight: 600 }}>
                🎁 Essai gratuit — {user.joursRestants} jour(s) restant(s) · Forfait {forfaitLabel}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: 50,
                  background: '#F97316',
                  color: 'white',
                }}
              >
                Passer au Pro →
              </span>
            </div>
          )}

          {user?.statut === 'actif' && (
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 12,
                padding: '10px 20px',
                marginBottom: 24,
                fontSize: 12,
                color: '#15803D',
                fontWeight: 600,
              }}
            >
              ✅ Forfait {forfaitLabel} actif · {user.joursRestants} jour(s) restant(s)
            </div>
          )}

          {acces.factures && <SectionFactures />}
          {acces.paiements && <SectionPaiements />}
          {acces.multiAtelier && <SectionMultiAtelier />}

          {!acces.factures && (
            <div
              style={{
                background: '#F9FAFB',
                border: '1.5px dashed #E5E7EB',
                borderRadius: 12,
                padding: '14px 20px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>🔒</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Factures PDF &amp; Suivi paiements</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                  Disponible à partir du forfait Pro ·{' '}
                  <span style={{ color: '#F97316', cursor: 'pointer', fontWeight: 600 }}>Mettre à niveau →</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
              Bonjour{user?.nom ? `, ${user.nom.split(' ')[0]}` : ''} 👋
            </h2>
            <p style={{ color: '#666', fontSize: 14 }}>
              {user?.nomAtelier ? `Voici le résumé de votre atelier "${user.nomAtelier}" aujourd'hui.` : "Voici le résumé de votre atelier aujourd'hui."}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            <div>
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

            <div>
              <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '1px solid #f0ede8', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>À livrer cette semaine</div>
                {commandesUiNormalized
                  .filter((c) => ['pret', 'essayage'].includes(c.statut))
                  .slice(0, 4)
                  .map((c, i, arr) => (
                    <div
                      key={c.id ?? i}
                      style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #f0ede8' : 'none' }}
                    >
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#F97316',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {(c.clienteNom || '').charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{c.clienteNom}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>{c.typeVetement} · {c.dateLivraison ? formatDate(c.dateLivraison) : '—'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '1px solid #f0ede8' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Actions rapides</div>
                {actionsRapides.map((a) => (
                  <button
                    key={a.label}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      marginBottom: 8,
                      background: 'none',
                      border: '1px solid #f0ede8',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

