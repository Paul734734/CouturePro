// src/components/Sidebar.tsx
// Affiche les liens de navigation avec lock visuel si la feature est bloquée

import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAcces } from '@/hooks/useAcces'

const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Tableau de bord', icon: '📊', feature: null },
  { path: '/clientes',   label: 'Clientes',         icon: '👥', feature: null },
  { path: '/mesures',    label: 'Mesures',           icon: '📏', feature: null },
  { path: '/commandes',  label: 'Commandes',         icon: '📋', feature: null },
  { path: '/paiements',  label: 'Paiements',         icon: '💰', feature: 'paiements' as const },
  { path: '/factures',   label: 'Factures',          icon: '🧾', feature: 'factures' as const },
]

export default function Sidebar() {
  const location = useLocation()
  const { logout } = useAuthStore()
  const { user, peutAcceder, estEssai, forfait } = useAcces()

  const nomAffiche = user?.nomAtelier || user?.nom || 'Mon Atelier'
  const initiale = nomAffiche.charAt(0).toUpperCase()

  const FORFAIT_LABEL: Record<string, { label: string; couleur: string; bg: string }> = {
    starter: { label: 'Starter', couleur: '#F97316', bg: '#FFF4ED' },
    pro:     { label: 'Pro',     couleur: '#7C3AED', bg: '#F5F3FF' },
    elite:   { label: 'Elite',   couleur: '#0F172A', bg: '#F1F5F9' },
  }
  const forfaitInfo = FORFAIT_LABEL[forfait] ?? FORFAIT_LABEL.starter

  return (
    <aside style={{
      width: 240, background: 'white', borderRight: '1px solid #f0ede8',
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0ede8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: '#F97316', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>✂</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Couture Pro</div>
            <div style={{ fontSize: 11, color: '#888' }}>Gestion atelier</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path
          const isLocked = item.feature !== null && !peutAcceder(item.feature) && !estEssai

          return (
            <Link
              key={item.path}
              to={item.path}
              title={isLocked ? `Disponible à partir du forfait Pro` : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12, marginBottom: 2,
                textDecoration: 'none',
                background: isActive ? '#FFF4ED' : 'transparent',
                color: isActive ? '#F97316' : isLocked ? '#ccc' : '#444',
                fontWeight: isActive ? 700 : 400,
                fontSize: 14,
                transition: 'background 0.15s',
                cursor: isLocked ? 'default' : 'pointer',
                position: 'relative',
              }}
              onClick={e => {
                // On laisse quand même naviguer : la page affichera le FeatureGate
              }}
            >
              {/* Indicator actif */}
              {isActive && (
                <div style={{
                  position: 'absolute', right: 12, width: 6, height: 6,
                  borderRadius: '50%', background: '#F97316',
                }} />
              )}

              <span style={{ fontSize: 16, opacity: isLocked ? 0.4 : 1 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>

              {/* Icône verrou */}
              {isLocked && (
                <span style={{ fontSize: 11, color: '#F97316', background: '#FFF4ED', padding: '2px 6px', borderRadius: 50, fontWeight: 700, flexShrink: 0 }}>
                  🔒 Pro
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bloc forfait */}
      {estEssai && (
        <div style={{
          margin: '0 12px 12px',
          background: 'linear-gradient(135deg, #F97316, #FB923C)',
          borderRadius: 14, padding: '14px',
          color: 'white',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>🎁 Période d'essai</div>
          <div style={{ fontSize: 11, opacity: 0.9, marginBottom: 10 }}>
            {user?.joursRestants} jour{(user?.joursRestants ?? 0) > 1 ? 's' : ''} restant{(user?.joursRestants ?? 0) > 1 ? 's' : ''} · Tout inclus
          </div>
          <Link to="/profil" style={{
            display: 'block', textAlign: 'center',
            background: 'white', color: '#F97316',
            padding: '7px', borderRadius: 50,
            fontSize: 11, fontWeight: 700, textDecoration: 'none',
          }}>
            Choisir mon forfait
          </Link>
        </div>
      )}

      {!estEssai && (
        <div style={{
          margin: '0 12px 12px',
          background: forfaitInfo.bg,
          border: `1px solid ${forfaitInfo.couleur}22`,
          borderRadius: 12, padding: '10px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#888' }}>Forfait actuel</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: forfaitInfo.couleur }}>{forfaitInfo.label}</div>
          </div>
          <Link to="/profil" style={{ fontSize: 11, color: forfaitInfo.couleur, textDecoration: 'none', fontWeight: 600 }}>
            Gérer →
          </Link>
        </div>
      )}

      {/* Profil + déconnexion */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0ede8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F97316', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
            {initiale}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nomAffiche}</div>
            <div style={{ fontSize: 11, color: '#888' }}>Couturière</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%', background: '#FEF2F2', color: '#dc2626',
            border: 'none', padding: '9px', borderRadius: 10,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          📤 Se déconnecter
        </button>
      </div>
    </aside>
  )
}