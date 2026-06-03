import { useState } from 'react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { calculateMonthlyProductiveCapacity } from '../../domain/capacity/capacityCalculations'
import { formatHours } from '../../utils/format'
import { ROLE_LABELS } from '../../types'
import type { Resource } from '../../types'
import { ResourceForm } from './ResourceForm'
import { v4 as uuidv4 } from 'uuid'

export function ResourcesPage() {
  const { resources, scenarios, activeScenarioId, addResource, updateResource, deleteResource } = usePlannerStore()
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [showForm, setShowForm] = useState(false)

  const scenario = scenarios.find((s) => s.id === activeScenarioId)
  const assumptions = scenario?.assumptions

  function handleSave(data: Omit<Resource, 'id'>) {
    if (editingResource) {
      updateResource({ ...data, id: editingResource.id })
    } else {
      addResource({ ...data, id: uuidv4() })
    }
    setShowForm(false)
    setEditingResource(null)
  }

  function handleEdit(r: Resource) {
    setEditingResource(r)
    setShowForm(true)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this resource?')) deleteResource(id)
  }

  const employmentBadge: Record<string, 'blue' | 'orange' | 'purple' | 'gray'> = {
    employee: 'blue',
    contractor: 'orange',
    freelancer: 'purple',
    placeholder: 'gray',
  }

  return (
    <PageLayout
      title="Resources"
      actions={
        <Button variant="primary" onClick={() => { setEditingResource(null); setShowForm(true) }}>
          + Add Resource
        </Button>
      }
    >
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{editingResource ? 'Edit Resource' : 'Add Resource'}</h2>
            <ResourceForm
              initial={editingResource ?? undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingResource(null) }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Hours/Wk</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Days/Wk</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Monthly Cap.</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => {
              const capacity = assumptions ? calculateMonthlyProductiveCapacity(r, assumptions) : null
              return (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.displayName}
                    {r.notes && <span className="ml-1 text-xs text-gray-400">({r.notes})</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div>{ROLE_LABELS[r.role]}</div>
                    {r.secondaryRoles && r.secondaryRoles.length > 0 && (
                      <div className="text-xs text-gray-400">{r.secondaryRoles.map((sr) => ROLE_LABELS[sr]).join(', ')}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={employmentBadge[r.employmentType] ?? 'gray'}>
                      {r.employmentType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{r.contractHoursPerWeek}h</td>
                  <td className="px-4 py-3 text-right text-gray-700">{r.workingDaysPerWeek}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {capacity !== null ? formatHours(capacity) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${r.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" onClick={() => handleEdit(r)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Del</Button>
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
