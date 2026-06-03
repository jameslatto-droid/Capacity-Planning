import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { StatCard } from '../../components/ui/StatCard'
import { Select } from '../../components/ui/Select'
import { formatHours, formatPercent, utilisationTextColor, utilisationGlow, statusLabel } from '../../utils/format'
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

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

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
  const filteredMonths = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth])

  const filteredProjects = useMemo(() =>
    projects.filter((p) => {
      if (brandFilter !== 'both' && p.frontendBrand !== brandFilter) return false
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      return true
    }), [projects, brandFilter, statusFilter])

  const filteredProjectIds = new Set(filteredProjects.map((p) => p.id))

  const filteredAllocations = useMemo(() =>
    allocations.filter((a) => {
      if (a.scenarioId !== scenarioId) return false
      if (!filteredProjectIds.has(a.projectId)) return false
      if (!filteredMonths.includes(a.month)) return false
      if (roleFilter !== 'all' && a.role !== roleFilter) return false
      if (resourceFilter !== 'all' && a.resourceId !== resourceFilter) return false
      return true
    }), [allocations, scenarioId, filteredProjectIds, filteredMonths, roleFilter, resourceFilter])

  const activeResources = useMemo(
    () => resources.filter((r) => r.active && (resourceFilter === 'all' || r.id === resourceFilter)),
    [resources, resourceFilter]
  )

  if (!assumptions) return <PageLayout title="Dashboard"><div className="text-slate-600">No scenario.</div></PageLayout>

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

  const personResults = activeResources.flatMap((r) =>
    filteredMonths.map((m) => calculatePersonUtilisation(r, filteredAllocations, assumptions, m))
  )

  const mostOverloadedPerson = personResults.reduce(
    (worst, r) => (r.utilisation > (worst?.utilisation ?? 0) ? r : worst),
    personResults[0]
  )

  const mostOverloadedPersonName =
    resources.find((r) => r.id === mostOverloadedPerson?.resourceId)?.displayName ?? '—'

  const roleResults = ALL_ROLES.flatMap((role) =>
    filteredMonths.map((m) =>
      calculateRoleUtilisation(role, activeResources, filteredAllocations, assumptions, m)
    )
  )

  const mostOverloadedRole = roleResults.reduce(
    (worst, r) => (r.utilisation > (worst?.utilisation ?? 0) ? r : worst),
    roleResults[0]
  )

  const scenarioOptions = scenarios.map((s) => ({ value: s.id, label: s.name }))
  const monthOptions = MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))
  const brandOptions = [{ value: 'both', label: 'Both brands' }, { value: 'DCT', label: 'DCT' }, { value: 'PLK', label: 'PLK' }]
  const roleOptions = [{ value: 'all', label: 'All roles' }, ...ALL_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))]
  const statusOptions = [{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'planned', label: 'Planned' }, { value: 'opportunity', label: 'Opportunity' }, { value: 'on-hold', label: 'On Hold' }]
  const resourceOptions = [{ value: 'all', label: 'All people' }, ...resources.filter((r) => r.active).map((r) => ({ value: r.id, label: r.displayName }))]

  return (
    <PageLayout title="Dashboard" subtitle={scenario?.name}>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-10">
        <Select label="Scenario" value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} options={scenarioOptions} />
        <Select label="From" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} options={monthOptions} />
        <Select label="To" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} options={monthOptions} />
        <Select label="Brand" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value as FrontendBrand | 'both')} options={brandOptions} />
        <Select label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as ResourceRole | 'all')} options={roleOptions} />
        <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} />
        <Select label="Person" value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)} options={resourceOptions} />
      </div>

      {/* KPIs — raw numbers, no cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 mb-12"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <StatCard label="Total Capacity" value={formatHours(totalCapacity)} sub={`${filteredMonths.length} months`} accent="violet" />
        <StatCard label="Total Demand" value={formatHours(totalDemand)} accent={totalDemand > totalCapacity ? 'red' : 'default'} />
        <StatCard label="Net Position" value={formatHours(totalCapacity - totalDemand)} accent={totalCapacity - totalDemand < 0 ? 'red' : 'emerald'} />
        <StatCard label="Utilisation" value={formatPercent(overallUtil)} accent={overallUtil > 1 ? 'red' : overallUtil > 0.85 ? 'amber' : 'emerald'} />
        <StatCard label="Overload Hours" value={formatHours(totalOverload)} accent={totalOverload > 0 ? 'red' : 'emerald'} sub={totalOverload > 0 ? 'action required' : 'on track'} />
        <StatCard label="Peak Risk Month" value={highestRiskMonth && highestRiskMonth.overloadHours > 0 ? formatMonth(highestRiskMonth.month) : '—'} sub={highestRiskMonth && highestRiskMonth.overloadHours > 0 ? `+${formatHours(highestRiskMonth.overloadHours)}` : 'no overloads'} accent={totalOverload > 0 ? 'amber' : 'default'} />
        <StatCard label="Most Overloaded Person" value={mostOverloadedPerson && mostOverloadedPerson.utilisation > 1 ? mostOverloadedPersonName : '—'} sub={mostOverloadedPerson && mostOverloadedPerson.utilisation > 1 ? formatPercent(mostOverloadedPerson.utilisation) : 'no overloads'} accent={mostOverloadedPerson && mostOverloadedPerson.utilisation > 1 ? 'red' : 'default'} />
        <StatCard label="Most Overloaded Role" value={mostOverloadedRole && mostOverloadedRole.utilisation > 1 ? ROLE_LABELS[mostOverloadedRole.role] : '—'} sub={mostOverloadedRole && mostOverloadedRole.utilisation > 1 ? formatPercent(mostOverloadedRole.utilisation) : 'no overloads'} accent={mostOverloadedRole && mostOverloadedRole.utilisation > 1 ? 'red' : 'default'} />
      </motion.div>

      {/* Chart — one of the few places we use a container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: '24px',
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Overview</div>
            <div className="text-sm font-semibold text-slate-300">Capacity vs Demand</div>
          </div>
          <div className="ml-auto flex items-center gap-5 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-dashed border-[#4c1d95]" /> Capacity</span>
            <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-[#7c3aed]" /> Demand</span>
            <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-red-600" /> Overload</span>
          </div>
        </div>
        <CapacityDemandChart data={teamByMonth} months={filteredMonths} />
      </motion.div>

      {/* Tables — raw, no boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Person utilisation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-4">Person Utilisation</div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th className="text-left py-2 font-medium text-slate-600 pb-3">Person</th>
                {filteredMonths.map((m) => (
                  <th key={m} className="text-right py-2 font-medium text-slate-600 pb-3 whitespace-nowrap px-1">{formatMonth(m)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeResources.map((r) => {
                const results = filteredMonths.map((m) =>
                  calculatePersonUtilisation(r, filteredAllocations, assumptions, m)
                )
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="py-2.5 text-slate-400 font-medium">{r.displayName}</td>
                    {results.map((res) => (
                      <td key={res.month} className="text-right py-2.5 px-1">
                        {res.allocatedHours > 0 ? (
                          <span
                            className={`tabular text-xs font-semibold ${utilisationTextColor(res.utilisation)}`}
                            style={{ textShadow: utilisationGlow(res.utilisation) }}
                          >
                            {formatPercent(res.utilisation)}
                          </span>
                        ) : (
                          <span className="text-slate-800">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>

        {/* Role utilisation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-4">Role Utilisation</div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th className="text-left py-2 font-medium text-slate-600 pb-3">Role</th>
                {filteredMonths.map((m) => (
                  <th key={m} className="text-right py-2 font-medium text-slate-600 pb-3 whitespace-nowrap px-1">{formatMonth(m)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_ROLES.map((role) => {
                const results = filteredMonths.map((m) =>
                  calculateRoleUtilisation(role, activeResources, filteredAllocations, assumptions, m)
                )
                if (!results.some((r) => r.allocatedHours > 0 || r.capacityHours > 0)) return null
                return (
                  <tr key={role} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className={`py-2.5 font-medium ${role === 'quality' ? 'text-violet-400' : 'text-slate-400'}`}>
                      {ROLE_LABELS[role]}
                    </td>
                    {results.map((res) => (
                      <td key={res.month} className="text-right py-2.5 px-1">
                        {res.capacityHours > 0 ? (
                          <span
                            className={`tabular text-xs font-semibold ${utilisationTextColor(res.utilisation)}`}
                            style={{ textShadow: utilisationGlow(res.utilisation) }}
                          >
                            {formatPercent(res.utilisation)}
                          </span>
                        ) : (
                          <span className="text-slate-800">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>

        {/* Overloads */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-4">Overloads</div>
          {personResults.filter((r) => r.overloadHours > 0).length === 0 ? (
            <p className="text-sm text-emerald-500/60">No overloads in selected period.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Person', 'Month', 'Capacity', 'Allocated', 'Overload', 'Status'].map((h, i) => (
                    <th key={h} className={`py-2 pb-3 font-medium text-slate-600 ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {personResults
                  .filter((r) => r.overloadHours > 0)
                  .sort((a, b) => b.overloadHours - a.overloadHours)
                  .map((r) => {
                    const name = resources.find((res) => res.id === r.resourceId)?.displayName ?? r.resourceId
                    return (
                      <tr key={`${r.resourceId}-${r.month}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td className="py-2.5 text-slate-300 font-medium">{name}</td>
                        <td className="py-2.5 text-right text-slate-500">{formatMonth(r.month)}</td>
                        <td className="py-2.5 text-right text-slate-600 tabular">{formatHours(r.capacityHours)}</td>
                        <td className="py-2.5 text-right text-slate-400 tabular">{formatHours(r.allocatedHours)}</td>
                        <td className="py-2.5 text-right font-bold tabular text-red-400" style={{ textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>
                          +{formatHours(r.overloadHours)}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`font-semibold ${utilisationTextColor(r.utilisation)}`}>
                            {statusLabel(r.utilisation)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </PageLayout>
  )
}
