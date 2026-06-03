import { useState } from 'react'
import { motion } from 'motion/react'
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

const employmentBadge: Record<string, 'violet' | 'amber' | 'blue' | 'default'> = {
  employee: 'blue',
  contractor: 'amber',
  freelancer: 'violet',
  placeholder: 'default',
}

export function ResourcesPage() {
  const { resources, scenarios, activeScenarioId, addResource, updateResource, deleteResource } = usePlannerStore()
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [showForm, setShowForm] = useState(false)

  const scenario = scenarios.find((s) => s.id === activeScenarioId)
  const assumptions = scenario?.assumptions

  function handleSave(data: Omit<Resource, 'id'>) {
    if (editingResource) updateResource({ ...data, id: editingResource.id })
    else addResource({ ...data, id: uuidv4() })
    setShowForm(false)
    setEditingResource(null)
  }

  return (
    <PageLayout
      title="Resources"
      subtitle={`${resources.filter((r) => r.active).length} active`}
      actions={
        <Button variant="primary" onClick={() => { setEditingResource(null); setShowForm(true) }}>
          + Add resource
        </Button>
      }
    >
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg rounded-2xl p-6"
            style={{ background: '#0e0e1a', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-base font-semibold text-slate-200 mb-5">
              {editingResource ? 'Edit Resource' : 'Add Resource'}
            </h2>
            <ResourceForm
              initial={editingResource ?? undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingResource(null) }}
            />
          </motion.div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Name', 'Role', 'Type', 'h/wk', 'Days', 'Monthly cap.', 'Active', ''].map((h, i) => (
              <th
                key={h + i}
                className={`pb-3 text-[10px] uppercase tracking-widest font-semibold text-slate-600 ${i === 0 ? 'text-left' : i < 7 ? 'text-right' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((r, i) => {
            const capacity = assumptions ? calculateMonthlyProductiveCapacity(r, assumptions) : null
            return (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                className="group"
              >
                <td className="py-3 text-slate-300 font-medium">
                  {r.displayName}
                  {r.notes && <span className="ml-2 text-[11px] text-slate-700">{r.notes}</span>}
                  {r.secondaryRoles && r.secondaryRoles.length > 0 && (
                    <div className="text-[11px] text-slate-700 mt-0.5">
                      +{r.secondaryRoles.map((sr) => ROLE_LABELS[sr]).join(', ')}
                    </div>
                  )}
                </td>
                <td className="py-3 text-right text-slate-500">{ROLE_LABELS[r.role]}</td>
                <td className="py-3 text-right">
                  <Badge variant={employmentBadge[r.employmentType] ?? 'default'}>{r.employmentType}</Badge>
                </td>
                <td className="py-3 text-right text-slate-500 tabular">{r.contractHoursPerWeek}</td>
                <td className="py-3 text-right text-slate-500 tabular">{r.workingDaysPerWeek}</td>
                <td className="py-3 text-right font-semibold text-slate-300 tabular">
                  {capacity !== null ? formatHours(capacity) : '—'}
                </td>
                <td className="py-3 text-right">
                  <span className={`inline-block w-2 h-2 rounded-full ${r.active ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    style={r.active ? { boxShadow: '0 0 6px rgba(16,185,129,0.6)' } : {}} />
                </td>
                <td className="py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingResource(r); setShowForm(true) }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete?')) deleteResource(r.id) }}>Del</Button>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </PageLayout>
  )
}
