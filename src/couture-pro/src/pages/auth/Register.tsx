import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, type Forfait, type Billing, FORFAIT_PRIX } from '@/store/authStore'
import type * as React from 'react'
import { AFRICAN_COUNTRY_CODES, DEFAULT_COUNTRY_DIAL } from '@/lib/countryCodes'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^(\+?\d{1,4}[\s.-]?)?\d{6,10}$/

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  prenom: string
  nom: string
  nomAtelier: string
  telephone: string
  ville: string
  email: string
  password: string
  confirm: string
}

const FORFAITS = [
  {
    id: 'starter' as Forfait,
    nom: 'Starter',
    couleur: '#C9A227',
    bg: '#FBF3DC',
    border: '#E8D28C',
    desc: 'Pour débuter',
    features: ["Jusqu'à 30 clientes", 'Carnet de mesures', 'Gestion commandes', 'Tableau de bord'],
    exclues: ['Factures PDF', 'Suivi paiements avancé'],
  },
  {
    id: 'pro' as Forfait,
    nom: 'Pro',
    couleur: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    badge: '⭐ Populaire',
    desc: 'Le plus complet',
    features: ['Clientes illimitées', 'Mesures complètes', 'Commandes + photos', 'Factures PDF', 'Suivi paiements & dettes', 'Tableau de bord avancé'],
    exclues: [],
  },
  {
    id: 'elite' as Forfait,
    nom: 'Elite',
    couleur: '#0F172A',
    bg: '#F8FAFC',
    border: '#CBD5E1',
    desc: 'Multi-atelier',
    features: ['Tout Pro inclus', 'Multi-atelier (3)', 'Export comptabilité', 'Logo PDF personnalisé'],
    exclues: [],
  },
]

// ─── Register ─────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()

  const [step, setStep] = useState<1 | 2>(1)
  const [forfait, setForfait] = useState<Forfait>('pro')
  const [billing, setBilling] = useState<Billing>('mensuel')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [indicatif, setIndicatif] = useState<string>(DEFAULT_COUNTRY_DIAL)

  const [form, setForm] = useState<FormData>({
    prenom: '', nom: '', nomAtelier: '',
    telephone: '', ville: '', email: '',
    password: '', confirm: '',
  })

  const update = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }))
    setError('')
    setFieldErrors(p => ({ ...p, [key]: undefined }))
  }

  const getPrix = (f: Forfait) =>
    billing === 'mensuel'
      ? FORFAIT_PRIX[f].mensuel
      : Math.round(FORFAIT_PRIX[f].annuel / 12)

  const getEco = (f: Forfait) =>
    Math.round(((FORFAIT_PRIX[f].mensuel * 12 - FORFAIT_PRIX[f].annuel) / (FORFAIT_PRIX[f].mensuel * 12)) * 100)

const validate = (): boolean => {
  const errs: Partial<Record<keyof FormData, string>> = {}

  if (!form.prenom.trim()) errs.prenom = 'Le prénom est requis.'
  if (!form.nom.trim()) errs.nom = 'Le nom est requis.'

  if (!form.email.trim()) {
    errs.email = "L'email est requis."
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errs.email = 'Format email invalide (ex : nom@exemple.com).'
  }

  if (form.telephone.trim() && !PHONE_REGEX.test(form.telephone.trim())) {
    errs.telephone = 'Numéro invalide (ex : +237 6XX XXX XXX).'
  }

  if (!form.password) {
    errs.password = 'Le mot de passe est requis.'
  } else if (form.password.length < 6) {
    errs.password = 'Minimum 6 caractères.'
  }

  if (!form.confirm) {
    errs.confirm = 'Veuillez confirmer le mot de passe.'
  } else if (form.password !== form.confirm) {
    errs.confirm = 'Les mots de passe ne correspondent pas.'
  }

  setFieldErrors(errs)
  return Object.keys(errs).length === 0
}

const handleSubmit = async () => {
  setError('')
  if (!validate()) {
    setError('Veuillez corriger les champs en rouge ci-dessous.')
    return
  }

  await register({
    nom: `${form.prenom.trim()} ${form.nom.trim()}`.trim(),
    email: form.email.trim().toLowerCase(),
    nomAtelier: form.nomAtelier.trim() || `Atelier de ${form.prenom.trim()}`,
    ville: form.ville.trim(),
    telephone: form.telephone.trim() ? `${indicatif} ${form.telephone.trim()}` : '',
    password: form.password,
    forfait,
    billing,
  })

  // Lire le user depuis le store APRÈS l'appel async
  const { user } = useAuthStore.getState()

  if (user?.forfait === 'elite') {
    navigate('/dashboard?vue=elite')
  } else if (user?.forfait === 'pro') {
    navigate('/dashboard?vue=pro')
  } else {
    navigate('/dashboard?vue=starter')
  }
}
  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB',
    borderRadius: 10, fontSize: 14, outline: 'none',
    background: '#FAFAFA', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
  }
  const lbl: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#374151',
    display: 'block', marginBottom: 5,
  }

  const selectedForfait = FORFAITS.find(f => f.id === forfait)!

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FBF3DC 0%, #FAFAF8 60%, #FBF3DC 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 20px',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <img src="/eureka-logo.png" alt="Eureka" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'contain', margin: '0 auto 10px' }} />
        <div style={{ fontSize: 20, fontWeight: 800 }}>Eureka</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>Créez votre espace atelier gratuitement</div>
      </div>

      {/* Indicateur d'étapes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        {[{ n: 1, label: 'Forfait' }, { n: 2, label: 'Compte' }].map((s, i) => (
          <>
            <div key={s.n} style={{
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                background: step >= s.n ? '#C9A227' : '#E5E7EB',
                color: step >= s.n ? 'white' : '#999',
              }}>{s.n}</div>
              <span style={{ fontSize: 13, fontWeight: step === s.n ? 700 : 400, color: step === s.n ? '#1a1a1a' : '#999' }}>{s.label}</span>
            </div>
            {i === 0 && <div style={{ width: 32, height: 2, background: step >= 2 ? '#C9A227' : '#E5E7EB', borderRadius: 2 }} />}
          </>
        ))}
      </div>

      <div style={{
        background: 'white', borderRadius: 24,
        width: '100%', maxWidth: step === 1 ? 860 : 480,
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        transition: 'max-width 0.3s ease',
        overflow: 'hidden',
      }}>

        {/* ── ÉTAPE 1 : Choix du forfait ─────────────────────── */}
        {step === 1 && (
          <div style={{ padding: '32px 28px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Choisissez votre forfait</h2>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#888' }}>7 jours d'essai gratuit · Sans carte bancaire · Résiliation à tout moment</p>

            {/* Toggle mensuel/annuel */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28, padding: '12px', background: '#FAFAF8', borderRadius: 12, border: '1px solid #f0ede8' }}>
              <span style={{ fontSize: 14, color: billing === 'mensuel' ? '#1a1a1a' : '#999', fontWeight: billing === 'mensuel' ? 700 : 400 }}>Mensuel</span>
              <div
                style={{
                  width: 50, height: 26, borderRadius: 13,
                  background: billing === 'annuel' ? '#C9A227' : '#E5E7EB',
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
                  −{getEco('pro')}%
                </span>
              </span>
            </div>

            {/* Cards forfaits */}
            <div className="cp-grid-3" style={{ gap: 14, marginBottom: 28 }}>
              {FORFAITS.map(p => {
                const selected = forfait === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => setForfait(p.id)}
                    style={{
                      border: `2px solid ${selected ? p.couleur : p.border}`,
                      borderRadius: 18, padding: '20px 16px', cursor: 'pointer',
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
                    {/* Radio indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: p.couleur }}>{p.nom}</span>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: `2px solid ${selected ? p.couleur : '#D1D5DB'}`,
                        background: selected ? p.couleur : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>{p.desc}</div>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a' }}>{getPrix(p.id).toLocaleString('fr-FR')}</span>
                      <span style={{ fontSize: 11, color: '#888' }}> FCFA/mois</span>
                    </div>
                    {billing === 'annuel' && (
                      <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, marginBottom: 12 }}>
                        {FORFAIT_PRIX[p.id].annuel.toLocaleString('fr-FR')} FCFA/an
                      </div>
                    )}
                    <div style={{ height: 1, background: '#f0ede8', margin: '10px 0' }} />
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {p.features.map(f => (
                        <li key={f} style={{ fontSize: 11, color: '#444', padding: '2px 0', display: 'flex', gap: 5 }}>
                          <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span> {f}
                        </li>
                      ))}
                      {p.exclues.map(f => (
                        <li key={f} style={{ fontSize: 11, color: '#bbb', padding: '2px 0', display: 'flex', gap: 5 }}>
                          <span style={{ color: '#ddd', flexShrink: 0 }}>✕</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%', background: '#C9A227', color: 'white',
                border: 'none', padding: '14px', borderRadius: 50,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Continuer avec {selectedForfait.nom} →
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 10, marginBottom: 0 }}>
              Déjà un compte ?{' '}
              <Link to="/login" style={{ color: '#C9A227', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
            </p>
          </div>
        )}

        {/* ── ÉTAPE 2 : Infos compte ────────────────────────── */}
        {step === 2 && (
          <div style={{ padding: '32px 28px' }}>
            {/* Récap forfait */}
            <div style={{
              background: selectedForfait.bg,
              border: `1px solid ${selectedForfait.border}`,
              borderRadius: 12, padding: '12px 16px',
              marginBottom: 22,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: selectedForfait.couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>✂</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedForfait.couleur }}>Forfait {selectedForfait.nom} · {billing}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a' }}>
                    {getPrix(forfait).toLocaleString('fr-FR')} FCFA/mois
                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginLeft: 8 }}>7j gratuits</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(1)} style={{ fontSize: 12, color: '#C9A227', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Changer
              </button>
            </div>

            <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Informations de votre atelier</h2>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: '#888' }}>Vos données sont sécurisées et confidentielles.</p>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
                ⚠️ {error}
              </div>
            )}

            <div className="cp-grid-2" style={{ gap: 12 }}>
              <div>
                <label style={lbl}>Téléphone / WhatsApp</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={indicatif}
                    onChange={(e) => setIndicatif(e.target.value)}
                    style={{
                      ...inp,
                      width: 110,
                      flexShrink: 0,
                      cursor: 'pointer',
                      borderColor: fieldErrors.telephone ? '#DC2626' : '#E5E7EB',
                      background: fieldErrors.telephone ? '#FEF2F2' : '#FAFAFA',
                    }}
                  >
                    {AFRICAN_COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.dial}>
                        {c.flag} {c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={update('telephone')}
                    placeholder="6XX XXX XXX"
                    style={{
                      ...inp,
                      flex: 1,
                      borderColor: fieldErrors.telephone ? '#DC2626' : '#E5E7EB',
                      background: fieldErrors.telephone ? '#FEF2F2' : '#FAFAFA',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = fieldErrors.telephone ? '#DC2626' : '#C9A227')}
                    onBlur={(e) => (e.target.style.borderColor = fieldErrors.telephone ? '#DC2626' : '#E5E7EB')}
                  />
                </div>
                {fieldErrors.telephone && (
                  <span style={{ fontSize: 11, color: '#DC2626', marginTop: 4, display: 'block' }}>
                    {fieldErrors.telephone}
                  </span>
                )}
              </div>
              {[
                { key: 'prenom' as keyof FormData, label: 'Prénom *', placeholder: 'Aminata', type: 'text' },
                { key: 'nom' as keyof FormData, label: 'Nom *', placeholder: 'Koné', type: 'text' },
                { key: 'nomAtelier' as keyof FormData, label: "Nom de l'atelier", placeholder: 'Atelier Lumière', type: 'text', full: true },
                { key: 'ville' as keyof FormData, label: 'Ville', placeholder: 'Yaoundé', type: 'text' },
                { key: 'email' as keyof FormData, label: 'Email *', placeholder: 'votre@email.com', type: 'email', full: true },
                { key: 'password' as keyof FormData, label: 'Mot de passe * (min. 6 car.)', placeholder: '••••••••', type: 'password' },
                { key: 'confirm' as keyof FormData, label: 'Confirmer le mot de passe *', placeholder: '••••••••', type: 'password' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
                  <label style={lbl}>{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={update(f.key)}
                    placeholder={f.placeholder}
                    style={{
                      ...inp,
                      borderColor: fieldErrors[f.key] ? '#DC2626' : '#E5E7EB',
                      background: fieldErrors[f.key] ? '#FEF2F2' : '#FAFAFA',
                    }}
                    onFocus={e => (e.target.style.borderColor = fieldErrors[f.key] ? '#DC2626' : '#C9A227')}
                    onBlur={e => (e.target.style.borderColor = fieldErrors[f.key] ? '#DC2626' : '#E5E7EB')}
                  />
                  {fieldErrors[f.key] && (
                    <span style={{ fontSize: 11, color: '#DC2626', marginTop: 4, display: 'block' }}>
                      {fieldErrors[f.key]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                🎁 7 jours d'essai gratuit — Toutes les fonctionnalités débloquées · Aucun paiement requis
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                width: '100%', background: isLoading ? '#E8D28C' : '#C9A227',
                color: 'white', border: 'none', padding: '14px',
                borderRadius: 50, fontSize: 15, fontWeight: 700,
                cursor: isLoading ? 'wait' : 'pointer', marginTop: 18,
              }}
            >
              {isLoading ? 'Création en cours...' : 'Créer mon compte gratuitement →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 14, marginBottom: 0 }}>
              En créant un compte, vous acceptez nos CGU. Données sécurisées.
            </p>
          </div>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: '#bbb', textAlign: 'center' }}>
        © 2026 Eureka · Fait avec ❤ pour l'Afrique
      </p>
    </div>
  )
}