import type { ReactNode } from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useAteliersStore } from '../../store/ateliersStore'
import { getAtelierActif, setAtelierActif, subscribeAtelierActif } from '../../lib/atelierActif'


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
  const acceduMultiAtelier = useAuthStore((s) => s.acces.multiAtelier)
  const { ateliers, fetchAteliers } = useAteliersStore()
  const [menuPlusOuvert, setMenuPlusOuvert] = useState(false)
  const bottomNavRef = useRef<HTMLElement>(null)

  const atelierActifId = useSyncExternalStore(subscribeAtelierActif, getAtelierActif, () => null)

  // Mesure la hauteur RÉELLE de la bottom nav (plutôt que de l'estimer en
  // CSS) : le rendu des emojis dans les icônes varie fortement d'un
  // téléphone/OS à l'autre et peut être bien plus haut que prévu. On pousse
  // la valeur mesurée dans --bottom-nav-height, utilisée partout ailleurs
  // pour réserver l'espace nécessaire au-dessus de la nav.
  useLayoutEffect(() => {
    const nav = bottomNavRef.current
    if (!nav) return
    const mesurer = () => {
      document.documentElement.style.setProperty('--bottom-nav-height', `${nav.offsetHeight}px`)
    }
    mesurer()
    const observer = new ResizeObserver(mesurer)
    observer.observe(nav)
    window.addEventListener('orientationchange', mesurer)
    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', mesurer)
    }
  }, [])

  useEffect(() => {
    if (acceduMultiAtelier) fetchAteliers()
  }, [acceduMultiAtelier, fetchAteliers])

  // Si l'atelier actif a été supprimé entre-temps (ou vient d'un ancien
  // compte), on retombe proprement sur l'espace principal plutôt que de
  // continuer à filtrer sur un atelier qui n'existe plus.
  useEffect(() => {
    if (atelierActifId && ateliers.length > 0 && !ateliers.some((a) => a.id === atelierActifId)) {
      setAtelierActif(null)
    }
  }, [atelierActifId, ateliers])

  const handleChangerAtelier = (id: string | null) => {
    if (id === atelierActifId) return
    setAtelierActif(id)
    // Recharge complète volontaire : garantit que toutes les données
    // affichées (dashboard, listes, compteurs...) reflètent bien le nouvel
    // espace, sans avoir à traquer un rafraîchissement manuel dans chaque
    // store/page qui consomme des clientes/commandes/stock/catalogue.
    window.location.reload()
  }

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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
            {acceduMultiAtelier && ateliers.length > 0 ? (
              <select
                value={atelierActifId ?? ''}
                onChange={(e) => handleChangerAtelier(e.target.value || null)}
                className="cp-btn-mobile-full text-sm font-medium text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 bg-white min-w-0"
                aria-label="Espace atelier actif"
              >
                <option value="">🏠 Espace principal</option>
                {ateliers.map((a) => (
                  <option key={a.id} value={a.id}>
                    🧵 {a.nom}
                  </option>
                ))}
              </select>
            ) : null}
            {actionLabel && onAction ? (
              <button
                onClick={onAction}
                className="cp-btn-mobile-full inline-flex items-center justify-center gap-2 bg-gold-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gold-600 transition-colors shrink-0"
              >
                <span className="text-lg leading-none">+</span>
                {actionLabel}
              </button>
            ) : null}
          </div>
        </div>

        <main className="scrollable-content flex-1 min-w-0 min-h-[calc(100vh-80px)] px-4 md:px-8 py-6 overflow-x-hidden">
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
        ref={bottomNavRef}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around z-50"
        style={{ padding: '2px 0', paddingBottom: 'calc(2px + env(safe-area-inset-bottom))' }}
      >

        {bottomNavItems.map((item) => {
          const active = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl font-medium ${
                active ? 'text-gold-500' : 'text-gray-500'
              }`}
            >
              <span className="text-[16px] leading-none">{item.icon}</span>

              <span className="text-[10px] leading-[1.2]">{item.label}</span>
            </Link>

          )
        })}
        <button
          onClick={() => setMenuPlusOuvert(true)}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl font-medium ${
            plusNavItems.some((i) => i.href === location.pathname) ? 'text-gold-500' : 'text-gray-500'
          }`}
        >
          <span className="text-[16px] leading-none">☰</span>
          <span className="text-[10px] leading-[1.2]">Plus</span>
        </button>
      </nav>
    </div>
  )
}
