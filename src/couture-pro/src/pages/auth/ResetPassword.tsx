import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmer, setConfirmer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!token) {
      setError('Lien invalide : le token de réinitialisation est manquant.')
      return
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (newPassword !== confirmer) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      await api.post('/api/auth/reset-password', { token, newPassword })
      setDone(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Lien invalide ou expiré. Refaites une demande.')
    } finally {
      setIsLoading(false)
    }
  }

  const inp = {
    width: '100%',
    padding: '13px 16px',
    border: '1.5px solid #e5e0d8',
    borderRadius: 12,
    fontSize: 15,
    outline: 'none',
    background: 'white',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF4ED 0%, #FAFAF8 60%, #FFF4ED 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: 'white', borderRadius: 24, padding: '36px 32px',
        width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800 }}>Réinitialiser le mot de passe</h2>

        {done ? (
          <>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#555', lineHeight: 1.5 }}>
              Votre mot de passe a été mis à jour avec succès.
            </p>
            <Link to="/login" style={{
              display: 'block', textAlign: 'center', background: '#F97316', color: 'white',
              padding: '13px', borderRadius: 12, fontWeight: 700, textDecoration: 'none',
            }}>
              Se connecter
            </Link>
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#888' }}>
              Choisissez un nouveau mot de passe pour votre compte.
            </p>

            {!token && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10,
                padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 20,
              }}>
                ⚠️ Lien invalide. Vérifiez que vous avez bien cliqué sur le lien reçu, ou
                {' '}<Link to="/forgot-password" style={{ color: '#dc2626', fontWeight: 700 }}>refaites une demande</Link>.
              </div>
            )}

            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10,
                padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 20,
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                style={inp}
                disabled={isLoading}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmer}
                onChange={(e) => { setConfirmer(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
                placeholder="••••••••"
                style={inp}
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                width: '100%', background: isLoading ? '#fbbf80' : '#F97316', color: 'white',
                border: 'none', padding: '14px', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: isLoading ? 'default' : 'pointer', marginBottom: 16,
              }}>
              {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#888', margin: 0 }}>
              <Link to="/login" style={{ color: '#F97316', fontWeight: 700, textDecoration: 'none' }}>
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
