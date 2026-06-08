import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { StatCard } from '../../components/ui/StatCard'
import { formatHours, formatPercent, formatFte, utilisationGlow } from '../../utils/format'
import { formatMonth, generateMonthRange } from '../../utils/months'
import { useDateRange } from '../../utils/useDateRange'
import { calculatePersonUtilisation } from '../../domain/utilisation/utilisationCalculations'
import { calculateMonthlyProductiveCapacity } from '../../domain/capacity/capacityCalculations'
import {
  findOverloadedPersonMonths,
  suggestSameRoleReallocations,
  calculateResidualOverload,
  calculateContractorFteRequirement,
} from '../../domain/optimisation/optimisationRules'
import { ROLE_LABELS } from '../../types'
import { filterResourceCalculationAllocations } from '../../domain/projects/projectPlanning'

const ROW = { borderBottom: '1px solid var(--row-divider)' }

function plainUtilisationColor(utilisation: number): string {
  if (utilisation > 1.15) return '#dc2626'
  if (utilisation > 1.0) return '#ea580c'
  return 'var(--text-muted)'
}

export function OptimisationPage() {
  const { resources, projects, allocations, scenarios, activeScenarioId, leaveEntries } = usePlannerStore()
  const { startMonth, endMonth, setStartMonth, setEndMonth, minMonth, maxMonth } = useDateRange()
  const [capacityLookAhead, setCapacityLookAhead] = useState<'4' | '6' | '12' | 'all'>('6')

  const assumptions = scenarios.find((s) => s.id === activeScenarioId)?.assumptions
  const filteredMonths = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth])
  const availableCapacityMonths = useMemo(
    () => capacityLookAhead === 'all' ? filteredMonths : filteredMonths.slice(0, Number(capacityLookAhead)),
    [capacityLookAhead, filteredMonths]
  )

  const visibleAllocations = useMemo(
    () => allocations.filter((a) => a.scenarioId === activeScenarioId && filteredMonths.includes(a.month)),
    [allocations, activeScenarioId, filteredMonths]
  )
  const scenarioAllocations = useMemo(
    () => filterResourceCalculationAllocations(visibleAllocations, projects),
    [visibleAllocations, projects]
  )
  const activeResources = resources.filter((r) => r.active)

  const allPersonResults = useMemo(() => {
    if (!assumptions) return []
    return activeResources.flatMap((r) =>
      filteredMonths.map((m) => calculatePersonUtilisation(r, scenarioAllocations, assumptions, m, leaveEntries))
    )
  }, [activeResources, scenarioAllocations, assumptions, filteredMonths])

  const overloads = useMemo(() => findOverloadedPersonMonths(allPersonResults), [allPersonResults])
  const recommendations = useMemo(
    () => suggestSameRoleReallocations(overloads, activeResources, allPersonResults, scenarioAllocations),
    [overloads, activeResources, allPersonResults, scenarioAllocations]
  )
  const residualOverload = useMemo(() => calculateResidualOverload(overloads, recommendations), [overloads, recommendations])

  const monthlyFteCapacity = assumptions
    ? calculateMonthlyProductiveCapacity({ id: '', displayName: '', role: 'other', employmentType: 'employee', contractHoursPerWeek: 40, workingDaysPerWeek: 5, fullTimeHoursPerWeek: 40, active: true }, assumptions)
    : 133

  const contractorReqs = useMemo(
    () => calculateContractorFteRequirement(residualOverload, monthlyFteCapacity),
    [residualOverload, monthlyFteCapacity]
  )

  if (!assumptions) return <PageLayout title="Optimisation"><p style={{ color: 'var(--text-faint)' }}>No data.</p></PageLayout>

  return (
    <PageLayout title="Optimisation" subtitle="Recommendations only — no changes are made automatically">
      <div className="flex flex-wrap gap-4 mb-10">
        <Input label="From" type="month" value={startMonth} min={minMonth} max={maxMonth} onChange={(e) => setStartMonth(e.target.value)} className="w-36" />
        <Input label="To" type="month" value={endMonth} min={minMonth} max={maxMonth} onChange={(e) => setEndMonth(e.target.value)} className="w-36" />
        <Select
          label="Capacity look-ahead"
          value={capacityLookAhead}
          onChange={(e) => setCapacityLookAhead(e.target.value as typeof capacityLookAhead)}
          options={[
            { value: '4', label: '4 months' },
            { value: '6', label: '6 months' },
            { value: '12', label: '12 months' },
            { value: 'all', label: 'All selected' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 mb-12">
        <StatCard label="Person overloads" value={String(overloads.length)} accent={overloads.length > 0 ? 'red' : 'emerald'} />
        <StatCard label="Total overload" value={formatHours(overloads.reduce((s, o) => s + o.overloadHours, 0))} accent={overloads.length > 0 ? 'red' : 'emerald'} />
        <StatCard label="Residual after recs" value={formatHours(residualOverload)} accent={residualOverload > 0 ? 'amber' : 'emerald'} />
        <StatCard label="Contractor FTE" value={contractorReqs[0] ? formatFte(contractorReqs[0].contractorFte) : '0.00'} accent={residualOverload > 0 ? 'amber' : 'default'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Overloads */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="text-[10px] uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>Person-Month Overloads</div>
          {overloads.length === 0 ? (
            <p className="text-sm text-emerald-500/60">No overloads detected.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Person', 'Month', 'Overload', 'Util'].map((h, i) => (
                    <th key={h} className={`pb-3 text-[10px] uppercase tracking-wider font-semibold ${i === 0 ? 'text-left' : 'text-right'}`} style={{ color: 'var(--text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overloads.map((o) => {
                  const name = resources.find((r) => r.id === o.resourceId)?.displayName ?? o.resourceId
                  return (
                    <tr key={`${o.resourceId}-${o.month}`} style={ROW}>
                      <td className="py-2.5 font-medium" style={{ color: 'var(--text)' }}>{name}</td>
                      <td className="py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>{formatMonth(o.month)}</td>
                      <td className="py-2.5 text-right font-bold tabular text-red-400" style={{ textShadow: utilisationGlow(o.utilisation) }}>+{formatHours(o.overloadHours)}</td>
                      <td className="py-2.5 text-right font-semibold tabular" style={{ color: plainUtilisationColor(o.utilisation) }}>{formatPercent(o.utilisation)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Recommendations */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="text-[10px] uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>Reallocation Recommendations</div>
          {recommendations.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{overloads.length === 0 ? 'No overloads to resolve.' : 'No compatible spare capacity found.'}</p>
          ) : (
            <div className="space-y-2">
              {recommendations.map((r, i) => (
                <div key={i} className="rounded-xl px-4 py-3 text-xs"
                  style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <div className="font-semibold text-violet-300 mb-0.5 capitalize">{r.type.replace(/-/g, ' ')}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{r.description}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Available capacity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="lg:col-span-2">
          <div className="text-[10px] uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>Available Capacity</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left pb-3 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-faint)' }}>Person</th>
                  <th className="text-left pb-3 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-faint)' }}>Role</th>
                  {availableCapacityMonths.map((m) => (
                    <th key={m} className="text-right pb-3 text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap px-2" style={{ color: 'var(--text-faint)' }}>{formatMonth(m)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeResources.map((r) => {
                  const monthData = availableCapacityMonths.map((m) => {
                    const result = allPersonResults.find((pr) => pr.resourceId === r.id && pr.month === m)
                    return { month: m, available: Math.max(0, (result?.capacityHours ?? 0) - (result?.allocatedHours ?? 0)) }
                  })
                  if (!monthData.some((d) => d.available > 0)) return null
                  return (
                    <tr key={r.id} style={ROW}>
                      <td className="py-2.5 font-medium whitespace-nowrap pr-4" style={{ color: 'var(--text-muted)' }}>{r.displayName}</td>
                      <td className="py-2.5 whitespace-nowrap pr-4" style={{ color: 'var(--text-faint)' }}>{ROLE_LABELS[r.role]}</td>
                      {monthData.map((d) => (
                        <td key={d.month} className="py-2.5 text-right tabular text-emerald-400/70 font-medium px-2">
                          {d.available > 0 ? formatHours(d.available) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Contractor */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="text-[10px] uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>Contractor Requirement</div>
          {contractorReqs.length === 0 ? (
            <p className="text-sm text-emerald-500/60">No contractor capacity required.</p>
          ) : (
            contractorReqs.map((req) => (
              <div key={req.month} className="rounded-xl px-4 py-4 text-sm"
                style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Residual after recommendations</div>
                <div className="text-2xl font-bold tabular text-amber-400">{formatFte(req.contractorFte)} FTE</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{formatHours(req.residualOverloadHours)} / month</div>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </PageLayout>
  )
}
