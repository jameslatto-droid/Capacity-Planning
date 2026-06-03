import { useState } from 'react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { formatHours } from '../../utils/format'
import { formatMonth } from '../../utils/months'
import type { Project } from '../../types'
import { ProjectForm } from './ProjectForm'
import { v4 as uuidv4 } from 'uuid'

const statusBadge: Record<string, 'green' | 'blue' | 'yellow' | 'gray' | 'red' | 'orange'> = {
  active: 'green',
  planned: 'blue',
  opportunity: 'yellow',
  'on-hold': 'orange',
  complete: 'gray',
  cancelled: 'red',
}

const priorityBadge: Record<string, 'red' | 'orange' | 'yellow' | 'gray'> = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'gray',
}

export function ProjectsPage() {
  const { projects, allocations, resources, addProject, updateProject, deleteProject } = usePlannerStore()
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)

  function handleSave(data: Omit<Project, 'id'>) {
    if (editingProject) {
      updateProject({ ...data, id: editingProject.id })
    } else {
      addProject({ ...data, id: uuidv4() })
    }
    setShowForm(false)
    setEditingProject(null)
  }

  return (
    <PageLayout
      title="Projects"
      actions={
        <Button variant="primary" onClick={() => { setEditingProject(null); setShowForm(true) }}>
          + Add Project
        </Button>
      }
    >
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-screen">
            <h2 className="text-lg font-semibold mb-4">{editingProject ? 'Edit Project' : 'Add Project'}</h2>
            <ProjectForm
              initial={editingProject ?? undefined}
              resources={resources}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingProject(null) }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Period</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Planned Hours</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const totalHours = allocations
                .filter((a) => a.projectId === p.id)
                .reduce((s, a) => s + a.hours, 0)
              const pm = resources.find((r) => r.id === p.projectManager)
              return (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.name}
                    {p.client && <div className="text-xs text-gray-400">{p.client}</div>}
                    {pm && <div className="text-xs text-gray-400">PM: {pm.displayName}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.frontendBrand === 'DCT' ? 'blue' : 'purple'}>{p.frontendBrand}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadge[p.status] ?? 'gray'}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityBadge[p.priority] ?? 'gray'}>{p.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {formatMonth(p.startMonth)} – {formatMonth(p.endMonth)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {totalHours > 0 ? formatHours(totalHours) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" onClick={() => { setEditingProject(p); setShowForm(true) }}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete project?')) deleteProject(p.id) }}>Del</Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </PageLayout>
  )
}
