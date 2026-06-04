import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export function ProjectsPage() {
  const navigate = useNavigate()
  const { projects, allocations, resources, addProject, updateProject, deleteProject } = usePlannerStore()
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

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
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-s)' }}
          >
            <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text)' }}>
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
          <tr style={{ borderBottom: '1px solid var(--border-s)' }}>
            {['Code', 'Project', 'Brand', 'Status', 'Period', 'Hours', ''].map((h, i) => (
              <th
                key={h + i}
                className={`pb-2.5 text-[11px] uppercase tracking-wider font-semibold ${i <= 1 ? 'text-left' : i < 6 ? 'text-right' : ''}`}
                style={{ color: 'var(--text-faint)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => {
            const totalHours = allocations.filter((a) => a.projectId === p.id).reduce((s, a) => s + a.hours, 0)
            const pm = resources.find((r) => r.id === p.projectManager)
            const lastSaved = allocations
              .filter((a) => a.projectId === p.id && a.lastModifiedAt)
              .sort((a, b) => (b.lastModifiedAt ?? '').localeCompare(a.lastModifiedAt ?? ''))[0]?.lastModifiedAt
            const isHovered = hoveredId === p.id

            return (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  borderBottom: '1px solid var(--row-divider)',
                  background: isHovered ? 'var(--row-hover)' : 'transparent',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <td className="py-2.5font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{p.code}</td>
                <td className="py-2.5font-medium" style={{ color: 'var(--text)' }}>
                  {p.name}
                  {(p.client || pm) && (
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {[p.client, pm && `PM: ${pm.displayName}`].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  {lastSaved && (
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      Saved {new Date(lastSaved).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </td>
                <td className="py-2.5text-right">
                  <Badge variant={p.frontendBrand === 'DCT' ? 'violet' : 'blue'}>{p.frontendBrand}</Badge>
                </td>
                <td className="py-2.5text-right">
                  <Badge variant={statusVariant[p.status] ?? 'default'}>{p.status}</Badge>
                </td>
                <td className="py-2.5text-right text-xs whitespace-nowrap tabular" style={{ color: 'var(--text-muted)' }}>
                  {formatMonth(p.startMonth)} – {formatMonth(p.endMonth)}
                </td>
                <td className="py-2.5text-right font-semibold tabular" style={{ color: 'var(--text)' }}>
                  {totalHours > 0 ? formatHours(totalHours) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                </td>
                <td className="py-2.5text-right" style={{ minWidth: 160 }}>
                  <div
                    className="flex gap-1.5 justify-end transition-opacity duration-150"
                    style={{ opacity: isHovered ? 1 : 0 }}
                  >
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/projects/${p.id}/allocations`)}
                    >
                      Allocate →
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingProject(p); setShowForm(true) }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete project?')) deleteProject(p.id) }}>
                      Del
                    </Button>
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
