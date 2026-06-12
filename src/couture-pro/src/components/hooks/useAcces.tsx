// src/hooks/useAcces.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Hook central de contrôle d'accès selon le forfait de la couturière.
// Usage dans n'importe quelle page :
//   const { peutAcceder, forfait, user, joursRestants } = useAcces()
//   if (!peutAcceder('factures')) return <FeatureGate feature="factures" />
// ─────────────────────────────────────────────────────────────────────────────

import { useAuthStore, type ForfaitAcces, FORFAIT_ACCES } from '@/store/authStore'
import { Link } from 'react-router-dom'

export function useAcces() {
  const { user, getAcces, peutAcceder } = useAuthStore()
  const acces = getAcces()
  const forfait = user?.forfait ?? 'starter'
  const statut = user?.statut ?? 'actif'
  const joursRestants = user?.joursRestants ?? 0

  return {
    user,
    forfait,
    statut,
    joursRestants,
    acces,
    peutAcceder,
    estEssai: statut === 'essai',
    estBloque: statut === 'suspendu' || statut === 'expire',
  }
}

// ─── Libellés lisibles des features ──────────────────────────────────────────
const FEATURE_LABELS: Partial<Record<keyof ForfaitAcces, { titre: string; desc: string; forfaitMin: string }>> = {
  factures: {
    titre: 'Factures & Reçus PDF',
    desc: 'Générez des factures professionnelles avec votre logo, partagez par WhatsApp.',
    forfaitMin: 'Pro',
  },
  paiements: {
    titre: 'Suivi des paiements avancé',
    desc: 'Visualisez dettes, avances et restes à encaisser pour chaque cliente.',
    forfaitMin: 'Pro',
  },
  multiAtelier: {
    titre: 'Multi-atelier',
    desc: 'Gérez jusqu\'à 3 espaces ateliers distincts depuis un seul compte.',
    forfaitMin: 'Elite',
  },
  exportCompta: {
    titre: 'Export comptabilité',
    desc: 'Exportez vos données financières pour votre comptable.',
    forfaitMin: 'Elite',
  },
}

// ─── Composant FeatureGate ────────────────────────────────────────────────────
// Affiche un écran de blocage élégant quand la feature n'est pas accessible.
interface FeatureGateProps {
  feature: keyof ForfaitAcces
  // Optionnel : afficher directement le contenu en overlay
  compact?: boolean
}

export function FeatureGate({ feature, compact = false }: FeatureGateProps) {
  const info = FEATURE_LABELS[feature]
  const titre = info?.titre ?? feature
  const desc = info?.desc ?? 'Cette fonctionnalité n\'est pas disponible avec votre forfait actuel.'
  const forfaitMin = info?.forfaitMin ?? 'Pro'

  if (compact) {
    return (
      <div style={{
        background: '#FFF4ED', border: '1.5px solid #FED7AA',
        borderRadius: 14, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>🔒</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{titre}</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{desc}</div>
          <Link to="/profil" style={{
            display: 'inline-block', background: '#F97316', color: 'white',
            padding: '7px 16px', borderRadius: 50, fontSize: 12, fontWeight: 700,
            textDecoration: 'none',
          }}>
            Passer au forfait {forfaitMin} →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1,
      padding: '60px 32px', textAlign: 'center',
      minHeight: 400,
    }}>
      {/* Icône verrou animée */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: '#FFF4ED', border: '2px solid #FED7AA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, marginBottom: 24,
        boxShadow: '0 8px 24px rgba(249,115,22,0.15)',
      }}>🔒</div>

      <div style={{
        display: 'inline-block', background: '#FFF4ED', color: '#F97316',
        padding: '4px 14px', borderRadius: 50, fontSize: 11, fontWeight: 700,
        marginBottom: 14, border: '1px solid #FED7AA', letterSpacing: 0.5,
      }}>
        FORFAIT {forfaitMin.toUpperCase()} REQUIS
      </div>

      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, margin: '0 0 10px' }}>
        {titre}
      </h3>
      <p style={{ fontSize: 15, color: '#666', maxWidth: 380, lineHeight: 1.6, margin: '0 0 28px' }}>
        {desc}
      </p>

      {/* Ce que le forfait Pro débloque */}
      <div style={{
        background: 'white', border: '1px solid #f0ede8',
        borderRadius: 16, padding: '18px 24px', marginBottom: 28,
        maxWidth: 360, width: '100%', textAlign: 'left',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Avec le forfait {forfaitMin}
        </div>
        {(forfaitMin === 'Pro' ? [
          '✓ Factures & reçus PDF professionnels',
          '✓ Suivi paiements & dettes en temps réel',
          '✓ Clientes illimitées',
          '✓ Toutes les fonctionnalités avancées',
        ] : [
          '✓ Tout le forfait Pro inclus',
          '✓ Multi-atelier (3 espaces)',
          '✓ Export comptabilité',
          '✓ Logo personnalisé sur tous les PDFs',
          '✓ Support WhatsApp prioritaire',
        ]).map(f => (
          <div key={f} style={{ fontSize: 13, color: '#444', padding: '4px 0', display: 'flex', gap: 8 }}>
            <span style={{ color: '#22c55e', flexShrink: 0 }}>{f.startsWith('✓') ? '' : '✓'}</span>
            {f.replace('✓ ', '')}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/profil" style={{
          background: '#F97316', color: 'white',
          padding: '13px 28px', borderRadius: 50, fontSize: 14, fontWeight: 700,
          textDecoration: 'none',
        }}>
          Mettre à niveau → {forfaitMin}
        </Link>
        <Link to="/dashboard" style={{
          background: 'white', color: '#555',
          border: '1.5px solid #e5e0d8',
          padding: '12px 24px', borderRadius: 50, fontSize: 14,
          textDecoration: 'none',
        }}>
          Retour au tableau de bord
        </Link>
      </div>

      <p style={{ fontSize: 12, color: '#bbb', marginTop: 18 }}>
        Contact : support@couturepro.app · WhatsApp disponible sur Pro & Elite
      </p>
    </div>
  )
}

// ─── Bannière d'essai (à mettre en haut des pages) ────────────────────────────
export function BanniereEssai() {
  const { estEssai, joursRestants } = useAcces()
  if (!estEssai) return null

  return (
    <div style={{
      background: 'linear-gradient(90deg, #F97316, #FB923C)',
      color: 'white', padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 13, fontWeight: 500,
    }}>
      <span>
        🎁 Essai gratuit — <strong>{joursRestants} jour{joursRestants > 1 ? 's' : ''} restant{joursRestants > 1 ? 's' : ''}</strong> · Toutes les fonctionnalités débloquées
      </span>
      <Link to="/profil" style={{
        background: 'white', color: '#F97316',
        padding: '5px 14px', borderRadius: 50,
        fontSize: 12, fontWeight: 700, textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}>
        Choisir un forfait
      </Link>
    </div>
  )
}

// ─── Bannière compte bloqué ───────────────────────────────────────────────────
export function BanniereBloquee() {
  const { estBloque, statut } = useAcces()
  if (!estBloque) return null

  return (
    <div style={{
      background: '#FEF2F2', border: '1px solid #FCA5A5',
      color: '#dc2626', padding: '12px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 13,
    }}>
      <span>
        ⚠️ {statut === 'suspendu' ? 'Votre compte a été suspendu.' : 'Votre abonnement a expiré.'} L'accès complet est restreint.
      </span>
      <Link to="/profil" style={{
        background: '#dc2626', color: 'white',
        padding: '5px 14px', borderRadius: 50,
        fontSize: 12, fontWeight: 700, textDecoration: 'none',
      }}>
        Renouveler l'abonnement
      </Link>
    </div>
  )
}