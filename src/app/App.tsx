import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { TopBar } from '../components/layout/TopBar'
import { AppRoutes } from './routes'
import { usePlannerStore } from '../store/plannerStore'
import { ThemeProvider } from '../utils/ThemeContext'

function Inner() {
  const { loadAll, isLoading, error } = usePlannerStore()
  useEffect(() => { loadAll() }, [loadAll])

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
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <div style={{ flex: 1, overflow: 'auto' }}>
          <AppRoutes />
        </div>
      </div>
    </BrowserRouter>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <Inner />
    </ThemeProvider>
  )
}
