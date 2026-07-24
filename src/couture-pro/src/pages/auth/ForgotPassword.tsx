import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email) {
      setError('Veuillez entrer votre adresse email.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      await api.post('/api/auth/forgot-password', { email })
      // le backend renvoie toujours un message neutre, qu'un compte existe ou non
      setSent(true)
    } catch {
      setError('Impossible de contacter le serveur. Réessayez plus tard.')
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
    boxSizing: 'border-box' as const
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FBF3DC 0%, #FAFAF8 60%, #FBF3DC 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'white', borderRadius: 24, padding: '36px 32px',
        width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800 }}>Mot de passe oublié</h2>

        {sent ? (
          <>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#555', lineHeight: 1.5 }}>
              Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé.
              Vérifiez votre boîte mail.
            </p>
            <Link to="/login" style={{
              display: 'block', textAlign: 'center', color: '#C9A227',
              fontWeight: 700, textDecoration: 'none'
            }}>
              Retour à la connexion
            </Link>
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#888' }}>
              Entrez votre email, nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FCA5A5',
                borderRadius: 10, padding: '10px 14px', fontSize: 13,
                color: '#dc2626', marginBottom: 20
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
                placeholder="votre@email.com"
                style={inp}
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                width: '100%', background: isLoading ? '#e3cb8e' : '#C9A227', color: 'white',
                border: 'none', padding: '14px', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: isLoading ? 'default' : 'pointer', marginBottom: 16
              }}>
              {isLoading ? 'Envoi...' : 'Envoyer le lien'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#888', margin: 0 }}>
              <Link to="/login" style={{ color: '#C9A227', fontWeight: 700, textDecoration: 'none' }}>
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
