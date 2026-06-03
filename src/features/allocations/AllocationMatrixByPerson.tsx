import { useMemo } from 'react'
import { usePlannerStore } from '../../store/plannerStore'
import { generateMonthRange, formatMonth } from '../../utils/months'
import { calculateMonthlyCapacityWithLeave } from '../../domain/capacity/leaveCalculations'
import { utilisationColor, utilisationTextColor } from '../../utils/format'
import { ROLE_LABELS } from '../../types'

interface Props {
  scenarioId: string
  startMonth: string
  endMonth: string
  viewMode: 'person' | 'project' | 'role'
}

const ROW = { borderBottom: '1px solid var(--row-divider)' }
const HEAD = { borderBottom: '1px solid var(--border)' }

export function AllocationMatrixByPerson({ scenarioId, startMonth, endMonth, viewMode }: Props) {
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
              return [
                <tr key={`${r.id}-cap`} style={{ ...ROW, background: 'rgba(124,58,237,0.06)' }}>
                  <td className="py-2.5 font-semibold text-violet-300" style={{ color: 'var(--text)' }}>{r.displayName}</td>
                  {months.map((m) => {
                    const capacity = calculateMonthlyCapacityWithLeave(r, m, leaveEntries, assumptions)
                    const allocated = personAllocs.filter((a) => a.month === m).reduce((s, a) => s + a.hours, 0)
                    const util = allocated / capacity
                    return (
                      <td key={m} className="px-2 py-2.5 text-right">
                        <span
                          className={`tabular font-semibold text-xs px-1.5 py-0.5 rounded ${utilisationTextColor(util)}`}
                          style={{ background: allocated > 0 ? utilisationColor(util) : 'transparent' }}
                        >
                          {allocated > 0 ? `${Math.round(allocated)}/${Math.round(capacity)}h` : `—/${Math.round(capacity)}h`}
                        </span>
                      </td>
                    )
                  })}
                </tr>,
                ...projectIds.map((pid) => {
                  const proj = projects.find((p) => p.id === pid)
                  return (
                    <tr key={`${r.id}-${pid}`} style={ROW}>
                      <td className="py-1.5 pl-6" style={{ color: 'var(--text-faint)' }}>{proj?.code} — {proj?.name}</td>
                      {months.map((m) => {
                        const hrs = personAllocs.filter((a) => a.projectId === pid && a.month === m).reduce((s, a) => s + a.hours, 0)
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
                  return (
                    <td key={m} className="px-2 py-2.5 text-right">
                      {totalAlloc > 0 ? (
                        <span
                          className={`tabular text-xs font-semibold px-1.5 py-0.5 rounded ${utilisationTextColor(util)}`}
                          style={{ background: utilisationColor(util) }}
                        >
                          {Math.round(totalAlloc)}h
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
