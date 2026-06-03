import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { AppRoutes } from './routes'
import { usePlannerStore } from '../store/plannerStore'

export function App() {
  const { loadAll, isLoading, error } = usePlannerStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <AppRoutes />
        </div>
      </div>
    </BrowserRouter>
  )
}
