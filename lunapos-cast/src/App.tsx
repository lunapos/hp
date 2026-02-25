import { AppProvider } from './contexts/AppContext'
import CastApp from './pages/CastApp'

export default function App() {
  return (
    <AppProvider>
      <CastApp />
    </AppProvider>
  )
}
