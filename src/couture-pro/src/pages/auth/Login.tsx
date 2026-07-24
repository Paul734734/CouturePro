import { useState } from 'react'
import type * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const isLoading = useAuthStore((s) => s.isLoading)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    try {
      await login(email, password)
      // on relit le user fraîchement posé dans le store après un login réussi
      const user = useAuthStore.getState().user
      if (user?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      // err.message vient de authStore (message backend, ex: "Email ou mot de passe incorrect.")
      // en cas de backend injoignable, axios ne renvoie pas de err.response -> message générique
      const message = err?.message || 'Impossible de se connecter. Vérifiez votre connexion internet.'
      setError(message)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin()
    }
  }

  const inp = {
    width: '100%',
    padding: '13px 16px 13px 44px',
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
      {/* LOGO */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img src="/eureka-logo.png" alt="Eureka" style={{
          width: 56, height: 56, borderRadius: 16, objectFit: 'contain', margin: '0 auto 12px'
        }} />
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>Eureka</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Gérez votre atelier, simplement</div>
      </div>

      {/* CARD */}
      <div style={{
        background: 'white', borderRadius: 24, padding: '36px 32px',
        width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800 }}>Bon retour 👋</h2>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#888' }}>Connectez-vous à votre espace atelier</p>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: 10, padding: '10px 14px', fontSize: 13,
            color: '#dc2626', marginBottom: 20
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* EMAIL */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Adresse email</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📧</span>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="votre@email.com"
              style={inp}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Mot de passe</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              style={inp}
              disabled={isLoading}
            />
            <button onClick={() => setShowPass(!showPass)} style={{
              position: 'absolute', right: 14, top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', fontSize: 16, color: '#888'
            }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginBottom: 24 }}>
          <Link to="/forgot-password" style={{ fontSize: 13, color: '#C9A227', textDecoration: 'none', fontWeight: 500 }}>Mot de passe oublié ?</Link>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%', background: isLoading ? '#e3cb8e' : '#C9A227', color: 'white',
            border: 'none', padding: '14px', borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: isLoading ? 'default' : 'pointer', marginBottom: 16
          }}>
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#888', margin: 0 }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: '#C9A227', fontWeight: 700, textDecoration: 'none' }}>S'inscrire gratuitement</Link>
        </p>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: '#aaa' }}>© 2026 Eureka · Données sécurisées 🔒</p>
    </div>
  )
}
