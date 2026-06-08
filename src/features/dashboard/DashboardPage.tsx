import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { addMonths, currentMonth, generateMonthRange } from '../../utils/months'
import { useDateRange } from '../../utils/useDateRange'
import { usePageBackground } from '../../utils/usePageBackground'
import { calculateTeamUtilisation } from '../../domain/utilisation/utilisationCalculations'
import { CapacityDemandChart } from './CapacityDemandChart'
import { DisciplineCharts } from './DisciplineCharts'
import { PlanGantt } from './PlanGantt'
import { filterResourceCalculationAllocations } from '../../domain/projects/projectPlanning'
import type { FrontendBrand } from '../../types'

export function DashboardPage() {
  usePageBackground('1.png')
  const { resources, projects, allocations, scenarios, leaveEntries, activeScenarioId } = usePlannerStore()
  const { startMonth, endMonth, setStartMonth, setEndMonth, minMonth, maxMonth } = useDateRange()
  const [brandFilter, setBrandFilter] = useState<'DCT' | 'PLK' | 'both'>('both')

  const assumptions = scenarios.find((s) => s.id === activeScenarioId)?.assumptions
  const filteredMonths = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth])

  const filteredProjects = useMemo(
    () => projects.filter((p) => brandFilter === 'both' || p.frontendBrand === brandFilter),
    [projects, brandFilter],
  )
  const filteredProjectIds = useMemo(() => new Set(filteredProjects.map((p) => p.id)), [filteredProjects])

  const visibleAllocations = useMemo(
    () => allocations.filter(
      (a) => a.scenarioId === activeScenarioId && filteredProjectIds.has(a.projectId) && filteredMonths.includes(a.month),
    ),
    [allocations, activeScenarioId, filteredProjectIds, filteredMonths],
  )
  const portfolioAllocations = useMemo(
    () => allocations.filter((a) => a.scenarioId === activeScenarioId && filteredProjectIds.has(a.projectId)),
    [allocations, activeScenarioId, filteredProjectIds],
  )
  const calculationAllocations = useMemo(
    () => filterResourceCalculationAllocations(visibleAllocations, projects),
    [visibleAllocations, projects],
  )
  const portfolioRange = useMemo(() => {
    const portfolioProjects = filteredProjects.filter((p) => p.status !== 'cancelled')
    const timelineStart = addMonths(currentMonth(), -2)
    if (!portfolioProjects.length) return { startMonth: timelineStart, endMonth }
    return {
      startMonth: timelineStart,
      endMonth: portfolioProjects.reduce((max, p) => p.endMonth > max ? p.endMonth : max, portfolioProjects[0]!.endMonth),
    }
  }, [filteredProjects, endMonth])

  const activeResources = resources.filter((r) => r.active)

  if (!assumptions) return <PageLayout title="Dashboard"><div style={{ color: 'var(--text-muted)' }}>No data.</div></PageLayout>

  const teamByMonth = filteredMonths.map((m) =>
    calculateTeamUtilisation(activeResources, calculationAllocations, assumptions, m, leaveEntries),
  )

  const totalCapacity = teamByMonth.reduce((s, m) => s + m.capacityHours, 0)
  const totalDemand = teamByMonth.reduce((s, m) => s + m.allocatedHours, 0)
  const overallUtil = totalCapacity > 0 ? totalDemand / totalCapacity : 0

  const overallChartPanel = (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div style={{ height: 3, background: overallUtil > 1 ? '#ef4444' : overallUtil > 0.85 ? '#f59e0b' : '#10b981' }} />
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
          marginBottom: 6,
          padding: '10px 14px 0',
        }}
      >
        Overall Capacity
      </div>
      <div style={{ height: 100, padding: '0 14px 8px' }}>
        <CapacityDemandChart data={teamByMonth} months={filteredMonths} height={100} />
      </div>
    </div>
  )

  return (
    <PageLayout title="Dashboard">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Input label="From" type="month" value={startMonth} min={minMonth} max={maxMonth} onChange={(e) => setStartMonth(e.target.value)} className="w-36" />
        <Input label="To" type="month" value={endMonth} min={minMonth} max={maxMonth} onChange={(e) => setEndMonth(e.target.value)} className="w-36" />
        <Select label="Brand" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value as FrontendBrand | 'both')}
          options={[{ value: 'both', label: 'Both brands' }, { value: 'DCT', label: 'DCT' }, { value: 'PLK', label: 'PLK' }]} />
      </div>

      {/* Discipline charts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div
          style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10,
          }}
        >
          Charts
        </div>
        <DisciplineCharts
          resources={activeResources}
          allocations={calculationAllocations}
          leaveEntries={leaveEntries}
          assumptions={assumptions}
          months={filteredMonths}
          leadingPanel={overallChartPanel}
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
          allocations={portfolioAllocations}
          brandFilter={brandFilter}
          startMonth={portfolioRange.startMonth}
          endMonth={portfolioRange.endMonth}
        />
      </motion.div>
    </PageLayout>
  )
}
