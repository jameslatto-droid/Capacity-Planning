import { Routes, Route } from 'react-router-dom'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { ResourcesPage } from '../features/resources/ResourcesPage'
import { LeavePage } from '../features/leave/LeavePage'
import { ProjectsPage } from '../features/projects/ProjectsPage'
import { ProjectAllocationEditor } from '../features/projects/ProjectAllocationEditor'
import { AllocationsPage } from '../features/allocations/AllocationsPage'
import { ScenariosPage } from '../features/scenarios/ScenariosPage'
import { OptimisationPage } from '../features/optimisation/OptimisationPage'
import { ReportsPage } from '../features/reports/ReportsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/leave" element={<LeavePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectId/allocations" element={<ProjectAllocationEditor />} />
      <Route path="/allocations" element={<AllocationsPage />} />
      <Route path="/scenarios" element={<ScenariosPage />} />
      <Route path="/optimisation" element={<OptimisationPage />} />
      <Route path="/reports" element={<ReportsPage />} />
    </Routes>
  )
}
