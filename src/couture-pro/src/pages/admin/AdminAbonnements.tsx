import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { useAdminStore, type AdminUtilisatrice } from '@/store/adminStore'
import { FORFAIT_PRIX } from '@/store/authStore'

const STATUT_CONFIG = {
  actif: { bg: '#dcfce7', color: '#16a34a', label: 'Actif', icon: '✅' },
  essai: { bg: '#dbeafe', color: '#2563eb', label: 'Essai', icon: '🕐' },
  suspendu: { bg: '#fee2e2', color: '#ef4444', label: 'Suspendu', icon: '⛔' },
  expire: { bg: '#fee2e2', color: '#ef4444', label: 'Expiré', icon: '❌' },
} as const

function joursRestantsDepuis(dateExpiration?: string): number {
  if (!dateExpiration) return 0
  const diff = new Date(dateExpiration).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function AdminAbonnements() {
  const { utilisatrices, fetchUtilisatrices, modifierUtilisatrice, isLoading, error } = useAdminStore()
  const [filtre, setFiltre] = useState<'tous' | 'actif' | 'essai' | 'suspendu' | 'expire'>('tous')
  const [renewing, setRenewing] = useState<AdminUtilisatrice | null>(null)
  const [mois, setMois] = useState(1)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUtilisatrices()
  }, [fetchUtilisatrices])

  const confirmerRenouvellement = async () => {
    if (!renewing) return
    setSaving(true)
    try {
      // repart de la date d'expiration actuelle si elle est encore dans le futur,
      // sinon repart d'aujourd'hui (évite de "renouveler" dans le passé)
      const base = renewing.dateExpiration && new Date(renewing.dateExpiration).getTime() > Date.now()
        ? new Date(renewing.dateExpiration)
        : new Date()
      const nouvelleDate = new Date(base)
      nouvelleDate.setDate(nouvelleDate.getDate() + mois * 30)

      await modifierUtilisatrice(renewing.id, {
        statut: 'actif',
        dateExpiration: nouvelleDate.toISOString(),
      })
      setRenewing(null)
      setMois(1)
    } finally {
      setSaving(false)
    }
  }

  const filtres = utilisatrices.filter((u) => filtre === 'tous' || u.statut === filtre)

  const totalRevenus = utilisatrices
    .filter((u) => u.statut === 'actif' && u.forfait)
    .reduce((s, u) => s + (FORFAIT_PRIX[u.forfait!]?.mensuel || 0), 0)

  return (
     <AppLayout titre="Abonnements" sousTitre="Gestion des abonnements et paiements" showSidebar={false}>
      <div style={{ maxWidth: 980, margin: '0 auto', paddingBottom: 40 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111' }}>💳 Abonnements</h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>Gestion des abonnements et renouvellements</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Actifs', val: utilisatrices.filter((u) => u.statut === 'actif').length, color: '#16a34a' },
            { label: 'En essai', val: utilisatrices.filter((u) => u.statut === 'essai').length, color: '#2563eb' },
            { label: 'Expirés/Suspendus', val: utilisatrices.filter((u) => u.statut === 'expire' || u.statut === 'suspendu').length, color: '#ef4444' },
            { label: 'Revenus mensuels', val: `${totalRevenus.toLocaleString()} FCFA`, color: '#111' },
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

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { key: 'tous', label: 'Tous' },
            { key: 'actif', label: 'Actifs' },
            { key: 'essai', label: 'Essai' },
            { key: 'suspendu', label: 'Suspendus' },
            { key: 'expire', label: 'Expirés' },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltre(f.key as any)}
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

        {isLoading && utilisatrices.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#888', fontSize: 13 }}>Chargement...</div>
        )}

        <div style={{ display: 'grid', gap: 14 }}>
          {filtres.map((u) => {
            const sc = STATUT_CONFIG[u.statut]
            const jours = joursRestantsDepuis(u.dateExpiration)
            const prixMensuel = u.forfait ? FORFAIT_PRIX[u.forfait]?.mensuel || 0 : 0

            return (
              <div
                key={u.id}
                style={{
                  background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0',
                  padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{u.nom}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>{u.nomAtelier || 'Sans atelier'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Plan</div>
                    <div style={{ fontWeight: 700, color: '#111' }}>{u.forfait || '—'} · {u.billing || '—'}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', marginTop: 16 }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ fontSize: 13, color: '#444' }}>
                      📅 Fin: <strong>{u.dateExpiration ? new Date(u.dateExpiration).toLocaleDateString('fr-FR') : '—'}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: '#444' }}>
                      💰 Prix mensuel: <strong>{prixMensuel.toLocaleString()} FCFA</strong>
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
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{jours} jours</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setRenewing(u); setMois(1) }}
                    style={{
                      padding: '10px 16px', borderRadius: 12, border: 'none',
                      background: '#F97316', color: '#fff', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    🔄 Renouveler
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {renewing && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
          }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Renouveler l'abonnement</h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: '#888' }}>{renewing.nom} · {renewing.nomAtelier || 'Sans atelier'}</p>

              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                Nombre de mois payés
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMois(m)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
                      border: mois === m ? 'none' : '1px solid #e5e5e5',
                      background: mois === m ? '#F97316' : '#fff',
                      color: mois === m ? '#fff' : '#555', cursor: 'pointer',
                    }}
                  >
                    {m} mois
                  </button>
                ))}
              </div>

              <div style={{ background: '#FAFAF8', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#555', marginBottom: 20 }}>
                Nouvelle date d'expiration : <strong>{mois * 30} jours</strong> ajoutés
                {renewing.forfait && (
                  <> · Montant attendu : <strong>{((FORFAIT_PRIX[renewing.forfait]?.mensuel || 0) * mois).toLocaleString()} FCFA</strong></>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setRenewing(null)}
                  disabled={saving}
                  type="button"
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmerRenouvellement}
                  disabled={saving}
                  type="button"
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#F97316', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {saving ? '...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
