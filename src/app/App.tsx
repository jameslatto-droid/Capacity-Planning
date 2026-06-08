import { useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { TopBar } from '../components/layout/TopBar'
import { AppRoutes } from './routes'
import { usePlannerStore } from '../store/plannerStore'
import { ThemeProvider, useTheme } from '../utils/ThemeContext'
import { AuthProvider, useAuth } from '../utils/AuthContext'
import { BackgroundProvider, useBackground } from '../utils/BackgroundContext'
import { LoginPage } from '../features/auth/LoginPage'

const BASE = import.meta.env.BASE_URL as string

function AppBg() {
  const { bgImage } = useBackground()
  const { isDark } = useTheme()
  if (!isDark) return null
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        background: [
          'radial-gradient(circle at 28% 28%, rgba(255,175,77,0.14), transparent 36%)',
          'radial-gradient(circle at 74% 62%, rgba(255,128,36,0.09), transparent 34%)',
          'linear-gradient(120deg, rgba(4,5,8,0.94) 0%, rgba(10,10,12,0.83) 48%, rgba(30,16,4,0.76) 100%)',
          `url("${BASE}assets/${bgImage}") center / cover no-repeat`,
          '#07080b',
        ].join(', '),
      }}
    />
  )
}

function Inner() {
  const { currentUser } = useAuth()
  const { loadAll, isLoading, error } = usePlannerStore()
  useEffect(() => {
    if (currentUser) loadAll()
  }, [currentUser, loadAll])

  if (!currentUser) return <LoginPage />

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: 'var(--text-muted)' }} className="text-sm">Loading…</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-sm">Error: {error}</div>
      </div>
    )
  }
  return (
    <HashRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <AppRoutes />
        </div>
      </div>
    </HashRouter>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <BackgroundProvider>
        <AuthProvider>
          <AppBg />
          <Inner />
        </AuthProvider>
      </BackgroundProvider>
    </ThemeProvider>
  )
}
