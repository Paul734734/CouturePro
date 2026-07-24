import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { useAdminStore, type AdminUtilisatrice } from '@/store/adminStore'

const STATUT_CONFIG = {
  actif: { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
  essai: { bg: '#dbeafe', color: '#2563eb', label: 'Essai' },
  suspendu: { bg: '#fee2e2', color: '#ef4444', label: 'Suspendue' },
  expire: { bg: '#fef9c3', color: '#854d0e', label: 'Expirée' },
} as const

export default function AdminUtilisatrices() {
  const { utilisatrices, fetchUtilisatrices, modifierUtilisatrice, isLoading, error } = useAdminStore()
  const [filtre, setFiltre] = useState<'toutes' | 'actif' | 'essai' | 'suspendu' | 'expire'>('toutes')
  const [recherche, setRecherche] = useState('')
  const [selected, setSelected] = useState<AdminUtilisatrice | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchUtilisatrices()
  }, [fetchUtilisatrices])

  const toggleStatut = async (id: string, action: 'activer' | 'suspendre') => {
    setUpdating(true)
    try {
      await modifierUtilisatrice(id, { statut: action === 'activer' ? 'actif' : 'suspendu' })
      setSelected(null)
    } finally {
      setUpdating(false)
    }
  }

  const filtrees = utilisatrices.filter((u) => {
    const matchFiltre = filtre === 'toutes' || u.statut === filtre
    const matchRecherche = u.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email.toLowerCase().includes(recherche.toLowerCase()) ||
      (u.nomAtelier ?? '').toLowerCase().includes(recherche.toLowerCase())
    return matchFiltre && matchRecherche
  })

  return (
      <AppLayout titre="Utilisatrices" sousTitre="Gestion des comptes utilisateur" showSidebar={false}>
      <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>
            👥 Utilisatrices
          </h1>
          <p style={{ color: '#888', fontSize: 14, margin: 0 }}>{utilisatrices.length} comptes enregistrés</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="🔍 Rechercher par nom, email, atelier..."
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14,
              border: '1.5px solid #e5e5e5', outline: 'none', background: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { key: 'toutes', label: `Toutes ${utilisatrices.length}` },
            { key: 'actif', label: `Actives ${utilisatrices.filter((u) => u.statut === 'actif').length}` },
            { key: 'essai', label: `Essai ${utilisatrices.filter((u) => u.statut === 'essai').length}` },
            { key: 'suspendu', label: `Suspendues ${utilisatrices.filter((u) => u.statut === 'suspendu').length}` },
            { key: 'expire', label: `Expirées ${utilisatrices.filter((u) => u.statut === 'expire').length}` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key as any)}
              type="button"
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: filtre === f.key ? 'none' : '1px solid #e5e5e5',
                background: filtre === f.key ? '#C9A227' : '#fff',
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrees.map((u) => {
            const sc = STATUT_CONFIG[u.statut]
            return (
              <div
                key={u.id}
                onClick={() => setSelected(u)}
                style={{
                  background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12,
                  padding: '16px 20px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #C9A227, #d9bb5c)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {u.nom.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{u.nom}</div>
                      <div style={{ color: '#888', fontSize: 12 }}>{u.email} · {u.nomAtelier || 'Sans atelier'}</div>
                    </div>
                  </div>
                  <span style={{
                    background: sc.bg, color: sc.color,
                    borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700,
                  }}>
                    {sc.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: '#888' }}>{u.forfait || '—'} · {u.billing || '—'}</span>
                  <span style={{ fontSize: 12, color: '#888' }}>
                    {u.dateExpiration ? `Expire: ${new Date(u.dateExpiration).toLocaleDateString('fr-FR')}` : 'Sans date d\'expiration'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {selected && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
          }}>
            <div style={{
              background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px',
              width: '100%', maxWidth: 500,
            }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C9A227, #d9bb5c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 auto 10px',
                }}>
                  {selected.nom.charAt(0)}
                </div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{selected.nom}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{selected.nomAtelier || 'Sans atelier'}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {[
                  { label: 'Email', val: selected.email },
                  { label: 'Statut', val: STATUT_CONFIG[selected.statut].label },
                  { label: 'Forfait', val: `${selected.forfait || '—'} (${selected.billing || '—'})` },
                  { label: 'Expiration', val: selected.dateExpiration ? new Date(selected.dateExpiration).toLocaleDateString('fr-FR') : '—' },
                  { label: 'Inscription', val: new Date(selected.dateInscription).toLocaleDateString('fr-FR') },
                  { label: 'Jours restants', val: `${selected.joursRestants}` },
                ].map((l) => (
                  <div key={l.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '1px solid #f5f5f5',
                  }}>
                    <span style={{ fontSize: 13, color: '#888' }}>{l.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{l.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.statut !== 'actif' && (
                  <button
                    onClick={() => toggleStatut(selected.id, 'activer')}
                    disabled={updating}
                    type="button"
                    style={{
                      width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                      background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    {updating ? '...' : '✅ Activer le compte'}
                  </button>
                )}
                {selected.statut === 'actif' && (
                  <button
                    onClick={() => toggleStatut(selected.id, 'suspendre')}
                    disabled={updating}
                    type="button"
                    style={{
                      width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                      background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    {updating ? '...' : '⛔ Suspendre le compte'}
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  type="button"
                  style={{
                    width: '100%', padding: '13px', borderRadius: 10, border: '1px solid #e5e5e5',
                    background: '#fff', color: '#555', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
