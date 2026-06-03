import { useMemo, useState } from 'react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Select } from '../../components/ui/Select'
import { StatCard } from '../../components/ui/StatCard'
import { formatHours, formatPercent, formatFte, utilisationBgColor } from '../../utils/format'
import { formatMonth, generateMonthRange } from '../../utils/months'
import { calculatePersonUtilisation } from '../../domain/utilisation/utilisationCalculations'
import { calculateMonthlyProductiveCapacity } from '../../domain/capacity/capacityCalculations'
import {
  findOverloadedPersonMonths,
  suggestSameRoleReallocations,
  calculateResidualOverload,
  calculateContractorFteRequirement,
} from '../../domain/optimisation/optimisationRules'
import { ROLE_LABELS } from '../../types'

const MONTHS = generateMonthRange('2026-01', '2026-12')

export function OptimisationPage() {
  const { resources, allocations, scenarios, activeScenarioId } = usePlannerStore()
  const [scenarioId, setScenarioId] = useState(activeScenarioId)
  const [startMonth, setStartMonth] = useState('2026-06')
  const [endMonth, setEndMonth] = useState('2026-12')

  const scenario = scenarios.find((s) => s.id === scenarioId)
  const assumptions = scenario?.assumptions

  const filteredMonths = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth])
  const scenarioAllocations = useMemo(
    () => allocations.filter((a) => a.scenarioId === scenarioId && filteredMonths.includes(a.month)),
    [allocations, scenarioId, filteredMonths]
  )
  const activeResources = resources.filter((r) => r.active)

  const allPersonResults = useMemo(() => {
    if (!assumptions) return []
    return activeResources.flatMap((r) =>
      filteredMonths.map((m) => calculatePersonUtilisation(r, scenarioAllocations, assumptions, m))
    )
  }, [activeResources, scenarioAllocations, assumptions, filteredMonths])

  const overloads = useMemo(() => findOverloadedPersonMonths(allPersonResults), [allPersonResults])

  const recommendations = useMemo(
    () => suggestSameRoleReallocations(overloads, activeResources, allPersonResults, scenarioAllocations),
    [overloads, activeResources, allPersonResults, scenarioAllocations]
  )

  const residualOverload = useMemo(
    () => calculateResidualOverload(overloads, recommendations),
    [overloads, recommendations]
  )

  const monthlyFteCapacity = assumptions
    ? calculateMonthlyProductiveCapacity(
        { id: '', displayName: '', role: 'other', employmentType: 'employee', contractHoursPerWeek: 40, workingDaysPerWeek: 5, fullTimeHoursPerWeek: 40, active: true },
        assumptions
      )
    : 129

  const contractorReqs = useMemo(
    () => calculateContractorFteRequirement(residualOverload, monthlyFteCapacity),
    [residualOverload, monthlyFteCapacity]
  )

  const scenarioOptions = scenarios.map((s) => ({ value: s.id, label: s.name }))
  const monthOptions = MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))

  if (!assumptions) return <PageLayout title="Optimisation"><p className="text-gray-500">No scenario found.</p></PageLayout>

  return (
    <PageLayout title="Optimisation">
      <div className="flex flex-wrap gap-3 mb-6">
        <Select label="Scenario" value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} options={scenarioOptions} />
        <Select label="From" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} options={monthOptions} />
        <Select label="To" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} options={monthOptions} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Person Overloads" value={String(overloads.length)} accent={overloads.length > 0 ? 'red' : 'green'} />
        <StatCard label="Total Overload" value={formatHours(overloads.reduce((s, o) => s + o.overloadHours, 0))} accent={overloads.length > 0 ? 'red' : 'green'} />
        <StatCard label="Residual After Recs" value={formatHours(residualOverload)} accent={residualOverload > 0 ? 'orange' : 'green'} />
        <StatCard label="Contractor FTE" value={contractorReqs[0] ? formatFte(contractorReqs[0].contractorFte) : '0.00'} accent={residualOverload > 0 ? 'orange' : 'green'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overloads */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Person-Month Overloads</h2>
          {overloads.length === 0 ? (
            <p className="text-sm text-green-600">No overloads detected.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">Person</th>
                  <th className="text-left py-2 font-medium text-gray-600">Month</th>
                  <th className="text-right py-2 font-medium text-gray-600">Overload</th>
                  <th className="text-right py-2 font-medium text-gray-600">Util</th>
                </tr>
              </thead>
              <tbody>
                {overloads.map((o) => {
                  const name = resources.find((r) => r.id === o.resourceId)?.displayName ?? o.resourceId
                  return (
                    <tr key={`${o.resourceId}-${o.month}`} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{name}</td>
                      <td className="py-2 text-gray-600">{formatMonth(o.month)}</td>
                      <td className="py-2 text-right font-medium text-red-600">{formatHours(o.overloadHours)}</td>
                      <td className="py-2 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${utilisationBgColor(o.utilisation)}`}>
                          {formatPercent(o.utilisation)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Reallocation Recommendations</h2>
          {recommendations.length === 0 ? (
            <p className="text-sm text-gray-500">{overloads.length === 0 ? 'No overloads to resolve.' : 'No same-role capacity available to reallocate.'}</p>
          ) : (
            <ul className="space-y-2">
              {recommendations.map((r, i) => (
                <li key={i} className="text-sm bg-blue-50 text-blue-800 rounded p-2.5">
                  <div className="font-medium capitalize">{r.type.replace(/-/g, ' ')}</div>
                  <div className="text-xs mt-0.5">{r.description}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Available capacity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Available Capacity</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-600">Person</th>
                <th className="text-left py-2 font-medium text-gray-600">Role</th>
                {filteredMonths.slice(0, 4).map((m) => (
                  <th key={m} className="text-right py-2 font-medium text-gray-600">{formatMonth(m)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeResources.map((r) => {
                const monthData = filteredMonths.slice(0, 4).map((m) => {
                  const result = allPersonResults.find((pr) => pr.resourceId === r.id && pr.month === m)
                  return {
                    month: m,
                    available: Math.max(0, (result?.capacityHours ?? 0) - (result?.allocatedHours ?? 0)),
                  }
                })
                const totalAvailable = monthData.reduce((s, d) => s + d.available, 0)
                if (totalAvailable === 0) return null
                return (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 text-gray-900">{r.displayName}</td>
                    <td className="py-2 text-gray-500 text-xs">{ROLE_LABELS[r.role]}</td>
                    {monthData.map((d) => (
                      <td key={d.month} className="py-2 text-right text-green-700 text-xs font-medium">
                        {d.available > 0 ? formatHours(d.available) : '—'}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Contractor requirement */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Contractor Requirement</h2>
          {contractorReqs.length === 0 ? (
            <p className="text-sm text-green-600">No contractor capacity required.</p>
          ) : (
            <div className="space-y-2">
              {contractorReqs.map((req) => (
                <div key={req.month} className="bg-orange-50 rounded p-3 text-sm">
                  <div className="font-medium text-orange-800">Residual overload after recommendations</div>
                  <div className="text-orange-700 mt-1">{formatHours(req.residualOverloadHours)} = {formatFte(req.contractorFte)} FTE/month</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
