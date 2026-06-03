import { useState } from 'react'
import { motion } from 'motion/react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { formatHours } from '../../utils/format'
import { formatMonth } from '../../utils/months'
import type { Project } from '../../types'
import { ProjectForm } from './ProjectForm'
import { v4 as uuidv4 } from 'uuid'

const statusVariant: Record<string, 'emerald' | 'blue' | 'amber' | 'default' | 'red'> = {
  active: 'emerald', planned: 'blue', opportunity: 'amber', 'on-hold': 'default', complete: 'default', cancelled: 'red',
}
const priorityVariant: Record<string, 'red' | 'amber' | 'default'> = {
  critical: 'red', high: 'amber', medium: 'default', low: 'default',
}

export function ProjectsPage() {
  const { projects, allocations, resources, addProject, updateProject, deleteProject } = usePlannerStore()
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)

  function handleSave(data: Omit<Project, 'id'>) {
    if (editingProject) updateProject({ ...data, id: editingProject.id })
    else addProject({ ...data, id: uuidv4() })
    setShowForm(false)
    setEditingProject(null)
  }

  return (
    <PageLayout
      title="Projects"
      subtitle={`${projects.filter((p) => p.status === 'active').length} active`}
      actions={
        <Button variant="primary" onClick={() => { setEditingProject(null); setShowForm(true) }}>
          + Add project
        </Button>
      }
    >
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
            style={{ background: '#0e0e1a', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-base font-semibold text-slate-200 mb-5">
              {editingProject ? 'Edit Project' : 'Add Project'}
            </h2>
            <ProjectForm
              initial={editingProject ?? undefined}
              resources={resources}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingProject(null) }}
            />
          </motion.div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Code', 'Name', 'Brand', 'Status', 'Priority', 'Period', 'Hours', ''].map((h, i) => (
              <th key={h + i} className={`pb-3 text-[10px] uppercase tracking-widest font-semibold text-slate-600 ${i <= 1 ? 'text-left' : i < 7 ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => {
            const totalHours = allocations.filter((a) => a.projectId === p.id).reduce((s, a) => s + a.hours, 0)
            const pm = resources.find((r) => r.id === p.projectManager)
            return (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                className="group"
              >
                <td className="py-3 font-mono text-xs text-slate-600">{p.code}</td>
                <td className="py-3 text-slate-300 font-medium">
                  {p.name}
                  {p.client && <div className="text-[11px] text-slate-700">{p.client}{pm ? ` · ${pm.displayName}` : ''}</div>}
                </td>
                <td className="py-3 text-right">
                  <Badge variant={p.frontendBrand === 'DCT' ? 'violet' : 'blue'}>{p.frontendBrand}</Badge>
                </td>
                <td className="py-3 text-right"><Badge variant={statusVariant[p.status] ?? 'default'}>{p.status}</Badge></td>
                <td className="py-3 text-right"><Badge variant={priorityVariant[p.priority] ?? 'default'}>{p.priority}</Badge></td>
                <td className="py-3 text-right text-xs text-slate-600 whitespace-nowrap tabular">
                  {formatMonth(p.startMonth)} – {formatMonth(p.endMonth)}
                </td>
                <td className="py-3 text-right font-semibold tabular text-slate-300">
                  {totalHours > 0 ? formatHours(totalHours) : <span className="text-slate-700">—</span>}
                </td>
                <td className="py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingProject(p); setShowForm(true) }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete project?')) deleteProject(p.id) }}>Del</Button>
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
