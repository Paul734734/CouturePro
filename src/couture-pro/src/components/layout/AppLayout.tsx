import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'


const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Tableau de bord' },
  { href: '/clientes', icon: '👩‍🦱', label: 'Clientes' },
  { href: '/mesures', icon: '📐', label: 'Mesures' },
  { href: '/commandes', icon: '📋', label: 'Commandes' },
  { href: '/paiements', icon: '💰', label: 'Paiements' },
  { href: '/factures', icon: '🧾', label: 'Factures' },
  { href: '/profil', icon: '⚙️', label: 'Mon profil' },
]

const bottomNavItems = [
  { href: '/dashboard', icon: '🏠', label: 'Accueil' },
  { href: '/clientes', icon: '👩', label: 'Clientes' },
  { href: '/commandes', icon: '📋', label: 'Commandes' },
  { href: '/paiements', icon: '💰', label: 'Paiements' },
  { href: '/factures', icon: '🧾', label: 'Factures' },
]


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
                    active ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </Link>
              )
            })}
          </nav>

          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">{initiale}</div>
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

      <div className={`flex-1 ${showSidebar ? 'md:ml-64' : ''}`}>
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{titre}</h1>
            {sousTitre ? <p className="text-sm text-gray-400 mt-1">{sousTitre}</p> : null}
          </div>
          {actionLabel && onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              {actionLabel}
            </button>
          ) : null}
        </div>

        <main className="flex-1 min-h-[calc(100vh-80px)] px-4 md:px-8 py-6">
          {children}
        </main>
      </div>

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
                active ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>

              <span className="text-[10px]">{item.label}</span>
            </Link>

          )
        })}
      </nav>
    </div>
  )
}
