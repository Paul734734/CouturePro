import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Landing : chargée immédiatement (première page vue, doit s'afficher vite)
import LandingPage from './pages/LandingPage'

// Tout le reste est chargé à la demande (code-splitting) pour garder le
// bundle initial léger : chaque page ne se télécharge que quand on y navigue.
const Login = lazy(() => import('./pages/auth/Login'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const Register = lazy(() => import('./pages/auth/Register'))

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const Clientes = lazy(() => import('./pages/clientes/Clientes'))
const ClienteDetail = lazy(() => import('./pages/clientes/ClienteDetail'))
const AjouterCliente = lazy(() => import('./pages/clientes/AjouterCliente'))
const Mesures = lazy(() => import('./pages/mesures/Mesures'))
const Commandes = lazy(() => import('./pages/commandes/Commandes'))
const AjouterCommande = lazy(() => import('./pages/commandes/AjouterCommande'))
const Paiements = lazy(() => import('./pages/paiements/Paiements'))
const Factures = lazy(() => import('./pages/factures/Factures'))
const CommandeDetail = lazy(() => import('./pages/commandes/CommandeDetail'))
const FactureDetail = lazy(() => import('./pages/factures/FactureDetail'))
const Profil = lazy(() => import('./pages/profil/Profil'))
const Stock = lazy(() => import('./pages/stock/Stock'))
const Catalogue = lazy(() => import('./pages/catalogue/Catalogue'))
const Ateliers = lazy(() => import('./pages/ateliers/Ateliers'))

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUtilisatrices = lazy(() => import('./pages/admin/AdminUtilisatrices'))
const AdminAbonnements = lazy(() => import('./pages/admin/AdminAbonnements'))

function ChargementPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A227', fontWeight: 600 }}>
      Chargement...
    </div>
  )
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Suspense fallback={<ChargementPage />}>
        <Routes>

          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* App (Couturière) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<ClienteDetail />} />
          <Route path="/clientes/:id/modifier" element={<AjouterCliente />} />
          <Route path="/mesures" element={<Mesures />} />
          <Route path="/mesures/:clienteId" element={<Mesures />} />
          <Route path="/commandes" element={<Commandes />} />
          <Route path="/commandes/ajouter" element={<AjouterCommande />} />
          <Route path="/commandes/:id" element={<CommandeDetail />} />
          <Route path="/commandes/:id/modifier" element={<AjouterCommande />} />
          <Route path="/paiements" element={<Paiements />} />
          <Route path="/factures" element={<Factures />} />
          <Route path="/factures/:id" element={<FactureDetail />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/ateliers" element={<Ateliers />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/utilisatrices" element={<AdminUtilisatrices />} />
          <Route path="/admin/abonnements" element={<AdminAbonnements />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
