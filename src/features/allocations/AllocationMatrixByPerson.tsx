import { useMemo } from 'react'
import { usePlannerStore } from '../../store/plannerStore'
import { generateMonthRange, formatMonth } from '../../utils/months'
import { calculateMonthlyCapacityWithLeave, getLeaveDaysInMonth } from '../../domain/capacity/leaveCalculations'
import type { LeaveType } from '../../types'
import { utilisationColor, utilisationTextColor } from '../../utils/format'
import { isOutsideContract } from '../../utils/contractDates'
import { ROLE_LABELS } from '../../types'

interface Props {
  scenarioId: string
  startMonth: string
  endMonth: string
  viewMode: 'person' | 'project' | 'role'
  valueMode?: 'hours' | 'percent'
}

const ROW = { borderBottom: '1px solid var(--row-divider)' }
const HEAD = { borderBottom: '1px solid var(--border)' }

export function AllocationMatrixByPerson({ scenarioId, startMonth, endMonth, viewMode, valueMode = 'hours' }: Props) {
  const isPct = valueMode === 'percent'
  const { resources, projects, allocations, scenarios, leaveEntries } = usePlannerStore()
  const months = generateMonthRange(startMonth, endMonth)
  const scenario = scenarios.find((s) => s.id === scenarioId)
  const assumptions = scenario?.assumptions

  const filteredAllocations = useMemo(
    () => allocations.filter((a) => a.scenarioId === scenarioId && months.includes(a.month)),
    [allocations, scenarioId, months]
  )

  if (!assumptions) return <div style={{ color: 'var(--text-faint)' }}>No scenario found.</div>

  const thCls = 'text-right pb-3 text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap px-2'
  const thLeft = 'text-left pb-3 text-[10px] uppercase tracking-widest font-semibold'
  const thStyle = { color: 'var(--text-faint)' }

  if (viewMode === 'person') {
    return (
      <div className="overflow-x-auto">
        <table className="text-xs w-full">
          <thead>
            <tr style={HEAD}>
              <th className={thLeft} style={thStyle}>Person / Project</th>
              {months.map((m) => <th key={m} className={thCls} style={thStyle}>{formatMonth(m)}</th>)}
            </tr>
          </thead>
          <tbody>
            {resources.filter((r) => r.active).map((r) => {
              const personAllocs = filteredAllocations.filter((a) => a.resourceId === r.id)
              const projectIds = [...new Set(personAllocs.map((a) => a.projectId))]
              const personLeave = leaveEntries.filter((e) => e.resourceId === r.id)
              const hasLeaveInView = months.some((m) => getLeaveDaysInMonth(r, m, personLeave) > 0)
              // Pre-compute capacity per month so project sub-rows can use it for % mode
              const capByMonth = Object.fromEntries(
                months.map(m => [m, calculateMonthlyCapacityWithLeave(r, m, leaveEntries, assumptions)])
              )

              return [
                // ── Capacity header row ──────────────────────────────────
                <tr key={`${r.id}-cap`} style={{ ...ROW, background: 'rgba(124,58,237,0.06)' }}>
                  <td className="py-2.5 font-semibold" style={{ color: 'var(--text)' }}>{r.displayName}</td>
                  {months.map((m) => {
                    const capacity = capByMonth[m] ?? 0
                    const allocated = personAllocs.filter((a) => a.month === m).reduce((s, a) => s + a.hours, 0)
                    const util = capacity > 0 ? allocated / capacity : 0
                    const outsideContract = allocated > 0 && isOutsideContract(r, m)
                    const label = isPct
                      ? (allocated > 0 ? `${Math.round(util * 100)}%` : '—')
                      : (allocated > 0 ? `${Math.round(allocated)}/${Math.round(capacity)}h` : `—/${Math.round(capacity)}h`)
                    return (
                      <td key={m} className="px-2 py-2.5 text-right">
                        <span
                          className={`tabular font-semibold text-xs px-1.5 py-0.5 rounded ${utilisationTextColor(util)}`}
                          style={{
                            background: allocated > 0 ? utilisationColor(util) : 'transparent',
                            outline: outsideContract ? '1.5px solid rgba(245,158,11,0.8)' : 'none',
                            outlineOffset: 1,
                          }}
                          title={outsideContract ? 'Allocated outside contract period' : undefined}
                        >
                          {outsideContract && <span style={{ marginRight: 3, fontSize: 9 }}>⚠</span>}
                          {label}
                        </span>
                      </td>
                    )
                  })}
                </tr>,

                // ── Leave row (only shown when leave exists in view) ──────
                ...(hasLeaveInView ? [
                  <tr key={`${r.id}-leave`} style={ROW}>
                    <td className="py-1.5 pl-6 font-medium flex items-center gap-1.5"
                      style={{ color: '#d97706' }}>
                      <span style={{ fontSize: 10 }}>◷</span> Leave
                    </td>
                    {months.map((m) => {
                      const days = getLeaveDaysInMonth(r, m, personLeave)
                      // Pick dominant leave type for colour
                      const [y, mo] = m.split('-').map(Number)
                      const ms2 = new Date(y!, mo! - 1, 1)
                      const me2 = new Date(y!, mo!, 0)
                      const monthEntries = personLeave.filter((e) => {
                        const s = new Date(e.startDate + 'T00:00:00')
                        const end2 = new Date(e.endDate + 'T00:00:00')
                        return s <= me2 && end2 >= ms2
                      })
                      const type: LeaveType = monthEntries[0]?.type ?? 'annual'
                      const typeColor: Record<LeaveType, string> = {
                        'annual': 'rgba(37,99,235,0.55)',
                        'sick': 'rgba(217,119,6,0.6)',
                        'public-holiday': 'rgba(124,58,237,0.55)',
                        'unpaid': 'rgba(107,114,128,0.5)',
                        'other': 'rgba(75,85,99,0.45)',
                      }
                      const typeText: Record<LeaveType, string> = {
                        'annual': '#93c5fd',
                        'sick': '#fde68a',
                        'public-holiday': '#c4b5fd',
                        'unpaid': '#d1d5db',
                        'other': '#9ca3af',
                      }
                      return (
                        <td key={m} className="px-2 py-1.5 text-right">
                          {days > 0 ? (
                            <span
                              className="tabular font-semibold text-[11px] px-1.5 py-0.5 rounded"
                              style={{ background: typeColor[type], color: typeText[type] }}
                              title={monthEntries.map((e) => `${e.type}: ${e.startDate} – ${e.endDate}`).join('\n')}
                            >
                              {days}d
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-faint)' }}>—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ] : []),

                // ── Project sub-rows ─────────────────────────────────────
                ...projectIds.map((pid) => {
                  const proj = projects.find((p) => p.id === pid)
                  return (
                    <tr key={`${r.id}-${pid}`} style={ROW}>
                      <td className="py-1.5 pl-6" style={{ color: 'var(--text-faint)' }}>{proj?.code} — {proj?.name}</td>
                      {months.map((m) => {
                        const hrs = personAllocs.filter((a) => a.projectId === pid && a.month === m).reduce((s, a) => s + a.hours, 0)
                        const cap = capByMonth[m] ?? 1
                        const display = hrs > 0
                          ? (isPct ? `${Math.round(hrs / cap * 100)}%` : `${hrs}h`)
                          : null
                        return (
                          <td key={m} className="px-2 py-1.5 text-right tabular" style={{ color: 'var(--text-muted)' }}>
                            {display ?? <span style={{ color: 'var(--text-faint)' }}>—</span>}
                          </td>
                        )
                      })}
                    </tr>
                  )
                }),
              ]
            })}
          </tbody>
        </table>
      </div>
    )
  }

  if (viewMode === 'project') {
    return (
      <div className="overflow-x-auto">
        <table className="text-xs w-full">
          <thead>
            <tr style={HEAD}>
              <th className={thLeft} style={thStyle}>Project / Person</th>
              {months.map((m) => <th key={m} className={thCls} style={thStyle}>{formatMonth(m)}</th>)}
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => {
              const projAllocs = filteredAllocations.filter((a) => a.projectId === proj.id)
              if (!projAllocs.length) return null
              const resourceIds = [...new Set(projAllocs.map((a) => a.resourceId).filter(Boolean))] as string[]
              return [
                <tr key={`${proj.id}-total`} style={{ ...ROW, background: 'rgba(16,185,129,0.04)' }}>
                  <td className="py-2.5 font-semibold text-emerald-400">{proj.code} — {proj.name}</td>
                  {months.map((m) => {
                    const hrs = projAllocs.filter((a) => a.month === m).reduce((s, a) => s + a.hours, 0)
                    return <td key={m} className="px-2 py-2.5 text-right tabular font-semibold text-emerald-400/70">{hrs > 0 ? `${hrs}h` : <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                  })}
                </tr>,
                ...resourceIds.map((rid) => {
                  const res = resources.find((r) => r.id === rid)
                  return (
                    <tr key={`${proj.id}-${rid}`} style={ROW}>
                      <td className="py-1.5 pl-6" style={{ color: 'var(--text-faint)' }}>{res?.displayName ?? rid}</td>
                      {months.map((m) => {
                        const hrs = projAllocs.filter((a) => a.resourceId === rid && a.month === m).reduce((s, a) => s + a.hours, 0)
                        return <td key={m} className="px-2 py-1.5 text-right tabular" style={{ color: 'var(--text-muted)' }}>{hrs > 0 ? `${hrs}h` : <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                      })}
                    </tr>
                  )
                }),
              ]
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const activeResources = resources.filter((r) => r.active)
  const roles = ['project-management','process-engineering','mechanical-engineering','drafting','procurement','quality','technical-review','management','other'] as const
  return (
    <div className="overflow-x-auto">
      <table className="text-xs w-full">
        <thead>
          <tr style={HEAD}>
            <th className={thLeft} style={thStyle}>Role</th>
            {months.map((m) => <th key={m} className={thCls} style={thStyle}>{formatMonth(m)}</th>)}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => {
            const roleAllocs = filteredAllocations.filter((a) => a.role === role)
            const roleResources = activeResources.filter((r) => r.role === role || r.secondaryRoles?.includes(role))
            if (!roleAllocs.length && !roleResources.length) return null
            return (
              <tr key={role} style={ROW} className="group">
                <td
                  className={`py-2.5 font-medium${role === 'quality' ? ' text-violet-400' : ''}`}
                  style={role === 'quality' ? undefined : { color: 'var(--text-muted)' }}
                >
                  {ROLE_LABELS[role]}
                </td>
                {months.map((m) => {
                  const totalCap = roleResources.reduce((s, r) => s + calculateMonthlyCapacityWithLeave(r, m, leaveEntries, assumptions), 0)
                  const totalAlloc = roleAllocs.filter((a) => a.month === m).reduce((s, a) => s + a.hours, 0)
                  const util = totalCap > 0 ? totalAlloc / totalCap : 0
                  const roleLabel = totalAlloc > 0
                    ? (isPct ? `${Math.round(util * 100)}%` : `${Math.round(totalAlloc)}h`)
                    : null
                  return (
                    <td key={m} className="px-2 py-2.5 text-right">
                      {roleLabel ? (
                        <span
                          className={`tabular text-xs font-semibold px-1.5 py-0.5 rounded ${utilisationTextColor(util)}`}
                          style={{ background: utilisationColor(util) }}
                        >
                          {roleLabel}
                        </span>
                      ) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
