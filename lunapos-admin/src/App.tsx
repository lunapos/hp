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
import RegisterPage from './pages/RegisterPage'
import SignupPage from './pages/SignupPage'
import CastSalesPage from './pages/CastSalesPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center">
        <div className="text-[#9090bb] text-sm tracking-widest">読み込み中...</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
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
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
      <Route path="/casts" element={<ProtectedRoute><CastsPage /></ProtectedRoute>} />
      <Route path="/tables" element={<ProtectedRoute><TablesPage /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
      <Route path="/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/cast-sales" element={<ProtectedRoute><CastSalesPage /></ProtectedRoute>} />
      {/* 後方互換: /admin/* → / にリダイレクト */}
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/admin/signup" element={<Navigate to="/signup" replace />} />
      <Route path="/admin/*" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
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
