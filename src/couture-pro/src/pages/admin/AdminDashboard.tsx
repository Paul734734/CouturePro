import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'

const MOCK_STATS = {
  totalUtilisatrices: 24,
  actives: 18,
  suspendues: 3,
  expirees: 3,
  revenusTotal: 432000,
  revenuesMois: 75000,
}

export default function AdminDashboard() {
  return (
   <AppLayout titre="Panneau d'administration" sousTitre="Vue globale de la plateforme" showSidebar={false}>

      <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>
            🛡️ Panneau d'administration
          </h1>
          <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Vue globale de la plateforme</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total utilisatrices', val: MOCK_STATS.totalUtilisatrices, color: '#1a1a1a', icon: '👩' },
            { label: 'Comptes actifs', val: MOCK_STATS.actives, color: '#16a34a', icon: '✅' },
            { label: 'Suspendus/Expirés', val: MOCK_STATS.suspendues + MOCK_STATS.expirees, color: '#ef4444', icon: '⛔' },
            { label: 'Revenus total', val: `${MOCK_STATS.revenusTotal.toLocaleString()} FCFA`, color: '#1a1a1a', icon: '💰' },
            { label: 'Ce mois', val: `${MOCK_STATS.revenuesMois.toLocaleString()} FCFA`, color: '#F97316', icon: '📅' },
            { label: 'Taux actif', val: `${Math.round((MOCK_STATS.actives / MOCK_STATS.totalUtilisatrices) * 100)}%`, color: '#16a34a', icon: '📊' },
          ].map((s) => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12,
              padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            {
              to: '/admin/utilisatrices', icon: '👥', titre: 'Utilisatrices',
              desc: 'Voir, activer ou suspendre les comptes', color: '#dbeafe',
            },
            {
              to: '/admin/abonnements', icon: '💳', titre: 'Abonnements',
              desc: 'Gérer les abonnements et paiements', color: '#dcfce7',
            },
          ].map((card) => (
            <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14,
                padding: '24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.15s',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: card.color, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22, marginBottom: 14,
                }}>
                  {card.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', marginBottom: 4 }}>{card.titre}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{card.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
