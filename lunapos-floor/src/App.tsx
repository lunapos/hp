import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import FloorPage from './pages/FloorPage'
import TablePage from './pages/TablePage'
import CheckoutPage from './pages/CheckoutPage'
import CastPage from './pages/CastPage'
import AdminPage from './pages/AdminPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/floor" replace />} />
      <Route path="/floor" element={<FloorPage />} />
      <Route path="/table/:tableId" element={<TablePage />} />
      <Route path="/checkout/:tableId" element={<CheckoutPage />} />
      <Route path="/cast" element={<CastPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/floor" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
