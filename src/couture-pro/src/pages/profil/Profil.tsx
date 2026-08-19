import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useAuthStore } from '../../store/authStore'
import { uploadPhoto, resolveFileUrl } from '@/lib/api'

export default function Profil() {
  const user = useAuthStore((s) => s.user)
  const updateProfil = useAuthStore((s) => s.updateProfil)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nom: user?.nom || '',
    atelier: user?.nomAtelier || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    ville: user?.ville || '',
    quartier: user?.quartier || '',
    description: user?.description || '',
    logoUrl: user?.logoUrl || '',
  })
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<'profil' | 'securite' | 'abonnement'>('profil')
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [uploadErreur, setUploadErreur] = useState('')

  const handleChoisirLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadErreur('')
    setUploadEnCours(true)
    try {
      const url = await uploadPhoto(file)
      setForm((f) => ({ ...f, logoUrl: url }))
    } catch (err: any) {
      setUploadErreur(err.response?.data?.detail || "Erreur lors de l'envoi du logo.")
    } finally {
      setUploadEnCours(false)
      e.target.value = ''
    }
  }

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom,
        atelier: user.nomAtelier,
        email: user.email,
        telephone: user.telephone || '',
        ville: user.ville || '',
        quartier: user.quartier || '',
        description: user.description || '',
        logoUrl: user.logoUrl || '',
      })
    }
  }, [user])

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }))

  const handleSave = () => {
    updateProfil({
      nom: form.nom,
      nomAtelier: form.atelier,
      email: form.email,
      telephone: form.telephone,
      ville: form.ville,
      quartier: form.quartier,
      description: form.description,
      logoUrl: form.logoUrl,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const expirationDate = user?.dateExpiration ? new Date(user.dateExpiration) : null
  const joursRestants = expirationDate
    ? Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <AppLayout titre="Mon profil">
      <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 'var(--form-bottom-reserve)' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>
            ⚙️ Mon profil
          </h1>
          <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Gérez les informations de votre atelier</p>
        </div>

        <div style={{
          background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14,
          padding: '24px', marginBottom: 16, textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: user?.logoUrl
              ? `center / cover no-repeat url(${resolveFileUrl(user.logoUrl)})`
              : 'linear-gradient(135deg, #C9A227, #d9bb5c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: '#fff',
            margin: '0 auto 12px', overflow: 'hidden',
          }}>
            {!user?.logoUrl && user?.nom?.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>{user?.nom}</div>
          <div style={{ color: '#C9A227', fontSize: 14, fontWeight: 600, marginTop: 2 }}>{user?.nomAtelier}</div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{user?.email}</div>
          <div style={{
            display: 'inline-block', marginTop: 10,
            background: '#FCF6E0', color: '#C9A227', border: '1px solid #e8d28c',
            borderRadius: 20, padding: '3px 14px', fontSize: 12, fontWeight: 600,
          }}>
            Couturière
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 4, marginBottom: 16,
          background: '#fff', borderRadius: 12, padding: 5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
        }}>
          {[
            { key: 'profil', label: '👤 Profil' },
            { key: 'securite', label: '🔒 Sécurité' },
            { key: 'abonnement', label: '💳 Abonnement' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveSection(t.key as any)}
              type="button"
              style={{
                flex: 1, padding: '10px 6px', borderRadius: 8, border: 'none',
                background: activeSection === t.key ? '#C9A227' : 'transparent',
                color: activeSection === t.key ? '#fff' : '#666',
                fontWeight: activeSection === t.key ? 700 : 500,
                fontSize: 12, cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeSection === 'profil' && (
          <div>
            <div style={{
              background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14,
              padding: '20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#C9A227', margin: '0 0 16px', textTransform: 'uppercase' }}>
                🏪 Informations atelier
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'nom', label: 'Votre nom complet', placeholder: 'Nom prénom' },
                  { key: 'atelier', label: "Nom de l'atelier", placeholder: 'Ex: Couture Pro' },
                  { key: 'telephone', label: 'Téléphone', placeholder: '+221 77 000 00 00' },
                  { key: 'ville', label: 'Ville', placeholder: 'Ex: Douala' },
                  { key: 'quartier', label: 'Quartier', placeholder: 'Ex: Bonapriso' },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                      {f.label}
                    </label>
                    <input
                      value={(form as any)[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{
                        width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                        border: '1.5px solid #e5e5e5', outline: 'none', background: '#FAFAF8',
                        boxSizing: 'border-box', color: '#1a1a1a',
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                    Logo de l'atelier
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                      background: form.logoUrl ? `center / cover no-repeat url(${resolveFileUrl(form.logoUrl)})` : '#FAFAF8',
                      border: '1.5px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    }}>
                      {!form.logoUrl && '🏪'}
                    </div>
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                      borderRadius: 10, border: '1.5px solid #e5e5e5', background: '#FAFAF8',
                      fontSize: 13, fontWeight: 600, color: '#555', cursor: uploadEnCours ? 'default' : 'pointer',
                    }}>
                      {uploadEnCours ? 'Envoi...' : form.logoUrl ? 'Changer le logo' : '📷 Choisir un logo'}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleChoisirLogo}
                        disabled={uploadEnCours}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  {uploadErreur && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{uploadErreur}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                    Description de l'atelier
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Décrivez votre atelier, spécialités..."
                    rows={3}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                      border: '1.5px solid #e5e5e5', outline: 'none', background: '#FAFAF8',
                      boxSizing: 'border-box', resize: 'vertical', color: '#1a1a1a',
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: saved ? '#16a34a' : '#C9A227', color: '#fff',
                fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              {saved ? '✅ Enregistré !' : '💾 Enregistrer les modifications'}
            </button>
          </div>
        )}

        {activeSection === 'securite' && (
          <div style={{
            background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14,
            padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#C9A227', margin: '0 0 16px', textTransform: 'uppercase' }}>
              🔒 Changer le mot de passe
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'ancienMdp', label: 'Mot de passe actuel', placeholder: '••••••••' },
                { key: 'nouveauMdp', label: 'Nouveau mot de passe', placeholder: '••••••••' },
                { key: 'confirmerMdp', label: 'Confirmer le nouveau', placeholder: '••••••••' },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type="password"
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                      border: '1.5px solid #e5e5e5', outline: 'none', background: '#FAFAF8',
                      boxSizing: 'border-box', color: '#1a1a1a',
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                style={{
                  width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                  background: '#C9A227', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                🔐 Mettre à jour le mot de passe
              </button>
            </div>

            <div style={{
              marginTop: 20, padding: '14px 16px',
              background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0',
            }}>
              <div style={{ fontWeight: 600, color: '#16a34a', fontSize: 13, marginBottom: 4 }}>
                ✅ Compte sécurisé
              </div>
              <div style={{ color: '#555', fontSize: 12 }}>
                Email : {user?.email}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'abonnement' && (
          <div>
            <div style={{
              background: joursRestants && joursRestants <= 7
                ? 'linear-gradient(135deg, #fee2e2, #fef2f2)'
                : 'linear-gradient(135deg, #FCF6E0, #fff)',
              border: `1px solid ${joursRestants && joursRestants <= 7 ? '#fca5a5' : '#e8d28c'}`,
              borderRadius: 14, padding: '24px', marginBottom: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>
                {joursRestants && joursRestants <= 7 ? '⚠️' : '💳'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', marginBottom: 4 }}>
                Abonnement trimestriel
              </div>
              {expirationDate && (
                <div style={{ color: '#888', fontSize: 14, marginBottom: 12 }}>
                  Expire le : <strong style={{ color: '#1a1a1a' }}>{expirationDate.toLocaleDateString('fr-FR')}</strong>
                </div>
              )}
              {joursRestants !== null && (
                <div style={{
                  display: 'inline-block',
                  background: joursRestants <= 7 ? '#fee2e2' : joursRestants <= 30 ? '#fcf6e0' : '#dcfce7',
                  color: joursRestants <= 7 ? '#ef4444' : joursRestants <= 30 ? '#C9A227' : '#16a34a',
                  borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 700,
                }}>
                  {joursRestants > 0 ? `${joursRestants} jours restants` : 'Abonnement expiré'}
                </div>
              )}
            </div>

            <div style={{
              background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14,
              padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#C9A227', margin: '0 0 14px', textTransform: 'uppercase' }}>
                📦 Renouveler l'abonnement
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: '3 mois', prix: '15 000 FCFA', tag: '' },
                  { label: '6 mois', prix: '27 000 FCFA', tag: 'Économisez 10%' },
                  { label: '12 mois', prix: '48 000 FCFA', tag: 'Meilleur prix' },
                ].map((plan) => (
                  <div key={plan.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', border: '1.5px solid #e5e5e5',
                    borderRadius: 10, cursor: 'pointer', background: '#FAFAF8',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{plan.label}</div>
                      {plan.tag && (
                        <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>
                          ✅ {plan.tag}
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, color: '#C9A227', fontSize: 15 }}>{plan.prix}</div>
                  </div>
                ))}
              </div>
              <button style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: '#C9A227', color: '#fff', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', marginTop: 16,
              }}>
                💰 Payer via MoMo / Orange Money
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
