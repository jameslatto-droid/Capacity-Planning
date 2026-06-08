import { useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { TopBar } from '../components/layout/TopBar'
import { AppRoutes } from './routes'
import { usePlannerStore } from '../store/plannerStore'
import { ThemeProvider } from '../utils/ThemeContext'
import { AuthProvider, useAuth } from '../utils/AuthContext'
import { LoginPage } from '../features/auth/LoginPage'

function Inner() {
  const { currentUser } = useAuth()
  const { loadAll, isLoading, error } = usePlannerStore()
  useEffect(() => {
    if (currentUser) loadAll()
  }, [currentUser, loadAll])

  if (!currentUser) return <LoginPage />

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-muted)' }} className="text-sm">Loading…</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-red-500 text-sm">Error: {error}</div>
      </div>
    )
  }
  return (
    <HashRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', minHeight: 0 }}>
          <AppRoutes />
        </div>
      </div>
    </HashRouter>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Inner />
      </AuthProvider>
    </ThemeProvider>
  )
}
