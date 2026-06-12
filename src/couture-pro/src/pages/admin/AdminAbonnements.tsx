import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'

interface Abonnement {
  id: string
  utilisatriceNom: string
  atelier: string
  plan: '3 mois' | '6 mois' | '12 mois'
  montant: number
  dateDebut: string
  dateFin: string
  statut: 'actif' | 'expire' | 'grace'
  joursRestants: number
}

const MOCK_ABONNEMENTS: Abonnement[] = [
  { id: 'a1', utilisatriceNom: 'Aïcha Koné', atelier: 'Atelier Koné', plan: '3 mois', montant: 15000, dateDebut: '2026-07-01', dateFin: '2026-09-30', statut: 'actif', joursRestants: 111 },
  { id: 'a2', utilisatriceNom: 'Fatou Diop', atelier: 'Mode Fatou', plan: '6 mois', montant: 27000, dateDebut: '2026-02-15', dateFin: '2026-08-15', statut: 'actif', joursRestants: 65 },
  { id: 'a3', utilisatriceNom: 'Aminata Touré', atelier: 'Amina Fashion', plan: '12 mois', montant: 48000, dateDebut: '2026-10-01', dateFin: '2026-10-01', statut: 'actif', joursRestants: 112 },
  { id: 'a4', utilisatriceNom: 'Mariama Bah', atelier: 'Bah Couture', plan: '3 mois', montant: 15000, dateDebut: '2026-02-01', dateFin: '2026-05-01', statut: 'grace', joursRestants: 3 },
  { id: 'a5', utilisatriceNom: 'Kadiatou Camara', atelier: 'KadiStyle', plan: '3 mois', montant: 15000, dateDebut: '2026-03-01', dateFin: '2026-05-30', statut: 'expire', joursRestants: 0 },
]

const STATUT_CONFIG = {
  actif: { bg: '#dcfce7', color: '#16a34a', label: 'Actif', icon: '✅' },
  grace: { bg: '#fff7ed', color: '#F97316', label: 'Période de grâce', icon: '⚠️' },
  expire: { bg: '#fee2e2', color: '#ef4444', label: 'Expiré', icon: '❌' },
}

const maxDaysForPlan = (plan: Abonnement['plan']) => {
  switch (plan) {
    case '3 mois':
      return 90
    case '6 mois':
      return 180
    case '12 mois':
      return 365
    default:
      return 90
  }
}

export default function AdminAbonnements() {
  const [abonnements, setAbonnements] = useState(MOCK_ABONNEMENTS)
  const [filtre, setFiltre] = useState<'tous' | 'actif' | 'grace' | 'expire'>('tous')

  const renouveler = (id: string) => {
    setAbonnements((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        const nouvelleFin = new Date()
        nouvelleFin.setMonth(nouvelleFin.getMonth() + 3)
        return {
          ...a,
          statut: 'actif',
          dateFin: nouvelleFin.toISOString().split('T')[0],
          joursRestants: 90,
        }
      })
    )
  }

  const filtres = abonnements.filter((a) => filtre === 'tous' || a.statut === filtre)

  const totalRevenus = abonnements
    .filter((a) => a.statut === 'actif')
    .reduce((s, a) => s + a.montant, 0)

  return (
     <AppLayout titre="Abonnements" sousTitre="Gestion des abonnements et paiements" showSidebar={false}>
      <div style={{ maxWidth: 980, margin: '0 auto', paddingBottom: 40 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111' }}>💳 Abonnements</h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>Gestion des abonnements et renouvellements</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Actifs', val: abonnements.filter((a) => a.statut === 'actif').length, color: '#16a34a' },
            { label: 'En grâce', val: abonnements.filter((a) => a.statut === 'grace').length, color: '#F97316' },
            { label: 'Expirés', val: abonnements.filter((a) => a.statut === 'expire').length, color: '#ef4444' },
            { label: 'Revenus actifs', val: `${totalRevenus.toLocaleString()} FCFA`, color: '#111' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: '#fff', borderRadius: 14, padding: 20,
                border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {abonnements.some((a) => a.statut === 'grace') && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, background: '#fffbeb',
            border: '1px solid #fef3c7', borderRadius: 14, padding: 18, marginBottom: 24,
          }}>
            <div style={{ fontSize: 24 }}>⚠️</div>
            <div>
              <div style={{ fontWeight: 700, color: '#92400e' }}>
                {abonnements.filter((a) => a.statut === 'grace').length} compte(s) en période de grâce
              </div>
              <div style={{ color: '#7c2d12', fontSize: 13 }}>
                L'accès sera bloqué automatiquement après 7 jours sans renouvellement.
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { key: 'tous', label: 'Tous' },
            { key: 'actif', label: 'Actifs' },
            { key: 'grace', label: 'En grâce' },
            { key: 'expire', label: 'Expirés' },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltre(f.key as 'tous' | 'actif' | 'grace' | 'expire')}
              style={{
                padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: filtre === f.key ? 'none' : '1px solid #e5e5e5',
                background: filtre === f.key ? '#F97316' : '#fff',
                color: filtre === f.key ? '#fff' : '#555', cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          {filtres.map((a) => {
            const sc = STATUT_CONFIG[a.statut]
            const maxDays = maxDaysForPlan(a.plan)
            const progress = Math.max(0, Math.min(100, Math.round(((maxDays - a.joursRestants) / maxDays) * 100)))

            return (
              <div
                key={a.id}
                style={{
                  background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0',
                  padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{a.utilisatriceNom}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>{a.atelier}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Plan</div>
                    <div style={{ fontWeight: 700, color: '#111' }}>{a.plan}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', marginTop: 16 }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ fontSize: 13, color: '#444' }}>
                      📅 Fin: <strong>{new Date(a.dateFin).toLocaleDateString('fr-FR')}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: '#444' }}>
                      💰 Montant: <strong>{a.montant.toLocaleString()} FCFA</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: sc.bg, color: sc.color, borderRadius: 999,
                      padding: '6px 12px', fontSize: 12, fontWeight: 700,
                    }}>
                      <span>{sc.icon}</span>
                      <span>{sc.label}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Jours restants</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{a.joursRestants} jours</div>
                  </div>
                  {(a.statut === 'expire' || a.statut === 'grace') ? (
                    <button
                      type="button"
                      onClick={() => renouveler(a.id)}
                      style={{
                        padding: '10px 16px', borderRadius: 12, border: 'none',
                        background: '#F97316', color: '#fff', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      🔄 Renouveler
                    </button>
                  ) : null}
                </div>

                {a.statut === 'actif' && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#888' }}>Progression</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{progress}%</span>
                    </div>
                    <div style={{ background: '#f3f4f6', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: '#34d399', borderRadius: 999, transition: 'width 0.2s ease' }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
