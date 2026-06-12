import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'

interface Utilisatrice {
  id: string
  nom: string
  email: string
  atelier: string
  statut: 'active' | 'suspendue' | 'expiree'
  abonnementExpire: string
  dateInscription: string
  nbClientes: number
  nbCommandes: number
}

const MOCK_UTILISATRICES: Utilisatrice[] = [
  { id: '1', nom: 'Aïcha Koné', email: 'aicha@gmail.com', atelier: 'Atelier Koné', statut: 'active', abonnementExpire: '2026-09-30', dateInscription: '2026-01-15', nbClientes: 12, nbCommandes: 28 },
  { id: '2', nom: 'Fatou Diop', email: 'fatou@gmail.com', atelier: 'Mode Fatou', statut: 'active', abonnementExpire: '2026-08-15', dateInscription: '2026-02-01', nbClientes: 8, nbCommandes: 15 },
  { id: '3', nom: 'Mariama Bah', email: 'mariama@gmail.com', atelier: 'Bah Couture', statut: 'suspendue', abonnementExpire: '2026-05-01', dateInscription: '2026-01-20', nbClientes: 5, nbCommandes: 9 },
  { id: '4', nom: 'Kadiatou Camara', email: 'kadi@gmail.com', atelier: 'KadiStyle', statut: 'expiree', abonnementExpire: '2026-05-30', dateInscription: '2026-03-10', nbClientes: 3, nbCommandes: 4 },
  { id: '5', nom: 'Aminata Touré', email: 'amina@gmail.com', atelier: 'Amina Fashion', statut: 'active', abonnementExpire: '2026-10-01', dateInscription: '2026-04-05', nbClientes: 15, nbCommandes: 32 },
]

const STATUT_CONFIG = {
  active: { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
  suspendue: { bg: '#fee2e2', color: '#ef4444', label: 'Suspendue' },
  expiree: { bg: '#fef9c3', color: '#854d0e', label: 'Expirée' },
}

export default function AdminUtilisatrices() {
  const [utilisatrices, setUtilisatrices] = useState(MOCK_UTILISATRICES)
  const [filtre, setFiltre] = useState<'toutes' | 'active' | 'suspendue' | 'expiree'>('toutes')
  const [recherche, setRecherche] = useState('')
  const [selected, setSelected] = useState<Utilisatrice | null>(null)

  const toggleStatut = (id: string, action: 'activer' | 'suspendre') => {
    setUtilisatrices((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, statut: action === 'activer' ? 'active' : 'suspendue' } : u
      )
    )
    setSelected(null)
  }

  const filtrees = utilisatrices.filter((u) => {
    const matchFiltre = filtre === 'toutes' || u.statut === filtre
    const matchRecherche = u.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email.toLowerCase().includes(recherche.toLowerCase()) ||
      u.atelier.toLowerCase().includes(recherche.toLowerCase())
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
            { key: 'active', label: `Actives ${utilisatrices.filter((u) => u.statut === 'active').length}` },
            { key: 'suspendue', label: `Suspendues ${utilisatrices.filter((u) => u.statut === 'suspendue').length}` },
            { key: 'expiree', label: `Expirées ${utilisatrices.filter((u) => u.statut === 'expiree').length}` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key as any)}
              type="button"
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: filtre === f.key ? 'none' : '1px solid #e5e5e5',
                background: filtre === f.key ? '#F97316' : '#fff',
                color: filtre === f.key ? '#fff' : '#555', cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

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
                      background: 'linear-gradient(135deg, #F97316, #fb923c)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {u.nom.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{u.nom}</div>
                      <div style={{ color: '#888', fontSize: 12 }}>{u.email} · {u.atelier}</div>
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
                  <span style={{ fontSize: 12, color: '#888' }}>👥 {u.nbClientes} clientes</span>
                  <span style={{ fontSize: 12, color: '#888' }}>📦 {u.nbCommandes} commandes</span>
                  <span style={{ fontSize: 12, color: '#888' }}>
                    Expire: {new Date(u.abonnementExpire).toLocaleDateString('fr-FR')}
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
                  background: 'linear-gradient(135deg, #F97316, #fb923c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 auto 10px',
                }}>
                  {selected.nom.charAt(0)}
                </div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{selected.nom}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{selected.atelier}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {[
                  { label: 'Email', val: selected.email },
                  { label: 'Statut', val: STATUT_CONFIG[selected.statut].label },
                  { label: 'Expiration', val: new Date(selected.abonnementExpire).toLocaleDateString('fr-FR') },
                  { label: 'Inscription', val: new Date(selected.dateInscription).toLocaleDateString('fr-FR') },
                  { label: 'Clientes', val: `${selected.nbClientes}` },
                  { label: 'Commandes', val: `${selected.nbCommandes}` },
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
                {selected.statut !== 'active' && (
                  <button
                    onClick={() => toggleStatut(selected.id, 'activer')}
                    type="button"
                    style={{
                      width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                      background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    ✅ Activer le compte
                  </button>
                )}
                {selected.statut === 'active' && (
                  <button
                    onClick={() => toggleStatut(selected.id, 'suspendre')}
                    type="button"
                    style={{
                      width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                      background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    ⛔ Suspendre le compte
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
