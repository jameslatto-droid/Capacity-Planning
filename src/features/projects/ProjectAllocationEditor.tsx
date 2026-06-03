import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { v4 as uuidv4 } from 'uuid'
import { usePlannerStore } from '../../store/plannerStore'
import { calculateMonthlyProductiveCapacity } from '../../domain/capacity/capacityCalculations'
import { generateMonthRange, formatMonth, currentMonth, addMonths } from '../../utils/months'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { useTheme } from '../../utils/ThemeContext'
import type { Resource, ResourceRole } from '../../types'
import { ROLE_LABELS } from '../../types'

type Matrix = Record<string, Record<string, number>> // resourceId → month → percent

function hoursFromPercent(percent: number, capacity: number) {
  return Math.round((percent / 100) * capacity)
}
function percentFromHours(hours: number, capacity: number) {
  if (capacity === 0) return 0
  return Math.round((hours / capacity) * 100)
}

function cellBg(pct: number): string {
  if (pct === 0) return 'transparent'
  if (pct < 40)  return 'rgba(29,78,216,0.18)'
  if (pct < 70)  return 'rgba(5,150,105,0.18)'
  if (pct < 90)  return 'rgba(217,119,6,0.22)'
  if (pct <= 100) return 'rgba(234,88,12,0.22)'
  return 'rgba(220,38,38,0.28)'
}
function cellTextColor(pct: number): string {
  if (pct === 0) return 'var(--text-faint)'
  if (pct > 100)  return '#f87171'
  if (pct > 90)   return '#fb923c'
  return 'var(--text)'
}

// Default: start one month before now, show 12 months forward, clamped to project bounds
function defaultRange(startMonth: string, endMonth: string) {
  const now = currentMonth()
  const oneBack   = addMonths(now, -1)
  const rangeStart = oneBack >= startMonth ? oneBack : startMonth
  const rangeEnd   = addMonths(now, 11)
  const clamped    = rangeEnd > endMonth ? endMonth : rangeEnd
  return { rangeStart, rangeEnd: clamped }
}

// All months within project bounds, for the dropdowns
function projectMonthOptions(startMonth: string, endMonth: string) {
  return generateMonthRange(startMonth, endMonth).map((m) => ({ value: m, label: formatMonth(m) }))
}

export function ProjectAllocationEditor() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { toggle, isDark } = useTheme()
  const { projects, resources, allocations, scenarios, activeScenarioId, setAllocations } = usePlannerStore()

  const project  = projects.find((p) => p.id === projectId)
  const scenario = scenarios.find((s) => s.id === activeScenarioId)
  const assumptions = scenario?.assumptions

  const { rangeStart: defStart, rangeEnd: defEnd } = project
    ? defaultRange(project.startMonth, project.endMonth)
    : { rangeStart: currentMonth(), rangeEnd: addMonths(currentMonth(), 11) }

  const [viewStart, setViewStart] = useState(defStart)
  const [viewEnd,   setViewEnd]   = useState(defEnd)

  const months = useMemo(
    () => generateMonthRange(viewStart, viewEnd),
    [viewStart, viewEnd]
  )

  const existingAllocations = useMemo(
    () => allocations.filter((a) => a.projectId === projectId && a.scenarioId === activeScenarioId),
    [allocations, projectId, activeScenarioId]
  )

  // Assigned resource IDs — derived from existing allocations
  const [assignedResourceIds, setAssignedResourceIds] = useState<string[]>([])
  const [matrix, setMatrix] = useState<Matrix>({})
  const [initialized, setInitialized] = useState(false)

  // Initialize once assumptions + allocations are available
  useEffect(() => {
    if (initialized || !assumptions) return
    const ids = [...new Set(
      existingAllocations.map((a) => a.resourceId).filter(Boolean) as string[]
    )]
    const m: Matrix = {}
    for (const alloc of existingAllocations) {
      if (!alloc.resourceId) continue
      const res = resources.find((r) => r.id === alloc.resourceId)
      if (!res) continue
      const cap = calculateMonthlyProductiveCapacity(res, assumptions)
      if (!m[alloc.resourceId]) m[alloc.resourceId] = {}
      m[alloc.resourceId]![alloc.month] = percentFromHours(alloc.hours, cap)
    }
    setAssignedResourceIds(ids)
    setMatrix(m)
    setInitialized(true)
  }, [assumptions, existingAllocations, initialized, resources])

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => {
    const latest = [...existingAllocations]
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
    setMatrix((prev) => ({ ...prev, [resourceId]: { ...(prev[resourceId] ?? {}), [month]: num } }))
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
    if (!confirm('Remove this person from the project? Their allocations will be deleted on save.')) return
    setAssignedResourceIds((prev) => prev.filter((id) => id !== resourceId))
    setMatrix((prev) => { const n = { ...prev }; delete n[resourceId]; return n })
    setIsDirty(true)
  }

  function handleSave() {
    if (!assumptions) return
    const now = new Date().toISOString()
    const others = allocations.filter(
      (a) => !(a.projectId === projectId && a.scenarioId === activeScenarioId)
    )
    const next = assignedResourceIds.flatMap((resourceId) => {
      const res = resources.find((r) => r.id === resourceId)
      if (!res) return []
      const cap = calculateMonthlyProductiveCapacity(res, assumptions)
      // Persist ALL months (not just the view window) to avoid deleting out-of-view data
      const allProjectMonths = project ? generateMonthRange(project.startMonth, project.endMonth) : months
      return allProjectMonths.flatMap((month) => {
        const percent = matrix[resourceId]?.[month] ?? 0
        if (percent === 0) return []
        const hours = hoursFromPercent(percent, cap)
        const existing = existingAllocations.find((a) => a.resourceId === resourceId && a.month === month)
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
    setAllocations([...others, ...next])
    setLastSavedAt(now)
    setIsDirty(false)
  }

  if (!project) return <div className="p-8" style={{ color: 'var(--text-muted)' }}>Project not found.</div>

  const projectMonths = projectMonthOptions(project.startMonth, project.endMonth)
  const fmtSaved = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/projects')}
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
          >
            ← Projects
          </button>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-semibold mr-2" style={{ color: 'var(--text-faint)' }}>
              {project.code} · {project.frontendBrand}
            </span>
            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              {project.name}
            </span>
          </div>
          {/* Month range pickers */}
          <div className="flex items-end gap-2">
            <Select label="From" value={viewStart} onChange={(e) => setViewStart(e.target.value)} options={projectMonths} />
            <Select label="To"   value={viewEnd}   onChange={(e) => setViewEnd(e.target.value)}   options={projectMonths} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastSavedAt && !isDirty && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Saved {fmtSaved(lastSavedAt)}</span>
          )}
          {isDirty && <span className="text-xs text-amber-500">Unsaved changes</span>}
          <Button variant="primary" onClick={handleSave} disabled={!isDirty}>Save</Button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={toggle}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {isDark ? '☀ Light' : '◑ Dark'}
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto px-6 py-6">
        <table className="text-xs w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th className="text-left pb-2 pr-4 font-semibold text-[10px] uppercase tracking-widest sticky left-0 z-10 whitespace-nowrap"
                style={{ color: 'var(--text-faint)', background: 'var(--bg)', borderBottom: '1px solid var(--border)', minWidth: 150 }}>
                Team Member
              </th>
              {months.map((m) => (
                <th key={m} className="text-center pb-2 px-0.5 font-semibold text-[10px] uppercase tracking-widest whitespace-nowrap"
                  style={{ color: 'var(--text-faint)', borderBottom: '1px solid var(--border)', minWidth: 56 }}>
                  {new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                </th>
              ))}
              <th style={{ borderBottom: '1px solid var(--border)', width: 24 }} />
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
                    transition={{ duration: 0.18 }}
                    className="group"
                  >
                    {/* Name — sticky */}
                    <td className="py-1.5 pr-4 sticky left-0 z-10 whitespace-nowrap"
                      style={{ background: 'var(--bg)', borderBottom: '1px solid var(--row-divider)' }}>
                      <div className="font-semibold" style={{ color: 'var(--text)' }}>{r.displayName}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {ROLE_LABELS[r.role]} · {Math.round(cap)}h/mo
                      </div>
                    </td>
                    {/* Month cells */}
                    {months.map((m) => {
                      const pct = rowMatrix[m] ?? 0
                      const hrs = hoursFromPercent(pct, cap)
                      return (
                        <td key={m} className="px-0.5 py-1.5 text-center"
                          style={{ borderBottom: '1px solid var(--row-divider)' }}>
                          <div className="relative mx-auto" style={{ width: 52 }}>
                            <input
                              type="number"
                              min={0}
                              max={200}
                              value={pct === 0 ? '' : pct}
                              placeholder="—"
                              onChange={(e) => updateCell(r.id, m, e.target.value)}
                              className="w-full text-center rounded-md py-1 text-xs font-bold tabular transition-all"
                              style={{
                                background: cellBg(pct),
                                color: cellTextColor(pct),
                                border: `1px solid ${pct > 0 ? 'transparent' : 'var(--border)'}`,
                                outline: 'none',
                              }}
                              onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.4)' }}
                              onBlur={(e)  => { e.target.style.boxShadow = 'none' }}
                            />
                            {pct > 0 && (
                              <div className="text-[9px] text-center leading-none mt-0.5 tabular"
                                style={{ color: 'var(--text-muted)' }}>
                                {hrs}h
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                    {/* Remove */}
                    <td className="py-1.5 text-center" style={{ borderBottom: '1px solid var(--row-divider)' }}>
                      <button
                        onClick={() => removePerson(r.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] rounded px-1 py-0.5"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f87171' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                        title="Remove"
                      >✕</button>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
          {/* Totals footer */}
          {assignedResources.length > 0 && (
            <tfoot>
              <tr>
                <td className="pt-3 pb-1 pr-4 text-[10px] uppercase tracking-widest font-semibold sticky left-0"
                  style={{ color: 'var(--text-faint)', background: 'var(--bg)' }}>
                  Total
                </td>
                {months.map((m) => {
                  const total = assignedResources.reduce((sum, r) => {
                    const cap = assumptions ? calculateMonthlyProductiveCapacity(r, assumptions) : 133
                    return sum + hoursFromPercent(matrix[r.id]?.[m] ?? 0, cap)
                  }, 0)
                  return (
                    <td key={m} className="pt-3 pb-1 px-0.5 text-center">
                      <span className="text-xs font-bold tabular" style={{ color: total > 0 ? 'var(--text)' : 'var(--text-faint)' }}>
                        {total > 0 ? `${total}h` : '—'}
                      </span>
                    </td>
                  )
                })}
                <td />
              </tr>
            </tfoot>
          )}
        </table>

        {/* Add person */}
        <div className="mt-5">
          {addingPerson ? (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
              <Select
                label=""
                options={[
                  { value: '', label: 'Select person…' },
                  ...availableToAdd.map((r) => ({ value: r.id, label: `${r.displayName} — ${ROLE_LABELS[r.role]}` })),
                ]}
                onChange={(e) => { if (e.target.value) addPerson(e.target.value) }}
                style={{ minWidth: 260 }}
              />
              <Button variant="ghost" size="sm" onClick={() => setAddingPerson(false)}>Cancel</Button>
            </motion.div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setAddingPerson(true)} disabled={availableToAdd.length === 0}>
              + Add person
            </Button>
          )}
        </div>

        {assignedResources.length === 0 && initialized && (
          <div className="mt-12 text-center" style={{ color: 'var(--text-muted)' }}>
            <div className="text-3xl mb-3 opacity-30">◎</div>
            <div className="text-sm">No team members yet.</div>
            <div className="text-xs mt-1 opacity-60">Click "+ Add person" to build the team.</div>
          </div>
        )}
      </div>
    </div>
  )
}
