import { useMemo, useState } from 'react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { StatCard } from '../../components/ui/StatCard'
import { Select } from '../../components/ui/Select'
import { formatHours, formatPercent, utilisationBgColor, statusLabel } from '../../utils/format'
import { formatMonth, generateMonthRange } from '../../utils/months'
import {
  calculatePersonUtilisation,
  calculateRoleUtilisation,
  calculateTeamUtilisation,
} from '../../domain/utilisation/utilisationCalculations'
import { CapacityDemandChart } from './CapacityDemandChart'
import type { FrontendBrand, ResourceRole } from '../../types'
import { ALL_ROLES, ROLE_LABELS } from '../../types'

const MONTHS = generateMonthRange('2026-01', '2026-12')

export function DashboardPage() {
  const { resources, projects, allocations, scenarios, activeScenarioId } = usePlannerStore()

  const [scenarioId, setScenarioId] = useState(activeScenarioId)
  const [startMonth, setStartMonth] = useState('2026-06')
  const [endMonth, setEndMonth] = useState('2026-12')
  const [brandFilter, setBrandFilter] = useState<'DCT' | 'PLK' | 'both'>('both')
  const [roleFilter, setRoleFilter] = useState<ResourceRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')

  const scenario = scenarios.find((s) => s.id === scenarioId)
  const assumptions = scenario?.assumptions

  const filteredMonths = useMemo(
    () => generateMonthRange(startMonth, endMonth),
    [startMonth, endMonth]
  )

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (brandFilter !== 'both' && p.frontendBrand !== brandFilter) return false
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      return true
    })
  }, [projects, brandFilter, statusFilter])

  const filteredProjectIds = new Set(filteredProjects.map((p) => p.id))

  const filteredAllocations = useMemo(() => {
    return allocations.filter((a) => {
      if (a.scenarioId !== scenarioId) return false
      if (!filteredProjectIds.has(a.projectId)) return false
      if (!filteredMonths.includes(a.month)) return false
      if (roleFilter !== 'all' && a.role !== roleFilter) return false
      if (resourceFilter !== 'all' && a.resourceId !== resourceFilter) return false
      return true
    })
  }, [allocations, scenarioId, filteredProjectIds, filteredMonths, roleFilter, resourceFilter])

  const activeResources = useMemo(
    () => resources.filter((r) => r.active && (resourceFilter === 'all' || r.id === resourceFilter)),
    [resources, resourceFilter]
  )

  if (!assumptions) {
    return <PageLayout title="Dashboard"><div className="text-gray-500">No scenario found.</div></PageLayout>
  }

  // Team-level totals
  const teamByMonth = filteredMonths.map((m) =>
    calculateTeamUtilisation(activeResources, filteredAllocations, assumptions, m)
  )

  const totalCapacity = teamByMonth.reduce((s, m) => s + m.capacityHours, 0)
  const totalDemand = teamByMonth.reduce((s, m) => s + m.allocatedHours, 0)
  const totalOverload = teamByMonth.reduce((s, m) => s + m.overloadHours, 0)
  const overallUtil = totalCapacity > 0 ? totalDemand / totalCapacity : 0

  const highestRiskMonth = teamByMonth.reduce(
    (worst, m) => (m.overloadHours > (worst?.overloadHours ?? 0) ? m : worst),
    teamByMonth[0]
  )

  // Person utilisation
  const personResults = activeResources.flatMap((r) =>
    filteredMonths.map((m) =>
      calculatePersonUtilisation(r, filteredAllocations, assumptions, m)
    )
  )

  const mostOverloadedPerson = personResults.reduce(
    (worst, r) => (r.utilisation > (worst?.utilisation ?? 0) ? r : worst),
    personResults[0]
  )

  const mostOverloadedPersonName = resources.find(
    (r) => r.id === mostOverloadedPerson?.resourceId
  )?.displayName ?? '—'

  // Role utilisation
  const roleResults = ALL_ROLES.flatMap((role) =>
    filteredMonths.map((m) =>
      calculateRoleUtilisation(role, activeResources, filteredAllocations, assumptions, m)
    )
  )

  const mostOverloadedRole = roleResults.reduce(
    (worst, r) => (r.utilisation > (worst?.utilisation ?? 0) ? r : worst),
    roleResults[0]
  )

  const netAccent =
    totalDemand - totalCapacity > 0 ? 'red' : totalDemand / totalCapacity > 0.85 ? 'yellow' : 'green'

  const scenarioOptions = scenarios.map((s) => ({ value: s.id, label: s.name }))
  const monthOptions = MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))
  const brandOptions = [
    { value: 'both', label: 'Both brands' },
    { value: 'DCT', label: 'DCT' },
    { value: 'PLK', label: 'PLK' },
  ]
  const roleOptions = [
    { value: 'all', label: 'All roles' },
    ...ALL_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] })),
  ]
  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'planned', label: 'Planned' },
    { value: 'opportunity', label: 'Opportunity' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'complete', label: 'Complete' },
  ]
  const resourceOptions = [
    { value: 'all', label: 'All resources' },
    ...resources.filter((r) => r.active).map((r) => ({ value: r.id, label: r.displayName })),
  ]

  return (
    <PageLayout title="Dashboard">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select label="Scenario" value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} options={scenarioOptions} />
        <Select label="From" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} options={monthOptions} />
        <Select label="To" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} options={monthOptions} />
        <Select label="Brand" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value as FrontendBrand | 'both')} options={brandOptions} />
        <Select label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as ResourceRole | 'all')} options={roleOptions} />
        <Select label="Project status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} />
        <Select label="Resource" value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)} options={resourceOptions} />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Capacity" value={formatHours(totalCapacity)} sub={`${filteredMonths.length} months`} accent="blue" />
        <StatCard label="Total Demand" value={formatHours(totalDemand)} />
        <StatCard label="Net Position" value={formatHours(totalCapacity - totalDemand)} accent={netAccent} />
        <StatCard label="Utilisation" value={formatPercent(overallUtil)} accent={overallUtil > 1 ? 'red' : overallUtil > 0.85 ? 'yellow' : 'green'} />
        <StatCard label="Overload Hours" value={formatHours(totalOverload)} accent={totalOverload > 0 ? 'red' : 'green'} />
        <StatCard label="Highest-Risk Month" value={highestRiskMonth ? formatMonth(highestRiskMonth.month) : '—'} sub={highestRiskMonth ? formatHours(highestRiskMonth.overloadHours) + ' overload' : ''} accent={totalOverload > 0 ? 'orange' : 'default'} />
        <StatCard label="Most Overloaded Person" value={mostOverloadedPerson && mostOverloadedPerson.utilisation > 1 ? mostOverloadedPersonName : '—'} sub={mostOverloadedPerson && mostOverloadedPerson.utilisation > 1 ? formatPercent(mostOverloadedPerson.utilisation) : 'No overloads'} accent={mostOverloadedPerson && mostOverloadedPerson.utilisation > 1 ? 'red' : 'green'} />
        <StatCard label="Most Overloaded Role" value={mostOverloadedRole && mostOverloadedRole.utilisation > 1 ? ROLE_LABELS[mostOverloadedRole.role] : '—'} sub={mostOverloadedRole && mostOverloadedRole.utilisation > 1 ? formatPercent(mostOverloadedRole.utilisation) : 'No overloads'} accent={mostOverloadedRole && mostOverloadedRole.utilisation > 1 ? 'red' : 'green'} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Capacity vs Demand</h2>
        <CapacityDemandChart data={teamByMonth} months={filteredMonths} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Person utilisation table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Person Utilisation</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-3 font-medium text-gray-600">Person</th>
                  {filteredMonths.map((m) => (
                    <th key={m} className="text-right py-2 px-1 font-medium text-gray-600 whitespace-nowrap">{formatMonth(m)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeResources.map((r) => {
                  const results = filteredMonths.map((m) =>
                    calculatePersonUtilisation(r, filteredAllocations, assumptions, m)
                  )
                  return (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-3 font-medium text-gray-900 whitespace-nowrap">{r.displayName}</td>
                      {results.map((res) => (
                        <td key={res.month} className="text-right py-1 px-1">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${utilisationBgColor(res.utilisation)}`}>
                            {res.allocatedHours > 0 ? formatPercent(res.utilisation) : '—'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role utilisation table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Role Utilisation</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-3 font-medium text-gray-600">Role</th>
                  {filteredMonths.map((m) => (
                    <th key={m} className="text-right py-2 px-1 font-medium text-gray-600 whitespace-nowrap">{formatMonth(m)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_ROLES.map((role) => {
                  const results = filteredMonths.map((m) =>
                    calculateRoleUtilisation(role, activeResources, filteredAllocations, assumptions, m)
                  )
                  const hasActivity = results.some((r) => r.allocatedHours > 0 || r.capacityHours > 0)
                  if (!hasActivity) return null
                  return (
                    <tr key={role} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-3 font-medium text-gray-900 whitespace-nowrap">{ROLE_LABELS[role]}</td>
                      {results.map((res) => (
                        <td key={res.month} className="text-right py-1 px-1">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${utilisationBgColor(res.utilisation)}`}>
                            {res.capacityHours > 0 ? formatPercent(res.utilisation) : '—'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overload table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Overloads</h2>
          {personResults.filter((r) => r.overloadHours > 0).length === 0 ? (
            <p className="text-sm text-green-600">No overloads in selected period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Person</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Month</th>
                    <th className="text-right py-2 pr-3 font-medium text-gray-600">Capacity</th>
                    <th className="text-right py-2 pr-3 font-medium text-gray-600">Allocated</th>
                    <th className="text-right py-2 pr-3 font-medium text-gray-600">Overload</th>
                    <th className="text-right py-2 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {personResults
                    .filter((r) => r.overloadHours > 0)
                    .sort((a, b) => b.overloadHours - a.overloadHours)
                    .map((r) => {
                      const name = resources.find((res) => res.id === r.resourceId)?.displayName ?? r.resourceId
                      return (
                        <tr key={`${r.resourceId}-${r.month}`} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 pr-3 font-medium text-gray-900">{name}</td>
                          <td className="py-2 pr-3 text-gray-600">{formatMonth(r.month)}</td>
                          <td className="py-2 pr-3 text-right text-gray-600">{formatHours(r.capacityHours)}</td>
                          <td className="py-2 pr-3 text-right text-gray-900">{formatHours(r.allocatedHours)}</td>
                          <td className="py-2 pr-3 text-right font-medium text-red-600">{formatHours(r.overloadHours)}</td>
                          <td className="py-2 text-right">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${utilisationBgColor(r.utilisation)}`}>
                              {statusLabel(r.utilisation)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
