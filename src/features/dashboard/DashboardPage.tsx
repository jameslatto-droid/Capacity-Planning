import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { StatCard } from '../../components/ui/StatCard'
import { Select } from '../../components/ui/Select'
import { formatHours, formatPercent, utilisationTextColor, utilisationGlow } from '../../utils/format'
import { formatMonth, generateMonthRange } from '../../utils/months'
import { calculatePersonUtilisation, calculateTeamUtilisation } from '../../domain/utilisation/utilisationCalculations'
import { CapacityDemandChart } from './CapacityDemandChart'
import { PlanGantt } from './PlanGantt'
import type { FrontendBrand } from '../../types'

const MONTHS = generateMonthRange('2026-01', '2026-12')

export function DashboardPage() {
  const { resources, projects, allocations, scenarios, activeScenarioId } = usePlannerStore()

  const [scenarioId, setScenarioId] = useState(activeScenarioId)
  const [startMonth, setStartMonth] = useState('2026-06')
  const [endMonth, setEndMonth] = useState('2026-12')
  const [brandFilter, setBrandFilter] = useState<'DCT' | 'PLK' | 'both'>('both')
  const [chartTab, setChartTab] = useState<'capacity' | 'portfolio'>('capacity')

  const scenario = scenarios.find((s) => s.id === scenarioId)
  const assumptions = scenario?.assumptions
  const filteredMonths = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth])

  const filteredProjects = useMemo(
    () => projects.filter((p) => brandFilter === 'both' || p.frontendBrand === brandFilter),
    [projects, brandFilter]
  )
  const filteredProjectIds = new Set(filteredProjects.map((p) => p.id))

  const filteredAllocations = useMemo(
    () => allocations.filter(
      (a) => a.scenarioId === scenarioId && filteredProjectIds.has(a.projectId) && filteredMonths.includes(a.month)
    ),
    [allocations, scenarioId, filteredProjectIds, filteredMonths]
  )

  const activeResources = resources.filter((r) => r.active)

  if (!assumptions) return <PageLayout title="Dashboard"><div style={{ color: 'var(--text-muted)' }}>No scenario.</div></PageLayout>

  const teamByMonth = filteredMonths.map((m) =>
    calculateTeamUtilisation(activeResources, filteredAllocations, assumptions, m)
  )

  const totalCapacity = teamByMonth.reduce((s, m) => s + m.capacityHours, 0)
  const totalDemand = teamByMonth.reduce((s, m) => s + m.allocatedHours, 0)
  const totalOverload = teamByMonth.reduce((s, m) => s + m.overloadHours, 0)
  const overallUtil = totalCapacity > 0 ? totalDemand / totalCapacity : 0

  const highestRiskMonth = [...teamByMonth].sort((a, b) => b.overloadHours - a.overloadHours)[0]

  const personResults = activeResources.flatMap((r) =>
    filteredMonths.map((m) => ({
      resource: r,
      result: calculatePersonUtilisation(r, filteredAllocations, assumptions, m),
    }))
  )
  const overloads = personResults
    .filter(({ result }) => result.overloadHours > 0)
    .sort((a, b) => b.result.overloadHours - a.result.overloadHours)

  return (
    <PageLayout title="Dashboard" subtitle={scenario?.name}>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-10">
        <Select label="Scenario" value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}
          options={scenarios.map((s) => ({ value: s.id, label: s.name }))} />
        <Select label="From" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}
          options={MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))} />
        <Select label="To" value={endMonth} onChange={(e) => setEndMonth(e.target.value)}
          options={MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))} />
        <Select label="Brand" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value as FrontendBrand | 'both')}
          options={[{ value: 'both', label: 'Both brands' }, { value: 'DCT', label: 'DCT' }, { value: 'PLK', label: 'PLK' }]} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 mb-12">
        <StatCard label="Capacity" value={formatHours(totalCapacity)} sub={`${filteredMonths.length} months`} accent="violet" />
        <StatCard label="Demand" value={formatHours(totalDemand)} accent={totalDemand > totalCapacity ? 'red' : 'default'} />
        <StatCard label="Net" value={formatHours(totalCapacity - totalDemand)}
          accent={totalCapacity - totalDemand < 0 ? 'red' : 'emerald'}
          sub={totalCapacity - totalDemand < 0 ? 'over capacity' : 'headroom'} />
        <StatCard label="Utilisation" value={formatPercent(overallUtil)}
          accent={overallUtil > 1 ? 'red' : overallUtil > 0.85 ? 'amber' : 'emerald'} />
      </div>

      {/* Chart block — tabbed */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl p-6 mb-10"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Tab row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1">
            {([['capacity', 'Capacity & Demand'], ['portfolio', 'Portfolio']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setChartTab(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: chartTab === key ? 'var(--accent-light)' : 'transparent',
                  color: chartTab === key ? 'var(--accent-text)' : 'var(--text-muted)',
                  border: chartTab === key ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {chartTab === 'capacity' && (
            <div className="flex items-center gap-5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t-2 border-dashed border-violet-500/40" /> Capacity</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t-2 border-violet-500" /> Demand</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t-2 border-red-500" /> Overload</span>
            </div>
          )}
        </div>

        {chartTab === 'capacity' && (
          <CapacityDemandChart data={teamByMonth} months={filteredMonths} />
        )}

        {chartTab === 'portfolio' && (
          <PlanGantt
            projects={projects}
            allocations={allocations}
            brandFilter={brandFilter}
            startMonth={startMonth}
            endMonth={endMonth}
          />
        )}
      </motion.div>

      {/* Overloads — only shown when they exist */}
      {overloads.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <div className="text-[10px] uppercase tracking-widest font-semibold mb-4"
            style={{ color: 'var(--text-faint)' }}>
            Overloads · {formatHours(totalOverload)} total
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Person', 'Month', 'Capacity', 'Allocated', 'Overload', 'Util'].map((h, i) => (
                  <th key={h} className={`pb-3 text-[10px] uppercase tracking-widest font-semibold ${i === 0 ? 'text-left' : 'text-right'}`}
                    style={{ color: 'var(--text-faint)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overloads.slice(0, 8).map(({ resource, result }) => (
                <tr key={`${resource.id}-${result.month}`}
                  style={{ borderBottom: '1px solid var(--row-divider)' }}>
                  <td className="py-2.5 font-medium" style={{ color: 'var(--text)' }}>{resource.displayName}</td>
                  <td className="py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>{formatMonth(result.month)}</td>
                  <td className="py-2.5 text-right tabular" style={{ color: 'var(--text-muted)' }}>{formatHours(result.capacityHours)}</td>
                  <td className="py-2.5 text-right tabular" style={{ color: 'var(--text)' }}>{formatHours(result.allocatedHours)}</td>
                  <td className="py-2.5 text-right tabular font-bold text-red-500"
                    style={{ textShadow: utilisationGlow(result.utilisation) }}>
                    +{formatHours(result.overloadHours)}
                  </td>
                  <td className={`py-2.5 text-right tabular font-semibold ${utilisationTextColor(result.utilisation)}`}>
                    {formatPercent(result.utilisation)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {overloads.length > 8 && (
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              +{overloads.length - 8} more — see Reports for full detail.
            </p>
          )}
        </motion.div>
      )}

      {overloads.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            ✓ No overloads in selected period.
            {highestRiskMonth && highestRiskMonth.overloadHours === 0 && (
              <span> Peak utilisation: {formatPercent(Math.max(...teamByMonth.map((m) => m.utilisation)))}</span>
            )}
          </div>
        </motion.div>
      )}
    </PageLayout>
  )
}
