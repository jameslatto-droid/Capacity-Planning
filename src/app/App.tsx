import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
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
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
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
