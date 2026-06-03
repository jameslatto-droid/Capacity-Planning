import { useMemo, useState } from 'react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { formatHours, formatPercent, utilisationBgColor } from '../../utils/format'
import { formatMonth, generateMonthRange } from '../../utils/months'
import { calculatePersonUtilisation, calculateRoleUtilisation } from '../../domain/utilisation/utilisationCalculations'
import { exportCsv, exportJson } from '../../utils/export'
import { ROLE_LABELS, ALL_ROLES } from '../../types'

const MONTHS = generateMonthRange('2025-01', '2025-12')

export function ReportsPage() {
  const { resources, projects, allocations, scenarios, activeScenarioId } = usePlannerStore()
  const [scenarioId, setScenarioId] = useState(activeScenarioId)
  const [startMonth, setStartMonth] = useState('2025-04')
  const [endMonth, setEndMonth] = useState('2025-09')
  const [brandFilter, setBrandFilter] = useState<'DCT' | 'PLK' | 'both'>('both')
  const [activeReport, setActiveReport] = useState<'person' | 'role' | 'brand' | 'project' | 'overload'>('person')

  const scenario = scenarios.find((s) => s.id === scenarioId)
  const assumptions = scenario?.assumptions

  const filteredMonths = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth])
  const filteredAllocations = useMemo(
    () => allocations.filter((a) => {
      if (a.scenarioId !== scenarioId) return false
      if (!filteredMonths.includes(a.month)) return false
      if (brandFilter !== 'both') {
        const proj = projects.find((p) => p.id === a.projectId)
        if (proj?.frontendBrand !== brandFilter) return false
      }
      return true
    }),
    [allocations, scenarioId, filteredMonths, brandFilter, projects]
  )

  const activeResources = resources.filter((r) => r.active)

  const personResults = useMemo(() => {
    if (!assumptions) return []
    return activeResources.flatMap((r) =>
      filteredMonths.map((m) => ({
        resource: r,
        result: calculatePersonUtilisation(r, filteredAllocations, assumptions, m),
      }))
    )
  }, [activeResources, filteredAllocations, assumptions, filteredMonths])

  const roleResults = useMemo(() => {
    if (!assumptions) return []
    return ALL_ROLES.flatMap((role) =>
      filteredMonths.map((m) => ({
        role,
        result: calculateRoleUtilisation(role, activeResources, filteredAllocations, assumptions, m),
      }))
    )
  }, [activeResources, filteredAllocations, assumptions, filteredMonths])

  function exportPersonCsv() {
    const rows = personResults.map(({ resource, result }) => ({
      Person: resource.displayName,
      Month: result.month,
      Capacity: Math.round(result.capacityHours),
      Allocated: Math.round(result.allocatedHours),
      Utilisation: formatPercent(result.utilisation),
      Overload: Math.round(result.overloadHours),
      Status: result.status,
    }))
    exportCsv('person-utilisation.csv', rows)
  }

  function exportRoleCsv() {
    const rows = roleResults
      .filter((r) => r.result.capacityHours > 0)
      .map(({ role, result }) => ({
        Role: ROLE_LABELS[role],
        Month: result.month,
        Capacity: Math.round(result.capacityHours),
        Allocated: Math.round(result.allocatedHours),
        Utilisation: formatPercent(result.utilisation),
        Overload: Math.round(result.overloadHours),
        Status: result.status,
      }))
    exportCsv('role-utilisation.csv', rows)
  }

  function exportFullJson() {
    exportJson('erp-export.json', { resources, projects, allocations, scenarios })
  }

  const scenarioOptions = scenarios.map((s) => ({ value: s.id, label: s.name }))
  const monthOptions = MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))
  const brandOptions = [{ value: 'both', label: 'Both' }, { value: 'DCT', label: 'DCT' }, { value: 'PLK', label: 'PLK' }]
  const reportTabs: { key: typeof activeReport; label: string }[] = [
    { key: 'person', label: 'Person Utilisation' },
    { key: 'role', label: 'Role Utilisation' },
    { key: 'brand', label: 'Brand Demand' },
    { key: 'project', label: 'Project Demand' },
    { key: 'overload', label: 'Overload Report' },
  ]

  if (!assumptions) return <PageLayout title="Reports"><p className="text-gray-500">No scenario.</p></PageLayout>

  return (
    <PageLayout
      title="Reports"
      actions={
        <div className="flex gap-2">
          <Button size="sm" onClick={exportPersonCsv}>Person CSV</Button>
          <Button size="sm" onClick={exportRoleCsv}>Role CSV</Button>
          <Button size="sm" variant="primary" onClick={exportFullJson}>Export JSON</Button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <Select label="Scenario" value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} options={scenarioOptions} />
        <Select label="From" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} options={monthOptions} />
        <Select label="To" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} options={monthOptions} />
        <Select label="Brand" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value as typeof brandFilter)} options={brandOptions} />
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {reportTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveReport(t.key)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeReport === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeReport === 'person' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="text-sm w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Person</th>
                {filteredMonths.map((m) => (
                  <th key={m} className="text-right px-3 py-3 font-medium text-gray-600 whitespace-nowrap">{formatMonth(m)}</th>
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
                    <td className="px-4 py-2 font-medium text-gray-900">{r.displayName}</td>
                    {results.map((res) => (
                      <td key={res.month} className="px-3 py-2 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${res.allocatedHours > 0 ? utilisationBgColor(res.utilisation) : 'text-gray-400'}`}>
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
      )}

      {activeReport === 'role' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="text-sm w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                {filteredMonths.map((m) => (
                  <th key={m} className="text-right px-3 py-3 font-medium text-gray-600 whitespace-nowrap">{formatMonth(m)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_ROLES.map((role) => {
                const results = filteredMonths.map((m) =>
                  calculateRoleUtilisation(role, activeResources, filteredAllocations, assumptions, m)
                )
                if (!results.some((r) => r.capacityHours > 0)) return null
                return (
                  <tr key={role} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className={`px-4 py-2 font-medium ${role === 'quality' ? 'text-purple-800' : 'text-gray-900'}`}>
                      {ROLE_LABELS[role]}{role === 'quality' && ' ★'}
                    </td>
                    {results.map((res) => (
                      <td key={res.month} className="px-3 py-2 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${res.capacityHours > 0 ? utilisationBgColor(res.utilisation) : 'text-gray-400'}`}>
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
      )}

      {activeReport === 'brand' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="text-sm w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
                {filteredMonths.map((m) => (
                  <th key={m} className="text-right px-3 py-3 font-medium text-gray-600 whitespace-nowrap">{formatMonth(m)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['DCT', 'PLK'] as const).map((brand) => {
                const brandProjects = new Set(projects.filter((p) => p.frontendBrand === brand).map((p) => p.id))
                return (
                  <tr key={brand} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${brand === 'DCT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{brand}</span>
                    </td>
                    {filteredMonths.map((m) => {
                      const hrs = filteredAllocations
                        .filter((a) => a.month === m && brandProjects.has(a.projectId))
                        .reduce((s, a) => s + a.hours, 0)
                      return <td key={m} className="px-3 py-2 text-right font-medium text-gray-900 text-xs">{hrs > 0 ? formatHours(hrs) : '—'}</td>
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeReport === 'project' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="text-sm w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Project</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600">Brand</th>
                {filteredMonths.map((m) => (
                  <th key={m} className="text-right px-3 py-3 font-medium text-gray-600 whitespace-nowrap">{formatMonth(m)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects
                .filter((p) => brandFilter === 'both' || p.frontendBrand === brandFilter)
                .map((p) => {
                  const projAllocs = filteredAllocations.filter((a) => a.projectId === p.id)
                  if (projAllocs.length === 0) return null
                  return (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{p.code} — {p.name}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${p.frontendBrand === 'DCT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{p.frontendBrand}</span>
                      </td>
                      {filteredMonths.map((m) => {
                        const hrs = projAllocs.filter((a) => a.month === m).reduce((s, a) => s + a.hours, 0)
                        return <td key={m} className="px-3 py-2 text-right text-xs text-gray-700">{hrs > 0 ? formatHours(hrs) : '—'}</td>
                      })}
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      {activeReport === 'overload' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">All Overloads</h2>
          {personResults.filter(({ result }) => result.overloadHours > 0).length === 0 ? (
            <p className="text-sm text-green-600">No overloads in selected period and filters.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">Person</th>
                  <th className="text-left py-2 font-medium text-gray-600">Month</th>
                  <th className="text-right py-2 font-medium text-gray-600">Capacity</th>
                  <th className="text-right py-2 font-medium text-gray-600">Allocated</th>
                  <th className="text-right py-2 font-medium text-gray-600">Overload</th>
                  <th className="text-right py-2 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {personResults
                  .filter(({ result }) => result.overloadHours > 0)
                  .sort((a, b) => b.result.overloadHours - a.result.overloadHours)
                  .map(({ resource, result }) => (
                    <tr key={`${resource.id}-${result.month}`} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{resource.displayName}</td>
                      <td className="py-2 text-gray-600">{formatMonth(result.month)}</td>
                      <td className="py-2 text-right text-gray-600">{formatHours(result.capacityHours)}</td>
                      <td className="py-2 text-right text-gray-900">{formatHours(result.allocatedHours)}</td>
                      <td className="py-2 text-right font-medium text-red-600">{formatHours(result.overloadHours)}</td>
                      <td className="py-2 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${utilisationBgColor(result.utilisation)}`}>
                          {result.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </PageLayout>
  )
}
