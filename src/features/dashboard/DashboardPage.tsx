import { useMemo, useState } from 'react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Select } from '../../components/ui/Select'
import { formatHours, formatPercent } from '../../utils/format'
import { formatMonth, generateMonthRange } from '../../utils/months'
import { calculatePersonUtilisation, calculateTeamUtilisation } from '../../domain/utilisation/utilisationCalculations'
import { UnifiedTimeline } from './UnifiedTimeline'
import type { FrontendBrand } from '../../types'

const MONTHS = generateMonthRange('2026-01', '2026-12')

export function DashboardPage() {
  const { resources, projects, allocations, scenarios, leaveEntries, activeScenarioId } = usePlannerStore()

  const [scenarioId, setScenarioId] = useState(activeScenarioId)
  const [startMonth, setStartMonth] = useState('2026-06')
  const [endMonth, setEndMonth] = useState('2026-12')
  const [brandFilter, setBrandFilter] = useState<'DCT' | 'PLK' | 'both'>('both')

  const scenario = scenarios.find((s) => s.id === scenarioId)
  const assumptions = scenario?.assumptions
  const filteredMonths = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth])

  const filteredProjects = useMemo(
    () => projects.filter((p) => brandFilter === 'both' || p.frontendBrand === brandFilter),
    [projects, brandFilter],
  )
  const filteredProjectIds = new Set(filteredProjects.map((p) => p.id))

  const filteredAllocations = useMemo(
    () => allocations.filter(
      (a) => a.scenarioId === scenarioId && filteredProjectIds.has(a.projectId) && filteredMonths.includes(a.month),
    ),
    [allocations, scenarioId, filteredProjectIds, filteredMonths],
  )

  const activeResources = resources.filter((r) => r.active)

  if (!assumptions) return <PageLayout title="Dashboard"><div style={{ color: 'var(--text-muted)' }}>No scenario.</div></PageLayout>

  const teamByMonth = filteredMonths.map((m) =>
    calculateTeamUtilisation(activeResources, filteredAllocations, assumptions, m, leaveEntries),
  )

  const totalCapacity = teamByMonth.reduce((s, m) => s + m.capacityHours, 0)
  const totalDemand = teamByMonth.reduce((s, m) => s + m.allocatedHours, 0)
  const overallUtil = totalCapacity > 0 ? totalDemand / totalCapacity : 0
  const netHours = totalCapacity - totalDemand

  const overloadCount = activeResources.flatMap((r) =>
    filteredMonths.map((m) => calculatePersonUtilisation(r, filteredAllocations, assumptions, m, leaveEntries)),
  ).filter((result) => result.overloadHours > 0).length

  const kpis = [
    {
      value: formatPercent(overallUtil),
      label: 'utilised',
      color: overallUtil > 1 ? '#ef4444' : overallUtil > 0.85 ? '#f59e0b' : '#10b981',
    },
    {
      value: formatHours(Math.abs(netHours)),
      label: netHours >= 0 ? 'headroom' : 'overrun',
      color: netHours >= 0 ? '#10b981' : '#ef4444',
    },
    {
      value: String(overloadCount),
      label: `overload${overloadCount !== 1 ? 's' : ''}`,
      color: overloadCount > 0 ? '#ef4444' : '#10b981',
    },
    {
      value: String(filteredProjects.length),
      label: 'projects',
      color: 'var(--text)',
    },
  ]

  return (
    <PageLayout title="Dashboard" subtitle={scenario?.name}>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select label="Scenario" value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}
          options={scenarios.map((s) => ({ value: s.id, label: s.name }))} />
        <Select label="From" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}
          options={MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))} />
        <Select label="To" value={endMonth} onChange={(e) => setEndMonth(e.target.value)}
          options={MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))} />
        <Select label="Brand" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value as FrontendBrand | 'both')}
          options={[{ value: 'both', label: 'Both brands' }, { value: 'DCT', label: 'DCT' }, { value: 'PLK', label: 'PLK' }]} />
      </div>

      {/* KPI strip */}
      <div
        className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-6 pb-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {kpis.map(({ value, label, color }) => (
          <div key={label} className="flex items-baseline gap-1.5">
            <span
              className="font-bold tabular-nums"
              style={{ fontSize: 20, lineHeight: 1, color }}
            >
              {value}
            </span>
            <span
              style={{
                fontSize: 10, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Unified timeline */}
      <UnifiedTimeline
        resources={activeResources}
        projects={filteredProjects}
        allocations={filteredAllocations}
        assumptions={assumptions}
        months={filteredMonths}
        leaveEntries={leaveEntries}
        startMonth={startMonth}
        endMonth={endMonth}
      />
    </PageLayout>
  )
}
