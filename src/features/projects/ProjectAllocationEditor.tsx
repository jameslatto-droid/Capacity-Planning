import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { v4 as uuidv4 } from 'uuid'
import { usePlannerStore } from '../../store/plannerStore'
import { calculateMonthlyProductiveCapacity } from '../../domain/capacity/capacityCalculations'
import { generateMonthRange, formatMonth } from '../../utils/months'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import type { Resource, ResourceRole } from '../../types'
import { ROLE_LABELS } from '../../types'

// Cell state: percent (0-100), stored locally until Save
type Matrix = Record<string, Record<string, number>> // resourceId → month → percent

function hoursFromPercent(percent: number, capacity: number) {
  return Math.round((percent / 100) * capacity)
}

function percentFromHours(hours: number, capacity: number) {
  if (capacity === 0) return 0
  return Math.round((hours / capacity) * 100)
}

function cellBg(percent: number): string {
  if (percent === 0) return 'transparent'
  if (percent < 40) return 'rgba(29,78,216,0.15)'
  if (percent < 70) return 'rgba(5,150,105,0.15)'
  if (percent < 90) return 'rgba(217,119,6,0.18)'
  if (percent <= 100) return 'rgba(234,88,12,0.18)'
  return 'rgba(220,38,38,0.22)'
}

function cellTextColor(percent: number): string {
  if (percent === 0) return 'var(--text-faint)'
  if (percent < 70) return 'var(--text-muted)'
  if (percent <= 100) return 'var(--text)'
  return '#f87171'
}

export function ProjectAllocationEditor() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { projects, resources, allocations, scenarios, activeScenarioId, setAllocations } = usePlannerStore()

  const project = projects.find((p) => p.id === projectId)
  const scenario = scenarios.find((s) => s.id === activeScenarioId)
  const assumptions = scenario?.assumptions

  // Month range — all months in project lifespan, capped to reasonable window
  const months = useMemo(() => {
    if (!project) return []
    return generateMonthRange(project.startMonth, project.endMonth).slice(0, 24)
  }, [project])

  // Build initial matrix from existing allocations
  const existingAllocations = useMemo(
    () => allocations.filter((a) => a.projectId === projectId && a.scenarioId === activeScenarioId),
    [allocations, projectId, activeScenarioId]
  )

  // Which resources are on this project
  const [assignedResourceIds, setAssignedResourceIds] = useState<string[]>(() => {
    const ids = [...new Set(existingAllocations.map((a) => a.resourceId).filter(Boolean) as string[])]
    return ids
  })

  // Local edit matrix: resourceId → month → percent (0-100)
  const [matrix, setMatrix] = useState<Matrix>(() => {
    const m: Matrix = {}
    for (const alloc of existingAllocations) {
      if (!alloc.resourceId) continue
      const res = resources.find((r) => r.id === alloc.resourceId)
      if (!res || !assumptions) continue
      const cap = calculateMonthlyProductiveCapacity(res, assumptions)
      if (!m[alloc.resourceId]) m[alloc.resourceId] = {}
      m[alloc.resourceId]![alloc.month] = percentFromHours(alloc.hours, cap)
    }
    return m
  })

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => {
    const latest = existingAllocations
      .filter((a) => a.lastModifiedAt)
      .sort((a, b) => (b.lastModifiedAt ?? '').localeCompare(a.lastModifiedAt ?? ''))
    return latest[0]?.lastModifiedAt ?? null
  })

  const [isDirty, setIsDirty] = useState(false)
  const [addingPerson, setAddingPerson] = useState(false)

  const assignedResources = useMemo(
    () => assignedResourceIds.map((id) => resources.find((r) => r.id === id)).filter(Boolean) as Resource[],
    [assignedResourceIds, resources]
  )

  const availableToAdd = useMemo(
    () => resources.filter((r) => r.active && !assignedResourceIds.includes(r.id)),
    [resources, assignedResourceIds]
  )

  const updateCell = useCallback((resourceId: string, month: string, value: string) => {
    const num = Math.min(200, Math.max(0, Number(value) || 0))
    setMatrix((prev) => ({
      ...prev,
      [resourceId]: { ...(prev[resourceId] ?? {}), [month]: num },
    }))
    setIsDirty(true)
  }, [])

  function addPerson(resourceId: string) {
    if (!assignedResourceIds.includes(resourceId)) {
      setAssignedResourceIds((prev) => [...prev, resourceId])
      setIsDirty(true)
    }
    setAddingPerson(false)
  }

  function removePerson(resourceId: string) {
    if (!confirm(`Remove this person from the project? Their allocations will be deleted on save.`)) return
    setAssignedResourceIds((prev) => prev.filter((id) => id !== resourceId))
    setMatrix((prev) => {
      const next = { ...prev }
      delete next[resourceId]
      return next
    })
    setIsDirty(true)
  }

  function handleSave() {
    if (!assumptions) return
    const now = new Date().toISOString()

    // Build the new set of allocations for this project+scenario
    const otherAllocations = allocations.filter(
      (a) => !(a.projectId === projectId && a.scenarioId === activeScenarioId)
    )

    const newAllocations = assignedResourceIds.flatMap((resourceId) => {
      const res = resources.find((r) => r.id === resourceId)
      if (!res) return []
      const cap = calculateMonthlyProductiveCapacity(res, assumptions)
      return months.flatMap((month) => {
        const percent = matrix[resourceId]?.[month] ?? 0
        if (percent === 0) return []
        const hours = hoursFromPercent(percent, cap)
        // Preserve existing allocation id if it exists
        const existing = existingAllocations.find(
          (a) => a.resourceId === resourceId && a.month === month
        )
        return [{
          id: existing?.id ?? uuidv4(),
          scenarioId: activeScenarioId,
          projectId: projectId!,
          resourceId,
          role: res.role as ResourceRole,
          month,
          hours,
          locked: existing?.locked ?? false,
          notes: existing?.notes,
          lastModifiedAt: now,
        }]
      })
    })

    setAllocations([...otherAllocations, ...newAllocations])
    setLastSavedAt(now)
    setIsDirty(false)
  }

  if (!project) {
    return (
      <div className="p-8" style={{ color: 'var(--text-muted)' }}>Project not found.</div>
    )
  }

  function formatSavedAt(iso: string) {
    const d = new Date(iso)
    return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => navigate('/projects')}
          className="text-xs font-medium mb-4 flex items-center gap-1.5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ← Projects
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--text-faint)' }}>
              {project.code} · {project.frontendBrand}
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              {project.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {scenario?.name} · Set % loading per person per month
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {lastSavedAt && !isDirty && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Saved {formatSavedAt(lastSavedAt)}
              </span>
            )}
            {isDirty && (
              <span className="text-xs text-amber-500">Unsaved changes</span>
            )}
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!isDirty}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto px-8 py-8">
        <table className="text-sm w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th
                className="text-left pb-3 pr-6 font-semibold text-[10px] uppercase tracking-widest sticky left-0 z-10"
                style={{ color: 'var(--text-faint)', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
              >
                Team Member
              </th>
              {months.map((m) => (
                <th
                  key={m}
                  className="text-center pb-3 px-1 font-semibold text-[10px] uppercase tracking-widest whitespace-nowrap"
                  style={{ color: 'var(--text-faint)', borderBottom: '1px solid var(--border)', minWidth: 72 }}
                >
                  {formatMonth(m)}
                </th>
              ))}
              <th style={{ borderBottom: '1px solid var(--border)', width: 32 }} />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {assignedResources.map((r) => {
                const cap = assumptions ? calculateMonthlyProductiveCapacity(r, assumptions) : 133
                const rowMatrix = matrix[r.id] ?? {}

                return (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                  >

                    {/* Name cell — sticky */}
                    <td
                      className="py-2 pr-6 sticky left-0 z-10"
                      style={{ background: 'var(--bg)', borderBottom: '1px solid var(--row-divider)' }}
                    >
                      <div className="font-medium" style={{ color: 'var(--text)' }}>{r.displayName}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {ROLE_LABELS[r.role]} · cap {Math.round(cap)}h
                      </div>
                    </td>

                    {/* Month cells */}
                    {months.map((m) => {
                      const pct = rowMatrix[m] ?? 0
                      const hrs = hoursFromPercent(pct, cap)
                      return (
                        <td
                          key={m}
                          className="px-1 py-2 text-center"
                          style={{ borderBottom: '1px solid var(--row-divider)' }}
                        >
                          <div className="relative mx-auto" style={{ width: 64 }}>
                            <input
                              type="number"
                              min={0}
                              max={200}
                              value={pct === 0 ? '' : pct}
                              placeholder="—"
                              onChange={(e) => updateCell(r.id, m, e.target.value)}
                              className="w-full text-center rounded-lg py-1.5 text-sm font-semibold tabular transition-all"
                              style={{
                                background: cellBg(pct),
                                color: cellTextColor(pct),
                                border: `1px solid ${pct > 0 ? 'transparent' : 'var(--border)'}`,
                                outline: 'none',
                              }}
                              onFocus={(e) => {
                                e.target.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.4)'
                                if (e.target.value === '') e.target.placeholder = ''
                              }}
                              onBlur={(e) => {
                                e.target.style.boxShadow = 'none'
                                e.target.placeholder = '—'
                              }}
                            />
                            {pct > 0 && (
                              <div
                                className="text-[9px] text-center mt-0.5 tabular"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {hrs}h
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}

                    {/* Remove */}
                    <td
                      className="py-2 text-center"
                      style={{ borderBottom: '1px solid var(--row-divider)' }}
                    >
                      <button
                        onClick={() => removePerson(r.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs rounded px-1.5 py-1"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        title="Remove from project"
                      >
                        ✕
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>

          {/* Monthly totals footer */}
          {assignedResources.length > 0 && (
            <tfoot>
              <tr>
                <td
                  className="pt-4 pb-2 pr-6 text-[10px] uppercase tracking-widest font-semibold sticky left-0"
                  style={{ color: 'var(--text-faint)', background: 'var(--bg)' }}
                >
                  Total
                </td>
                {months.map((m) => {
                  const total = assignedResources.reduce((sum, r) => {
                    const cap = assumptions ? calculateMonthlyProductiveCapacity(r, assumptions) : 133
                    const pct = matrix[r.id]?.[m] ?? 0
                    return sum + hoursFromPercent(pct, cap)
                  }, 0)
                  return (
                    <td key={m} className="pt-4 pb-2 px-1 text-center">
                      {total > 0 ? (
                        <span
                          className="text-xs font-bold tabular"
                          style={{ color: 'var(--text)' }}
                        >
                          {total}h
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-faint)' }}>—</span>
                      )}
                    </td>
                  )
                })}
                <td />
              </tr>
            </tfoot>
          )}
        </table>

        {/* Add person */}
        <div className="mt-6">
          {addingPerson ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <Select
                label=""
                options={[
                  { value: '', label: 'Select person…' },
                  ...availableToAdd.map((r) => ({
                    value: r.id,
                    label: `${r.displayName} — ${ROLE_LABELS[r.role]}`,
                  })),
                ]}
                onChange={(e) => { if (e.target.value) addPerson(e.target.value) }}
                style={{ minWidth: 280 }}
              />
              <Button variant="ghost" size="sm" onClick={() => setAddingPerson(false)}>Cancel</Button>
            </motion.div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAddingPerson(true)}
              disabled={availableToAdd.length === 0}
            >
              + Add person
            </Button>
          )}
        </div>

        {/* Empty state */}
        {assignedResources.length === 0 && (
          <div className="mt-12 text-center" style={{ color: 'var(--text-muted)' }}>
            <div className="text-3xl mb-3 opacity-30">◎</div>
            <div className="text-sm">No team members yet.</div>
            <div className="text-xs mt-1 opacity-60">Click "+ Add person" to start building the team.</div>
          </div>
        )}
      </div>
    </div>
  )
}
