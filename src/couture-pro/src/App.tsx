import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auth
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import Register from './pages/auth/Register'

// Landing
import LandingPage from './pages/LandingPage'

// App
import Dashboard from './pages/dashboard/Dashboard'
import Clientes from './pages/clientes/Clientes'
import Mesures from './pages/mesures/Mesures'
import Commandes from './pages/commandes/Commandes'
import Paiements from './pages/paiements/Paiements'
import Factures from './pages/factures/Factures'
import CommandeDetail from './pages/commandes/CommandeDetail'
import FactureDetail from './pages/factures/FactureDetail'
import Profil from './pages/profil/Profil'


// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUtilisatrices from './pages/admin/AdminUtilisatrices'
import AdminAbonnements from './pages/admin/AdminAbonnements'

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>

        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* App (Couturière) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/mesures" element={<Mesures />} />
        <Route path="/commandes" element={<Commandes />} />
        <Route path="/commandes/:id" element={<CommandeDetail />} />
        <Route path="/paiements" element={<Paiements />} />
        <Route path="/factures" element={<Factures />} />
        <Route path="/factures/:id" element={<FactureDetail />} />
        <Route path="/profil" element={<Profil />} />


        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/utilisatrices" element={<AdminUtilisatrices />} />
        <Route path="/admin/abonnements" element={<AdminAbonnements />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
