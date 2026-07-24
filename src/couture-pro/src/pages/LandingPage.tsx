import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import type React from 'react'
import AnimatedSection from '@/components/AnimatedSection'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useNavScroll } from '@/hooks/useNavScroll'
import { useWordMorph } from '@/hooks/useWordMorph'
import { useCountUp } from '@/hooks/useCountUp'

// ─── Styles responsive injectés globalement ───────────────────────────────────
const mobileStyles = `
  @media (max-width: 768px) {
    .cp-nav { padding: 14px 20px !important; }
    .cp-nav-links { display: none !important; }
    .cp-nav-actions { gap: 8px !important; }
    .cp-nav-actions a { font-size: 13px !important; }
    .cp-nav-actions button { padding: 8px 16px !important; font-size: 13px !important; }

    .cp-hero { 
      grid-template-columns: 1fr !important; 
      padding: 40px 20px 40px !important; 
      gap: 40px !important;
    }
    .cp-hero h1 { font-size: 34px !important; }
    .cp-hero p { font-size: 15px !important; }
    .cp-hero-btns { flex-direction: column !important; gap: 10px !important; }
    .cp-hero-btns button { width: 100% !important; text-align: center !important; }
    .cp-dashboard-float { display: none !important; }

    .cp-features-section { padding: 60px 20px 50px !important; }
    .cp-features-section h2 { font-size: 26px !important; }
    .cp-features-grid { 
      grid-template-columns: 1fr !important; 
      gap: 16px !important; 
    }

    .cp-tarifs-section { padding: 60px 20px 50px !important; }
    .cp-tarifs-section h2 { font-size: 26px !important; }
    .cp-tarifs-grid { 
      grid-template-columns: 1fr !important; 
      gap: 20px !important;
    }
    .cp-tarif-card { transform: scale(1) !important; }

    .cp-temo-section { padding: 60px 20px 50px !important; }
    .cp-temo-section h2 { font-size: 26px !important; }
    .cp-temo-card { flex: 0 0 280px !important; }

    .cp-cta-section { padding: 60px 20px !important; }
    .cp-cta-section h2 { font-size: 26px !important; }
    .cp-cta-btns { flex-direction: column !important; align-items: center !important; }
    .cp-cta-btns button { width: 100% !important; max-width: 340px !important; }

    .cp-footer { padding: 24px 20px !important; flex-direction: column !important; text-align: center !important; gap: 12px !important; }

    .cp-modal-plans { grid-template-columns: 1fr !important; gap: 12px !important; }
    .cp-modal-form-grid { grid-template-columns: 1fr !important; }
    .cp-modal-box { padding: 20px 16px 24px !important; }
    .cp-modal-header { padding: 20px 20px 0 !important; }
  }

  @media (max-width: 480px) {
    .cp-hero h1 { font-size: 28px !important; }
    .cp-tarifs-section h2, .cp-features-section h2, .cp-temo-section h2, .cp-cta-section h2 { font-size: 22px !important; }
  }
`

// ─── Modal Inscription ───────────────────────────────────────────────────────
function ModalInscription({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const { register } = useAuthStore()

  const [step, setStep] = useState<1 | 2>(1)
  const [billing, setBilling] = useState<'mensuel' | 'annuel'>('mensuel')
  const [forfait, setForfait] = useState<'starter' | 'pro' | 'elite' | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    prenom: '', nom: '', nomAtelier: '',
    telephone: '', ville: '', email: '',
    password: '', confirm: '',
  })

  const updateField = (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(p => ({ ...p, [key]: e.target.value }))
      setError('')
    }

  const handleSubmit = async () => {
    if (!formData.prenom || !formData.nom || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    if (formData.password !== formData.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (formData.password.length < 6) {
      setError('Mot de passe trop court (6 caractères minimum).')
      return
    }
    setIsLoading(true)
    await register({
      nom: `${formData.prenom} ${formData.nom}`.trim(),
      email: formData.email,
      nomAtelier: formData.nomAtelier || `Atelier de ${formData.prenom}`,
      ville: formData.ville,
      telephone: formData.telephone,
      password: formData.password,
      forfait: forfait ?? 'starter',
      billing,
    })
    const { user } = useAuthStore.getState()
    if (user?.forfait === 'elite') navigate('/dashboard?vue=elite')
    else if (user?.forfait === 'pro') navigate('/dashboard?vue=pro')
    else navigate('/dashboard?vue=starter')
  }

  const plans = [
    {
      id: 'starter',
      nom: 'Starter',
      prix_mensuel: 1000,
      prix_annuel: 10000,
      couleur: '#F97316',
      bg: '#FFF4ED',
      border: '#FED7AA',
      features: ["Jusqu'à 30 clientes", 'Carnet de mesures', 'Gestion commandes', 'Tableau de bord'],
      exclues: ['Factures PDF', 'Suivi paiements avancé'],
    },
    {
      id: 'pro',
      nom: 'Pro',
      prix_mensuel: 1600,
      prix_annuel: 16000,
      couleur: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      badge: '⭐ Populaire',
      features: ['Clientes illimitées', 'Carnet de mesures', 'Gestion commandes', 'Factures & reçus PDF', 'Suivi paiements', 'Tableau de bord complet'],
      exclues: [],
    },
    {
      id: 'elite',
      nom: 'Elite',
      prix_mensuel: 3000,
      prix_annuel: 30000,
      couleur: '#0F172A',
      bg: '#F8FAFC',
      border: '#CBD5E1',
      features: ['Tout Pro inclus', 'Multi-atelier (3 espaces)', 'Export comptabilité', 'Personnalisation logo PDF'],
      exclues: [],
    },
  ] as const

  const getPrix = (p: typeof plans[number]) =>
    billing === 'mensuel' ? p.prix_mensuel : Math.round(p.prix_annuel / 12)

  const getEconomie = (p: typeof plans[number]) =>
    Math.round(((p.prix_mensuel * 12 - p.prix_annuel) / (p.prix_mensuel * 12)) * 100)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="cp-modal-box"
        style={{
          background: 'white', borderRadius: 24, width: '100%',
          maxWidth: step === 1 ? 860 : 520,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          transition: 'max-width 0.3s ease',
          margin: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="cp-modal-header" style={{ padding: '28px 32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#F97316', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              {step === 1 ? 'Étape 1 / 2' : 'Étape 2 / 2'}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
              {step === 1 ? 'Choisissez votre forfait' : 'Créez votre compte'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#F4F4F4', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >✕</button>
        </div>

        {/* Étape 1 : choix forfait */}
        {step === 1 && (
          <div style={{ padding: '24px 32px 32px' }}>
            {/* Toggle mensuel/annuel */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
              <span style={{ fontSize: 14, color: billing === 'mensuel' ? '#1a1a1a' : '#999', fontWeight: billing === 'mensuel' ? 700 : 400 }}>Mensuel</span>
              <div
                style={{
                  width: 50, height: 26, borderRadius: 13,
                  background: billing === 'annuel' ? '#F97316' : '#E5E7EB',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                  flexShrink: 0,
                }}
                onClick={() => setBilling(b => b === 'mensuel' ? 'annuel' : 'mensuel')}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 3, left: billing === 'annuel' ? 27 : 3,
                  transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
              <span style={{ fontSize: 14, color: billing === 'annuel' ? '#1a1a1a' : '#999', fontWeight: billing === 'annuel' ? 700 : 400 }}>
                Annuel{' '}
                <span style={{ background: '#DCFCE7', color: '#16a34a', padding: '2px 8px', borderRadius: 50, fontSize: 11, fontWeight: 700 }}>
                  −{getEconomie(plans[0])}%
                </span>
              </span>
            </div>

            <div className="cp-modal-plans" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {plans.map(p => {
                const selected = forfait === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => setForfait(p.id as any)}
                    style={{
                      border: `2px solid ${selected ? p.couleur : p.border}`,
                      borderRadius: 18, padding: '20px 18px', cursor: 'pointer',
                      background: selected ? p.bg : 'white',
                      position: 'relative',
                      transform: selected ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      boxShadow: selected ? `0 8px 24px ${p.couleur}22` : '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    {'badge' in p && p.badge && (
                      <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: p.couleur, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 50, whiteSpace: 'nowrap' }}>
                        {p.badge}
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, color: p.couleur, marginBottom: 4 }}>{p.nom}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#1a1a1a', marginBottom: 2 }}>
                      {getPrix(p).toLocaleString('fr-FR')}
                      <span style={{ fontSize: 11, fontWeight: 500, color: '#888' }}> FCFA/mois</span>
                    </div>
                    {billing === 'annuel' && (
                      <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginBottom: 12 }}>
                        Facturé {p.prix_annuel.toLocaleString('fr-FR')} FCFA/an
                      </div>
                    )}
                    <div style={{ height: 1, background: '#f0ede8', margin: '12px 0' }} />
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {p.features.map(f => (
                        <li key={f} style={{ fontSize: 12, color: '#444', padding: '3px 0', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: '#22c55e', marginTop: 1 }}>✓</span> {f}
                        </li>
                      ))}
                      {p.exclues.map(f => (
                        <li key={f} style={{ fontSize: 12, color: '#bbb', padding: '3px 0', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: '#ddd' }}>✕</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button
                disabled={!forfait}
                onClick={() => forfait && setStep(2)}
                style={{
                  background: forfait ? '#F97316' : '#E5E7EB', color: forfait ? 'white' : '#aaa',
                  border: 'none', padding: '14px 40px', borderRadius: 50,
                  fontSize: 15, fontWeight: 700, cursor: forfait ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s', width: '100%', maxWidth: 320,
                }}
              >
                Continuer avec {forfait ? plans.find(p => p.id === forfait)?.nom : '...'} →
              </button>
              <div style={{ fontSize: 12, color: '#999', marginTop: 10 }}>7 jours d'essai gratuit · Sans carte bancaire</div>
            </div>
          </div>
        )}

        {/* Étape 2 : formulaire compte */}
        {step === 2 && (
          <div style={{ padding: '24px 32px 32px' }}>
            {forfait && (() => {
              const p = plans.find(x => x.id === forfait)!
              return (
                <div style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 14, padding: '12px 16px', marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 12, color: p.couleur, fontWeight: 700 }}>Forfait {p.nom} · {billing}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', marginLeft: 10 }}>
                      {getPrix(p).toLocaleString('fr-FR')} FCFA/mois
                    </span>
                  </div>
                  <button onClick={() => setStep(1)} style={{ fontSize: 12, color: '#F97316', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Changer</button>
                </div>
              )
            })()}

            <div className="cp-modal-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Prénom *', placeholder: 'Ex : Aminata', type: 'text', key: 'prenom' },
                { label: 'Nom *', placeholder: 'Ex : Koné', type: 'text', key: 'nom' },
                { label: "Nom de l'atelier", placeholder: 'Ex : Atelier Lumière', type: 'text', key: 'nomAtelier', full: true },
                { label: 'Téléphone / WhatsApp', placeholder: '+225 07 00 00 00', type: 'tel', key: 'telephone' },
                { label: 'Ville', placeholder: 'Ex : Abidjan', type: 'text', key: 'ville' },
                { label: 'Email *', placeholder: 'votre@email.com', type: 'email', key: 'email', full: true },
                { label: 'Mot de passe *', placeholder: '••••••••', type: 'password', key: 'password' },
                { label: 'Confirmer le mot de passe *', placeholder: '••••••••', type: 'password', key: 'confirm' },
              ].map(f => (
                <div key={f.label} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={formData[f.key as keyof typeof formData]}
                    onChange={updateField(f.key as keyof typeof formData)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '11px 14px', borderRadius: 10,
                      border: '1.5px solid #E5E7EB', fontSize: 14,
                      outline: 'none', background: '#FAFAFA',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#F97316')}
                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                🎁 7 jours d'essai gratuit inclus — Aucun paiement requis à l'inscription
              </span>
            </div>

            {error && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, fontSize: 13, color: '#dc2626' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                marginTop: 18, width: '100%',
                background: isLoading ? '#FED7AA' : '#F97316',
                color: 'white', border: 'none', padding: '14px',
                borderRadius: 50, fontSize: 15, fontWeight: 700,
                cursor: isLoading ? 'wait' : 'pointer',
              }}
            >
              {isLoading ? 'Création en cours...' : 'Créer mon compte gratuitement'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#888' }}>
              Déjà un compte ?{' '}
              <Link to="/login" onClick={onClose} style={{ color: '#F97316', fontWeight: 600 }}>Se connecter</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const featRef = useRef<HTMLElement>(null)
  const tarifRef = useRef<HTMLElement>(null)
  const temoRef = useRef<HTMLElement>(null)

  const navRef = useRef<HTMLElement>(null)
  useScrollReveal()
  useNavScroll(navRef)
  const { word: morphWord, visible: morphVisible } = useWordMorph()

  const { value: vClientes, ref: refClientes } = useCountUp({ start: 0, end: 48 })
  const { value: vEnCours, ref: refEnCours } = useCountUp({ start: 0, end: 12 })
  const { value: vImpayes, ref: refImpayes } = useCountUp({ start: 0, end: 3 })
  const { value: vLivrees, ref: refLivrees } = useCountUp({ start: 0, end: 127 })

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div style={{ fontFamily: 'Inter,sans-serif', background: '#FAFAF8', color: '#1a1a1a' }}>

      {/* Injection des styles responsive */}
      {/* ─── BANNIÈRE PRÊT ────────────────────────────────────── */}
      <div style={{ background: '#1a1a1a', color: '#D4AF37', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 500 }}>
        À partir d'1 an d'ancienneté, demandez un prêt de 250 000 FCFA pour financer votre prochaine collection.
      </div>
      <style>{mobileStyles}</style>

      {/* ─── NAV ─────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className="cp-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 48px',
          background: 'rgba(250,250,248,0.85)',
          borderBottom: '1px solid #f0ede8',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(249,115,22,0.06)',
          animation: 'bb-float 6s ease-in-out infinite',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img src="/eureka-logo.png" alt="Eureka" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'contain' }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: '#D4AF37' }}>Eureka</span>
        </div>
        <div className="cp-nav-links" style={{ display: 'flex', gap: 32 }}>
          {[
            { label: 'Fonctionnalités', ref: featRef },
            { label: 'Tarifs', ref: tarifRef },
            { label: 'Témoignages', ref: temoRef },
          ].map(l => (
            <a
              key={l.label}
              href="#"
              onClick={e => { e.preventDefault(); scrollTo(l.ref) }}
              style={{ fontSize: 14, color: '#555', textDecoration: 'none', fontWeight: 500 }}
            >{l.label}</a>
          ))}
        </div>
        <div className="cp-nav-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" style={{ fontSize: 14, color: '#F97316', textDecoration: 'none', fontWeight: 500 }}>Connexion</Link>
          <button
            onClick={() => navigate('/register')}
            style={{ background: '#F97316', color: 'white', border: 'none', padding: '10px 22px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >Inscription</button>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section
        className="cp-hero"
        style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '80px 48px 60px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center',
        }}
      >
        <div>
          <div className="cp-badge-glow" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFF4ED', color: '#F97316', padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, marginBottom: 24, border: '1px solid #FED7AA' }}>
            ✨ Plateforme #1 pour les ateliers africains
          </div>

          <h1 style={{ fontSize: 52, lineHeight: 1.1, fontWeight: 900, marginBottom: 20 }}>
            La gestion<br />
            <span
              className="cp-shimmer-text"
              style={{
                display: 'inline-block',
                minWidth: 200,
                transition: 'opacity 0.35s ease, transform 0.35s ease',
                opacity: morphVisible ? 1 : 0,
                transform: morphVisible ? 'translateY(0)' : 'translateY(16px)',
              }}
            >
              {morphWord}
            </span><br />
            pour votre atelier
          </h1>
          <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
            Gérez vos clientes, mesures, commandes et factures depuis votre téléphone. Simple, élégant, taillé pour les couturières-stylistes africaines.
          </p>
          <div className="cp-hero-btns" style={{ display: 'flex', gap: 14, marginBottom: 40, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              className="bb-liv-btn bb-liv-glow"
              style={{ background: '#F97316', color: 'white', padding: '14px 28px', borderRadius: 50, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(249,115,22,0.22)' }}
            >Essayer gratuitement</button>
            <button
              onClick={() => scrollTo(tarifRef)}
              className="bb-liv-btn"
              style={{ background: 'white', color: '#1a1a1a', border: '1.5px solid #e5e0d8', padding: '13px 24px', borderRadius: 50, fontSize: 15, cursor: 'pointer', fontWeight: 600 }}
            >Voir les tarifs →</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {['A', 'M', 'F', 'S', 'N'].map((l, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid white', marginLeft: i === 0 ? 0 : -10, background: ['#F4A261', '#E76F51', '#2A9D8F', '#E9C46A', '#264653'][i], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{l}</div>
              ))}
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid white', marginLeft: -10, background: '#F97316', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>1k+</div>
            </div>
            <div>
              <div><strong>9,5/10</strong> <span style={{ color: '#F97316' }}>★★★★★</span></div>
              <div style={{ fontSize: 13, color: '#555' }}>+1000 couturières satisfaites</div>
            </div>
          </div>

          <div style={{
            marginTop: 24,
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: 14, padding: '14px 18px', maxWidth: 460,
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>💰</span>
            <p style={{ fontSize: 13.5, color: '#7a5b00', lineHeight: 1.6, margin: 0 }}>
              <strong>Bon à savoir :</strong> à partir d'1 an d'ancienneté sur Eureka, vous pouvez demander un prêt de <strong>250 000 FCFA</strong> pour financer votre prochaine collection.
            </p>
          </div>
        </div>

        {/* Dashboard mock — caché sur mobile via CSS */}
        <div className="cp-dashboard-float" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, background: 'white', borderRadius: 14, padding: '14px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid #f0ede8', zIndex: 10 }}>
            <div style={{ fontSize: 11, color: '#888' }}>Recettes ce mois</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>485 000 <span style={{ fontSize: 13, color: '#888' }}>FCFA</span></div>
            <div style={{ fontSize: 11, color: '#22c55e' }}>↑ +23% vs mois dernier</div>
          </div>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e3dc', padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f0ede8' }}>
              {['#ff5f57', '#ffbd2e', '#28ca41'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 4 }}>✂ Eureka — Tableau de bord</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
              <div style={{ background: '#FAFAF8', borderRadius: 12, padding: 14, border: '1px solid #f0ede8' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Clientes</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}><span ref={refClientes as any}>{vClientes}</span></div>
                <div style={{ fontSize: 10, color: '#22c55e', marginTop: 2 }}>↑ +5 ce mois</div>
              </div>
              <div style={{ background: '#FAFAF8', borderRadius: 12, padding: 14, border: '1px solid #f0ede8' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>En cours</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}><span ref={refEnCours as any}>{vEnCours}</span></div>
                <div style={{ fontSize: 10, color: '#22c55e', marginTop: 2 }}>3 à livrer</div>
              </div>
              <div style={{ background: '#FAFAF8', borderRadius: 12, padding: 14, border: '1px solid #f0ede8' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Impayés</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}><span ref={refImpayes as any}>{vImpayes}</span></div>
                <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>↓ 45 000 FCFA</div>
              </div>
            </div>
            <div style={{ background: '#FAFAF8', borderRadius: 12, padding: 12, border: '1px solid #f0ede8' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Commandes récentes</div>
              {[
                { n: 'Aminata Diallo', d: 'Robe ankara · 15 juin', b: 'Livré', bc: '#DCFCE7', tc: '#16a34a' },
                { n: 'Fatoumata Koné', d: 'Ensemble 2 pièces · 18 juin', b: 'En cours', bc: '#FFF4ED', tc: '#F97316' },
                { n: 'Nadia Mbaye', d: 'Boubou · 20 juin', b: 'Essayage', bc: '#EFF6FF', tc: '#2563eb' },
              ].map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid #f0ede8' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{o.n}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{o.d}</div>
                  </div>
                  <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 50, fontWeight: 600, background: o.bc, color: o.tc }}>{o.b}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: -20, left: -20, background: 'white', borderRadius: 14, padding: '14px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid #f0ede8' }}>
            <div style={{ fontSize: 11, color: '#888' }}>Commandes livrées</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}><span ref={refLivrees as any}>{vLivrees}</span></div>
            <div style={{ fontSize: 11, color: '#22c55e' }}>Ce trimestre</div>
          </div>
        </div>
      </section>

      {/* ─── FONCTIONNALITÉS ─────────────────────────────────── */}
      <section ref={featRef} className="cp-reveal cp-features-section" style={{ padding: '90px 48px 80px', background: 'white', scrollMarginTop: 70 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: '#FFF4ED', color: '#F97316', padding: '6px 16px', borderRadius: 50, fontSize: 12, fontWeight: 600, marginBottom: 16, border: '1px solid #FED7AA' }}>Fonctionnalités</div>
          <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12 }}>Tout ce dont vous avez besoin,<br />dans votre poche</h2>
          <p style={{ color: '#666', fontSize: 16, maxWidth: 520, lineHeight: 1.7, marginBottom: 48 }}>Une plateforme pensée pour les ateliers de couture d'Afrique francophone.</p>
          <div className="cp-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { icon: '👥', title: 'Gestion des clientes', desc: "Enregistrez nom, téléphone, ville, style préféré, budget et notes. Retrouvez n'importe quelle cliente en 2 secondes.", bg: '#FFF4ED' },
              { icon: '📏', title: 'Carnet de mesures', desc: 'Toutes les mesures sauvegardées : poitrine, taille, hanche, longueur, manches... Accessible partout, même hors ligne.', bg: '#EFF6FF' },
              { icon: '📋', title: 'Gestion des commandes', desc: 'Créez et suivez chaque commande avec photo du modèle, statut, date de livraison et avances reçues.', bg: '#F0FDF4' },
              { icon: '🧾', title: 'Factures & reçus PDF', desc: 'Générez des factures professionnelles avec votre logo. Partagez par WhatsApp en un clic.', bg: '#FFF4ED' },
              { icon: '💰', title: 'Suivi des paiements', desc: 'Visualisez les dettes en cours, avances reçues et montants à encaisser. Fini les oublis.', bg: '#EFF6FF' },
              { icon: '📊', title: 'Tableau de bord', desc: 'Un résumé clair : recettes du mois, commandes en cours, clientes actives et impayés.', bg: '#F0FDF4' },
            ].map((f, i) => (
              <div
                key={f.title}
                className={`cp-reveal cp-stagger-${i + 1}`}
                style={{
                  background: '#FAFAF8',
                  borderRadius: 20,
                  padding: 28,
                  border: '1px solid #f0ede8',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(-6px) scale(1.02)'
                  el.style.boxShadow = '0 24px 70px rgba(249,115,22,0.12)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(0px) scale(1)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div aria-hidden style={{ position: 'absolute', inset: -60, background: 'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.18), rgba(249,115,22,0) 58%)', filter: 'blur(3px)', pointerEvents: 'none', opacity: 0.9, transform: 'translateZ(0)' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>{f.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TARIFS ──────────────────────────────────────────── */}
      <section ref={tarifRef} className="cp-reveal cp-tarifs-section" style={{ padding: '90px 48px 80px', background: '#FAFAF8', scrollMarginTop: 70 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#FFF4ED', color: '#F97316', padding: '6px 16px', borderRadius: 50, fontSize: 12, fontWeight: 600, marginBottom: 16, border: '1px solid #FED7AA' }}>Tarifs</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12 }}>Des prix adaptés à votre atelier</h2>
            <p style={{ color: '#666', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>Commencez gratuitement pendant 7 jours. Choisissez ensuite le forfait qui vous convient.</p>
          </div>

          <div className="cp-tarifs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'stretch' }}>
            {[
              {
                nom: 'Starter', prix_m: 1000, prix_a: 10000, couleur: '#F97316',
                bg: 'white', border: '#f0ede8', btnBg: '#FFF4ED', btnColor: '#F97316',
                features: ["Jusqu'à 30 clientes", 'Carnet de mesures', 'Gestion commandes', 'Tableau de bord de base'],
                exclues: ['Factures PDF', 'Suivi paiements avancé'],
                desc: 'Idéal pour démarrer',
              },
              {
                nom: 'Pro', prix_m: 1600, prix_a: 16000, couleur: '#7C3AED',
                bg: '#1a1a1a', border: '#1a1a1a', btnBg: '#F97316', btnColor: 'white',
                badge: '⭐ Le plus populaire',
                features: ['Clientes illimitées', 'Carnet de mesures complet', 'Gestion commandes + photos', 'Factures & reçus PDF', 'Suivi paiements & dettes', 'Tableau de bord avancé'],
                exclues: [],
                desc: "Pour l'atelier qui grandit",
              },
              {
                nom: 'Elite', prix_m: 3000, prix_a: 30000, couleur: '#0F172A',
                bg: 'white', border: '#f0ede8', btnBg: '#1a1a1a', btnColor: 'white',
                features: ['Tout Pro inclus', 'Multi-atelier (3 espaces)', 'Export comptabilité', 'Logo personnalisé sur PDFs'],
                exclues: [],
                desc: 'Pour les ateliers confirmés',
              },
            ].map((p) => {
              const isDark = p.bg === '#1a1a1a'
              return (
                <div
                  key={p.nom}
                  className={`bb-tarif-card cp-tarif-card${p.bg === '#1a1a1a' ? ' cp-pro-pulse' : ''}`}
                  style={{
                    background: p.bg, border: `2px solid ${p.border}`, borderRadius: 24,
                    padding: '32px 28px', display: 'flex', flexDirection: 'column',
                    position: 'relative',
                    boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.18)' : '0 4px 16px rgba(0,0,0,0.04)',
                    transform: isDark ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  {p.badge && (
                    <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#F97316', color: 'white', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 50, whiteSpace: 'nowrap' }}>
                      {p.badge}
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#F97316' : p.couleur, letterSpacing: 0.5, marginBottom: 6 }}>{p.nom}</div>
                  <div style={{ fontSize: 13, color: isDark ? '#999' : '#888', marginBottom: 16 }}>{p.desc}</div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: isDark ? 'white' : '#1a1a1a' }}>{p.prix_m.toLocaleString('fr-FR')}</span>
                    <span style={{ fontSize: 13, color: isDark ? '#aaa' : '#888' }}> FCFA/mois</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginBottom: 24 }}>
                    ou {p.prix_a.toLocaleString('fr-FR')} FCFA/an (économisez {Math.round(((p.prix_m * 12 - p.prix_a) / (p.prix_m * 12)) * 100)}%)
                  </div>
                  <div style={{ height: 1, background: isDark ? '#2d2d2d' : '#f0ede8', marginBottom: 20 }} />
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 auto', flex: 1 }}>
                    {p.features.map(f => (
                      <li key={f} style={{ fontSize: 13, color: isDark ? '#ddd' : '#444', padding: '5px 0', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }}>✓</span> {f}
                      </li>
                    ))}
                    {p.exclues?.map(f => (
                      <li key={f} style={{ fontSize: 13, color: isDark ? '#555' : '#bbb', padding: '5px 0', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: isDark ? '#444' : '#ddd', flexShrink: 0, marginTop: 1 }}>✕</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/register')}
                    className={`${p.nom === 'Pro' ? 'bb-liv-btn bb-liv-glow' : 'bb-liv-btn'} bb-tarif-cta`}
                    style={{
                      marginTop: 28, background: p.btnBg, color: p.btnColor,
                      border: 'none', padding: '13px', borderRadius: 50,
                      fontSize: 14, fontWeight: 800, cursor: 'pointer', width: '100%',
                      transition: 'opacity 0.2s',
                      boxShadow: p.nom === 'Pro' ? '0 18px 50px rgba(249,115,22,0.18)' : undefined,
                    }}
                  >
                    Commencer avec {p.nom}
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: 36, padding: '18px 24px', background: 'white', borderRadius: 14, border: '1px solid #f0ede8', boxSizing: 'border-box' }}>
            <span style={{ fontSize: 14, color: '#555' }}>
              🔒 <strong>Abonnement sécurisé</strong> · Résiliation à tout moment · Support WhatsApp inclus · Données privées et protégées
            </span>
          </div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES ─────────────────────────────────────── */}
      <section ref={temoRef} className="cp-reveal cp-temo-section" style={{ padding: '90px 48px 80px', background: 'white', scrollMarginTop: 70 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-block', background: '#FFF4ED', color: '#F97316', padding: '6px 16px', borderRadius: 50, fontSize: 12, fontWeight: 600, marginBottom: 16, border: '1px solid #FED7AA' }}>Témoignages</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12 }}>Ce que disent nos couturières</h2>
            <p style={{ color: '#666', fontSize: 16 }}>Plus de 1000 ateliers font confiance à Eureka chaque jour.</p>
          </div>
          {(() => {
            const temoins = [
              { quote: "Maintenant je sais exactement combien j'ai gagné ce mois, qui me doit quoi, et mes clientes reçoivent leurs factures sur WhatsApp. Fini le cahier !", nom: 'Mariam K.', atelier: 'Atelier Lumière · Abidjan', avatar: 'M', color: '#E76F51', note: 5 },
              { quote: "Les mesures de toutes mes clientes dans mon téléphone. Quand une cliente rappelle, je retrouve tout en 5 secondes. C'est magique !", nom: 'Fatou D.', atelier: 'Style Féminin · Dakar', avatar: 'F', color: '#2A9D8F', note: 5 },
              { quote: "J'ai pu augmenter mes prix car mes factures PDF donnent une image très professionnelle. Mes clientes me font plus confiance maintenant.", nom: 'Nadia B.', atelier: 'Couture Élégance · Douala', avatar: 'N', color: '#264653', note: 5 },
            ]
            const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches : false

            return (
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 13, color: '#F97316', fontWeight: 800 }}>🎤 Témoignages défilants</div>
                  <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Glisse / Scroll / Hover</div>
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    aria-label="Témoignages précédent"
                    onClick={(e) => {
                      const wrap = (e.currentTarget.parentElement?.querySelector('[data-temo-wrap="1"]') as HTMLDivElement | null)
                      wrap?.scrollBy({ left: -320, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
                    }}
                    style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 38, height: 38, borderRadius: 12, border: '1px solid #f0ede8', background: 'white', cursor: 'pointer', fontSize: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
                    className="bb-liv-glow"
                  >‹</button>

                  <button
                    type="button"
                    aria-label="Témoignages suivant"
                    onClick={(e) => {
                      const wrap = (e.currentTarget.parentElement?.querySelector('[data-temo-wrap="1"]') as HTMLDivElement | null)
                      wrap?.scrollBy({ left: 320, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
                    }}
                    style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', zIndex: 5, width: 38, height: 38, borderRadius: 12, border: '1px solid #f0ede8', background: 'white', cursor: 'pointer', fontSize: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
                    className="bb-liv-glow"
                  >›</button>

                  <div
                    data-temo-wrap="1"
                    style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '4px 38px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                  >
                    {temoins.map((t, idx) => (
                      <div
                        key={idx}
                        className="cp-temo-card"
                        style={{
                          flex: '0 0 320px',
                          scrollSnapAlign: 'start',
                          background: '#FAFAF8',
                          borderRadius: 22,
                          padding: 28,
                          border: '1px solid #f0ede8',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'transform 0.18s ease',
                        }}
                        onMouseEnter={(e) => { if (!prefersReducedMotion) (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px) scale(1.02)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0px) scale(1)' }}
                      >
                        <div aria-hidden style={{ position: 'absolute', inset: -80, background: 'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.18), rgba(249,115,22,0) 58%)', filter: 'blur(2px)', pointerEvents: 'none' }} />
                        <div style={{ position: 'relative' }}>
                          <div style={{ color: '#F97316', fontSize: 18, marginBottom: 14 }}>{'★'.repeat(t.note)}</div>
                          <p style={{ fontSize: 15, lineHeight: 1.7, color: '#333', fontStyle: 'italic', marginBottom: 20 }}>"{t.quote}"</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{t.avatar}</div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700 }}>{t.nom}</div>
                              <div style={{ fontSize: 12, color: '#888' }}>{t.atelier}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* ─── CTA FINAL ───────────────────────────────────────── */}
      <section className="cp-reveal cp-cta-section" style={{ padding: '80px 48px', background: 'linear-gradient(135deg,#1a1a1a 0%,#2d1a0a 100%)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 42, fontWeight: 800, color: 'white', marginBottom: 14 }}>Rejoignez +1000 couturières qui ont digitalisé leur atelier</h2>
        <p style={{ color: '#999', fontSize: 16, marginBottom: 36 }}>Commencez gratuitement · Sans carte bancaire · 7 jours offerts</p>
        <div className="cp-cta-btns" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            className="bb-liv-btn bb-liv-glow"
            style={{ background: '#F97316', color: 'white', padding: '14px 32px', borderRadius: 50, fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 18px 50px rgba(249,115,22,0.2)' }}
          >Démarrer gratuitement — 7 jours offerts</button>
          <button
            onClick={() => scrollTo(tarifRef)}
            className="bb-liv-btn"
            style={{ background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.25)', padding: '14px 28px', borderRadius: 50, fontSize: 15, cursor: 'pointer', fontWeight: 700 }}
          >Voir les tarifs</button>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer
        className="cp-footer bb-footer-breathe"
        style={{
          padding: '32px 48px',
          background: '#111',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div aria-hidden style={{ position: 'absolute', inset: -140, background: 'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.22), rgba(249,115,22,0) 58%)', filter: 'blur(10px)', pointerEvents: 'none', opacity: 0.9 }} />
        <span style={{ fontSize: 18, color: 'white', fontWeight: 700, position: 'relative' }}>✂ Eureka</span>
        <span style={{ fontSize: 13, color: '#777', position: 'relative' }}>© 2026 Eureka · Fait avec ❤ pour l'Afrique</span>
        <Link
          to="/login"
          className="bb-liv-btn"
          style={{ fontSize: 13, color: '#F97316', textDecoration: 'none', fontWeight: 800, position: 'relative', padding: '6px 10px', borderRadius: 12, border: '1px solid rgba(249,115,22,0.25)' }}
        >Connexion</Link>
      </footer>

      {/* ─── MODAL ───────────────────────────────────────────── */}
    </div>
  )
}
