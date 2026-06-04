import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Select } from '../../components/ui/Select'
import { formatHours, formatPercent } from '../../utils/format'
import { formatMonth, generateMonthRange } from '../../utils/months'
import { calculatePersonUtilisation, calculateTeamUtilisation } from '../../domain/utilisation/utilisationCalculations'
import { DisciplineCharts } from './DisciplineCharts'
import { PlanGantt } from './PlanGantt'
import type { FrontendBrand } from '../../types'

const MONTHS = generateMonthRange('2026-01', '2026-12')

export function DashboardPage() {
  const { resources, projects, allocations, scenarios, leaveEntries, activeScenarioId } = usePlannerStore()

  const [startMonth, setStartMonth] = useState('2026-06')
  const [endMonth, setEndMonth] = useState('2026-12')
  const [brandFilter, setBrandFilter] = useState<'DCT' | 'PLK' | 'both'>('both')

  const assumptions = scenarios.find((s) => s.id === activeScenarioId)?.assumptions
  const filteredMonths = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth])

  const filteredProjects = useMemo(
    () => projects.filter((p) => brandFilter === 'both' || p.frontendBrand === brandFilter),
    [projects, brandFilter],
  )
  const filteredProjectIds = new Set(filteredProjects.map((p) => p.id))

  const filteredAllocations = useMemo(
    () => allocations.filter(
      (a) => a.scenarioId === activeScenarioId && filteredProjectIds.has(a.projectId) && filteredMonths.includes(a.month),
    ),
    [allocations, activeScenarioId, filteredProjectIds, filteredMonths],
  )

  const activeResources = resources.filter((r) => r.active)

  if (!assumptions) return <PageLayout title="Dashboard"><div style={{ color: 'var(--text-muted)' }}>No data.</div></PageLayout>

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

  // Trend: first half vs second half of selected period
  const trendArrow = (() => {
    if (teamByMonth.length < 2) return null
    const mid = Math.floor(teamByMonth.length / 2)
    const a = teamByMonth.slice(0, mid).reduce((s, m) => s + m.utilisation, 0) / mid
    const b = teamByMonth.slice(mid).reduce((s, m) => s + m.utilisation, 0) / (teamByMonth.length - mid)
    const delta = b - a
    if (Math.abs(delta) < 0.03) return null
    return delta > 0
      ? { symbol: '↑', color: '#f59e0b', title: 'Utilisation rising across period' }
      : { symbol: '↓', color: '#10b981', title: 'Utilisation easing across period' }
  })()

  const kpis = [
    {
      value: formatPercent(overallUtil),
      label: 'utilised',
      color: overallUtil > 1 ? '#ef4444' : overallUtil > 0.85 ? '#f59e0b' : '#10b981',
      trend: trendArrow,
    },
    {
      value: formatHours(Math.abs(netHours)),
      label: netHours >= 0 ? 'headroom' : 'overrun',
      color: netHours >= 0 ? '#10b981' : '#ef4444',
      trend: null,
    },
    {
      value: String(overloadCount),
      label: `overload${overloadCount !== 1 ? 's' : ''}`,
      color: overloadCount > 0 ? '#ef4444' : '#10b981',
      trend: null,
    },
    {
      value: String(filteredProjects.length),
      label: 'projects',
      color: 'var(--text)',
      trend: null,
    },
  ]

  return (
    <PageLayout title="Dashboard">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
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
        {kpis.map(({ value, label, color, trend }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="font-bold tabular-nums" style={{ fontSize: 20, lineHeight: 1, color }}>
              {value}
            </span>
            {trend && (
              <span title={trend.title} style={{ fontSize: 13, color: trend.color, lineHeight: 1, fontWeight: 600 }}>
                {trend.symbol}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Discipline charts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <DisciplineCharts
          resources={activeResources}
          allocations={filteredAllocations}
          leaveEntries={leaveEntries}
          assumptions={assumptions}
          months={filteredMonths}
        />
      </motion.div>

      {/* Portfolio */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10,
          }}
        >
          Portfolio
        </div>
        <PlanGantt
          projects={projects}
          allocations={filteredAllocations}
          brandFilter={brandFilter}
          startMonth={startMonth}
          endMonth={endMonth}
        />
      </motion.div>
    </PageLayout>
  )
}
