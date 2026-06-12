import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

const handleLogin = () => {
  if (!email || !password) {
    setError('Veuillez remplir tous les champs.')
    return
  }

  // ✅ Cas admin
  if (email === 'admin@couturepro.app') {
    if (password === 'change-moi-avec-un-mot-de-passe-fort-et-unique') {
      navigate('/admin')
    } else {
      setError('Mot de passe admin incorrect.')
    }
    return
  }

  // ✅ Cas couturière (tout autre email)
  if (password.length >= 4) {
    navigate('/dashboard')
    return
  }

  // ✅ Erreur si rien ne correspond
  setError('Email ou mot de passe incorrect.')
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
      background: 'linear-gradient(135deg, #FFF4ED 0%, #FAFAF8 60%, #FFF4ED 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* LOGO */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, background: '#F97316',
          borderRadius: 16, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 26, margin: '0 auto 12px'
        }}>✂</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>Couture Pro</div>
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
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder="votre@email.com" style={inp} />
          </div>
        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Mot de passe</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError('') }} placeholder="••••••••" style={inp} />
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
          <a href="#" style={{ fontSize: 13, color: '#F97316', textDecoration: 'none', fontWeight: 500 }}>Mot de passe oublié ?</a>
        </div>

        <button onClick={handleLogin} style={{
          width: '100%', background: '#F97316', color: 'white',
          border: 'none', padding: '14px', borderRadius: 12,
          fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16
        }}>
          Se connecter
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#e5e0d8' }} />
          <span style={{ fontSize: 12, color: '#aaa' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: '#e5e0d8' }} />
        </div>

        <button style={{
          width: '100%', background: 'white', border: '1.5px solid #e5e0d8',
          padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 500,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10, marginBottom: 24
        }}>
          <span style={{ fontSize: 18 }}>🖥️</span> Continuer avec Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#888', margin: 0 }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: '#F97316', fontWeight: 700, textDecoration: 'none' }}>S'inscrire gratuitement</Link>
        </p>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: '#aaa' }}>© 2026 Couture Pro · Données sécurisées 🔒</p>
    </div>
  )
}
