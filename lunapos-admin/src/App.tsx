import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MenuPage from './pages/MenuPage'
import CastsPage from './pages/CastsPage'
import TablesPage from './pages/TablesPage'
import PlansPage from './pages/PlansPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center">
        <div className="text-[#9090bb] text-sm tracking-widest">読み込み中...</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/admin/login" replace />
  return <Layout>{children}</Layout>
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center">
        <div className="text-[#9090bb] text-sm tracking-widest">読み込み中...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/admin/login" element={user ? <Navigate to="/admin" replace /> : <LoginPage />} />
      <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
      <Route path="/admin/casts" element={<ProtectedRoute><CastsPage /></ProtectedRoute>} />
      <Route path="/admin/tables" element={<ProtectedRoute><TablesPage /></ProtectedRoute>} />
      <Route path="/admin/plans" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
