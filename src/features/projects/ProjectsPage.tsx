import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { usePageBackground } from '../../utils/usePageBackground'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { formatHours } from '../../utils/format'
import { formatMonth } from '../../utils/months'
import type { Project } from '../../types'
import { ProjectForm } from './ProjectForm'
import { getProjectType, isProjectIncludedInResourceCalculations } from '../../domain/projects/projectPlanning'
import { formatAuditUser } from '../../utils/auth'
import { v4 as uuidv4 } from 'uuid'

const statusVariant: Record<string, 'emerald' | 'blue' | 'amber' | 'default' | 'red'> = {
  active: 'emerald', planned: 'blue', opportunity: 'amber', 'on-hold': 'default', complete: 'default', cancelled: 'red',
}

export function ProjectsPage() {
  const navigate = useNavigate()
  usePageBackground('4.png')
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

  function toggleProjectCalculations(project: Project) {
    updateProject({
      ...project,
      projectType: 'opportunity',
      includeInResourceCalculations: !isProjectIncludedInResourceCalculations(project),
    })
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

      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div style={{ fontSize: 36, opacity: 0.2 }}>◈</div>
          <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>No projects yet — add your first project above</div>
        </div>
      )}
      {projects.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-s)' }}>
                {['Code', 'Project', 'Type', 'Brand', 'Status', 'Period', 'Hours', ''].map((h, i) => (
                  <th
                    key={h + i}
                    className={`pb-2.5 text-[11px] uppercase tracking-wider font-semibold ${i <= 1 ? 'text-left' : i < 7 ? 'text-right' : ''}`}
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
                const projectType = getProjectType(p)
                const isIncluded = isProjectIncludedInResourceCalculations(p)
                const latestAllocation = allocations
                  .filter((a) => a.projectId === p.id && a.lastModifiedAt)
                  .sort((a, b) => (b.lastModifiedAt ?? '').localeCompare(a.lastModifiedAt ?? ''))[0]
                const lastSaved = latestAllocation?.lastModifiedAt
                const lastSavedBy = formatAuditUser(latestAllocation?.lastModifiedBy)
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
                    <td className="py-2.5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{p.code}</td>
                    <td className="py-2.5 font-medium" style={{ color: 'var(--text)' }}>
                      {p.name}
                      {(p.client || pm) && (
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {[p.client, pm && `PM: ${pm.displayName}`].filter(Boolean).join(' · ')}
                        </div>
                      )}
                      {lastSaved && (
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                          Allocation saved by {lastSavedBy} · {new Date(lastSaved).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {p.lastModifiedAt && (
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                          Project edited by {formatAuditUser(p.lastModifiedBy)} · {new Date(p.lastModifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Badge variant={projectType === 'opportunity' ? 'amber' : 'emerald'}>
                          {projectType === 'opportunity' ? 'Opportunity' : 'Live'}
                        </Badge>
                        {projectType === 'opportunity' && (
                          <button
                            type="button"
                            onClick={() => toggleProjectCalculations(p)}
                            className="rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all"
                            style={{
                              color: isIncluded ? '#059669' : 'var(--text-muted)',
                              background: isIncluded ? 'rgba(5,150,105,0.12)' : 'var(--surface-2)',
                              border: `1px solid ${isIncluded ? 'rgba(5,150,105,0.3)' : 'var(--border-s)'}`,
                            }}
                            title={isIncluded ? 'Included in manpower calculations' : 'Excluded from manpower calculations'}
                          >
                            {isIncluded ? 'Included' : 'Excluded'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge variant={p.frontendBrand === 'DCT' ? 'violet' : 'blue'}>{p.frontendBrand}</Badge>
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge variant={statusVariant[p.status] ?? 'default'}>{p.status}</Badge>
                    </td>
                    <td className="py-2.5 text-right text-xs whitespace-nowrap tabular" style={{ color: 'var(--text-muted)' }}>
                      {formatMonth(p.startMonth)} – {formatMonth(p.endMonth)}
                    </td>
                    <td className="py-2.5 text-right font-semibold tabular" style={{ color: projectType === 'opportunity' && !isIncluded ? 'var(--text-faint)' : 'var(--text)' }}>
                      {totalHours > 0 ? formatHours(totalHours) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                    </td>
                    <td className="py-2.5 text-right" style={{ minWidth: 160 }}>
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
        </div>
      )}
    </PageLayout>
  )
}
