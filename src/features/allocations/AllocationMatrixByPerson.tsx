import { useMemo } from 'react'
import { usePlannerStore } from '../../store/plannerStore'
import { generateMonthRange, formatMonth } from '../../utils/months'
import { calculateMonthlyProductiveCapacity } from '../../domain/capacity/capacityCalculations'
import { utilisationBgColor } from '../../utils/format'
import { ROLE_LABELS } from '../../types'

interface Props {
  scenarioId: string
  startMonth: string
  endMonth: string
  viewMode: 'person' | 'project' | 'role'
}

export function AllocationMatrixByPerson({ scenarioId, startMonth, endMonth, viewMode }: Props) {
  const { resources, projects, allocations, scenarios } = usePlannerStore()
  const months = generateMonthRange(startMonth, endMonth)
  const scenario = scenarios.find((s) => s.id === scenarioId)
  const assumptions = scenario?.assumptions

  const filteredAllocations = useMemo(
    () => allocations.filter((a) => a.scenarioId === scenarioId && months.includes(a.month)),
    [allocations, scenarioId, months]
  )

  if (!assumptions) return <div className="text-gray-500">No scenario found.</div>

  if (viewMode === 'person') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Person / Project</th>
              {months.map((m) => (
                <th key={m} className="text-right px-3 py-3 font-medium text-gray-600 whitespace-nowrap">{formatMonth(m)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.filter((r) => r.active).map((r) => {
              const capacity = calculateMonthlyProductiveCapacity(r, assumptions)
              const personAllocs = filteredAllocations.filter((a) => a.resourceId === r.id)
              const projectIds = [...new Set(personAllocs.map((a) => a.projectId))]

              return [
                // Capacity row
                <tr key={`${r.id}-cap`} className="bg-blue-50">
                  <td className="px-4 py-1.5 font-semibold text-blue-800 whitespace-nowrap">{r.displayName} <span className="font-normal text-blue-500 text-xs">(cap)</span></td>
                  {months.map((m) => {
                    const allocated = personAllocs
                      .filter((a) => a.month === m)
                      .reduce((s, a) => s + a.hours, 0)
                    const util = allocated / capacity
                    return (
                      <td key={m} className="px-3 py-1.5 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${allocated > 0 ? utilisationBgColor(util) : 'text-gray-400'}`}>
                          {allocated > 0 ? `${Math.round(allocated)}/${Math.round(capacity)}h` : `—/${Math.round(capacity)}h`}
                        </span>
                      </td>
                    )
                  })}
                </tr>,
                // Per-project rows
                ...projectIds.map((pid) => {
                  const proj = projects.find((p) => p.id === pid)
                  return (
                    <tr key={`${r.id}-${pid}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-1 pl-8 text-gray-600 whitespace-nowrap text-xs">
                        {proj?.code ?? pid} — {proj?.name ?? ''}
                      </td>
                      {months.map((m) => {
                        const hrs = personAllocs
                          .filter((a) => a.projectId === pid && a.month === m)
                          .reduce((s, a) => s + a.hours, 0)
                        return (
                          <td key={m} className="px-3 py-1 text-right text-xs text-gray-700">
                            {hrs > 0 ? `${hrs}h` : '—'}
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Project / Person</th>
              {months.map((m) => (
                <th key={m} className="text-right px-3 py-3 font-medium text-gray-600 whitespace-nowrap">{formatMonth(m)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => {
              const projAllocs = filteredAllocations.filter((a) => a.projectId === proj.id)
              if (projAllocs.length === 0) return null
              const resourceIds = [...new Set(projAllocs.map((a) => a.resourceId).filter(Boolean))] as string[]
              return [
                <tr key={`${proj.id}-total`} className="bg-green-50">
                  <td className="px-4 py-1.5 font-semibold text-green-800 whitespace-nowrap">{proj.code} — {proj.name}</td>
                  {months.map((m) => {
                    const hrs = projAllocs.filter((a) => a.month === m).reduce((s, a) => s + a.hours, 0)
                    return <td key={m} className="px-3 py-1.5 text-right font-medium text-green-700 text-xs">{hrs > 0 ? `${hrs}h` : '—'}</td>
                  })}
                </tr>,
                ...resourceIds.map((rid) => {
                  const res = resources.find((r) => r.id === rid)
                  return (
                    <tr key={`${proj.id}-${rid}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-1 pl-8 text-gray-600 whitespace-nowrap text-xs">{res?.displayName ?? rid}</td>
                      {months.map((m) => {
                        const hrs = projAllocs.filter((a) => a.resourceId === rid && a.month === m).reduce((s, a) => s + a.hours, 0)
                        return <td key={m} className="px-3 py-1 text-right text-xs text-gray-700">{hrs > 0 ? `${hrs}h` : '—'}</td>
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

  // Role view
  const activeResources = resources.filter((r) => r.active)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      <table className="text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Role</th>
            {months.map((m) => (
              <th key={m} className="text-right px-3 py-3 font-medium text-gray-600 whitespace-nowrap">{formatMonth(m)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {['project-management','process-engineering','mechanical-engineering','drafting','procurement','quality','technical-review','management','other'].map((role) => {
            const roleAllocs = filteredAllocations.filter((a) => a.role === role)
            const roleResources = activeResources.filter((r) => r.role === role || r.secondaryRoles?.includes(role as never))
            const hasData = roleAllocs.length > 0 || roleResources.length > 0
            if (!hasData) return null
            return (
              <tr key={role} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{ROLE_LABELS[role as keyof typeof ROLE_LABELS]}</td>
                {months.map((m) => {
                  const totalCap = roleResources.reduce((s, r) => s + calculateMonthlyProductiveCapacity(r, assumptions), 0)
                  const totalAlloc = roleAllocs.filter((a) => a.month === m).reduce((s, a) => s + a.hours, 0)
                  const util = totalCap > 0 ? totalAlloc / totalCap : 0
                  return (
                    <td key={m} className="px-3 py-2 text-right">
                      {totalAlloc > 0 ? (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${utilisationBgColor(util)}`}>
                          {Math.round(totalAlloc)}h
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
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
