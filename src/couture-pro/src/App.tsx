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
import ClienteDetail from './pages/clientes/ClienteDetail'
import AjouterCliente from './pages/clientes/AjouterCliente'
import Mesures from './pages/mesures/Mesures'
import Commandes from './pages/commandes/Commandes'
import AjouterCommande from './pages/commandes/AjouterCommande'
import Paiements from './pages/paiements/Paiements'
import Factures from './pages/factures/Factures'
import CommandeDetail from './pages/commandes/CommandeDetail'
import FactureDetail from './pages/factures/FactureDetail'
import Profil from './pages/profil/Profil'
import Stock from './pages/stock/Stock'
import Catalogue from './pages/catalogue/Catalogue'


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
