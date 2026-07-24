import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'


const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Tableau de bord' },
  { href: '/clientes', icon: '👩‍🦱', label: 'Clientes' },
  { href: '/commandes', icon: '📋', label: 'Commandes' },
  { href: '/stock', icon: '🧵', label: 'Stock' },
  { href: '/catalogue', icon: '👗', label: 'Catalogue' },
  { href: '/paiements', icon: '💰', label: 'Paiements' },
  { href: '/factures', icon: '🧾', label: 'Factures' },
  { href: '/profil', icon: '⚙️', label: 'Mon profil' },
]

const bottomNavItems = [
  { href: '/dashboard', icon: '🏠', label: 'Accueil' },
  { href: '/clientes', icon: '👩', label: 'Clientes' },
  { href: '/commandes', icon: '📋', label: 'Commandes' },
  { href: '/factures', icon: '🧾', label: 'Factures' },
]

// Le reste des sections (Stock, Catalogue, Paiements, Profil...) est accessible
// via le bouton "Plus" sur mobile, pour ne pas surcharger la barre du bas.
const plusNavItems = navItems.filter(
  (item) => !bottomNavItems.some((b) => b.href === item.href)
)


interface AppLayoutProps {
  children: ReactNode
  titre: string
  sousTitre?: string
  actionLabel?: string
  onAction?: () => void
  showSidebar?: boolean   // ✅ nouvelle prop
}

export default function AppLayout({
  children,
  titre,
  sousTitre,
  actionLabel,
  onAction,
  showSidebar = true,     // ✅ par défaut sidebar activée
}: AppLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [menuPlusOuvert, setMenuPlusOuvert] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const nomAffiche = user?.nomAtelier || user?.nom || 'Mon Atelier'
  const initiale = nomAffiche.trim().charAt(0).toUpperCase() || 'M'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ Sidebar affichée seulement si showSidebar = true */}
      {showSidebar && (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-10">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <img src="/eureka-logo.png" alt="Eureka" className="w-11 h-11 rounded-2xl object-contain" />
            <div>
              <p className="font-bold text-gray-900">Eureka</p>
              <p className="text-xs text-gray-400">Gestion atelier</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active ? 'bg-gold-50 text-gold-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-500" />}
                </Link>
              )
            })}
          </nav>

          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-sm">{initiale}</div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{nomAffiche}</p>
                <p className="text-xs text-gray-400">Couturière</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full text-sm text-gray-600 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              🚪 Se déconnecter
            </button>
          </div>
        </aside>
      )}

      <div className={`flex-1 min-w-0 ${showSidebar ? 'md:ml-64' : ''}`}>
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 break-words">{titre}</h1>
            {sousTitre ? <p className="text-sm text-gray-400 mt-1 break-words">{sousTitre}</p> : null}
          </div>
          {actionLabel && onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-gold-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gold-600 transition-colors shrink-0"
            >
              <span className="text-lg leading-none">+</span>
              {actionLabel}
            </button>
          ) : null}
        </div>

        <main className="flex-1 min-w-0 min-h-[calc(100vh-80px)] px-4 md:px-8 py-6 pb-24 md:pb-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* ✅ Menu "Plus" mobile : accès à Stock, Catalogue, Paiements, Profil... */}
      {menuPlusOuvert && (
        <div
          onClick={() => setMenuPlusOuvert(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-[60] flex items-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl p-4 pb-8"
            style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
          >
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {plusNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMenuPlusOuvert(false)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gray-50 text-gray-700 text-xs font-medium"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <button
              onClick={() => { setMenuPlusOuvert(false); handleLogout() }}
              className="mt-4 w-full text-sm text-gray-600 border border-gray-200 rounded-xl px-3 py-2.5"
            >
              🚪 Se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* ✅ Bottom nav reste pour mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >

        {bottomNavItems.map((item) => {
          const active = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-medium ${
                active ? 'text-gold-500' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>

              <span className="text-[10px]">{item.label}</span>
            </Link>

          )
        })}
        <button
          onClick={() => setMenuPlusOuvert(true)}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-medium ${
            plusNavItems.some((i) => i.href === location.pathname) ? 'text-gold-500' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">☰</span>
          <span className="text-[10px]">Plus</span>
        </button>
      </nav>
    </div>
  )
}
