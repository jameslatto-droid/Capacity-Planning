import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { formatHours, formatPercent } from '../../utils/format'
import { formatMonth, generateMonthRange } from '../../utils/months'
import { calculatePersonUtilisation, calculateRoleUtilisation } from '../../domain/utilisation/utilisationCalculations'
import { exportCsv, exportJson } from '../../utils/export'
import { ROLE_LABELS, ALL_ROLES } from '../../types'
import { UtilisationHeatmap } from './UtilisationHeatmap'

const MONTHS = generateMonthRange('2026-01', '2026-12')

type Tab = 'person' | 'role' | 'brand' | 'project' | 'overload'

// Shared dark tooltip
function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
      <div className="mb-2" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          <span className="font-semibold tabular ml-auto pl-4" style={{ color: 'var(--text)' }}>{p.value}h</span>
        </div>
      ))}
    </div>
  )
}

// Colour palette for stacked charts
const PERSON_COLORS = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626','#9333ea','#0284c7','#65a30d','#b45309']
const ROLE_COLORS: Record<string, string> = {
  'project-management': '#7c3aed',
  'process-engineering': '#2563eb',
  'mechanical-engineering': '#0891b2',
  'drafting': '#059669',
  'procurement': '#d97706',
  'quality': '#a855f7',
  'technical-review': '#64748b',
  'management': '#374151',
  'other': '#1e293b',
}

export function ReportsPage() {
  const { resources, projects, allocations, scenarios, activeScenarioId, leaveEntries } = usePlannerStore()
  const [startMonth, setStartMonth] = useState('2026-06')
  const [endMonth, setEndMonth] = useState('2026-12')
  const [brandFilter, setBrandFilter] = useState<'DCT' | 'PLK' | 'both'>('both')
  const [activeTab, setActiveTab] = useState<Tab>('person')
  const [displayMode, setDisplayMode] = useState<'percent' | 'hours'>('percent')

  const assumptions = scenarios.find((s) => s.id === activeScenarioId)?.assumptions
  const filteredMonths = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth])

  const filteredAllocations = useMemo(() =>
    allocations.filter((a) => {
      if (a.scenarioId !== activeScenarioId) return false
      if (!filteredMonths.includes(a.month)) return false
      if (brandFilter !== 'both') {
        const proj = projects.find((p) => p.id === a.projectId)
        if (proj?.frontendBrand !== brandFilter) return false
      }
      return true
    }), [allocations, activeScenarioId, filteredMonths, brandFilter, projects])

  const activeResources = resources.filter((r) => r.active)

  // ── Person heatmap rows ──────────────────────────────────────────────
  const personHeatmapRows = useMemo(() => {
    if (!assumptions) return []
    return activeResources.map((r) => ({
      id: r.id,
      label: r.displayName,
      values: filteredMonths.map((m) => {
        const res = calculatePersonUtilisation(r, filteredAllocations, assumptions, m, leaveEntries)
        return { month: m, utilisation: res.utilisation, allocatedHours: res.allocatedHours }
      }),
    }))
  }, [activeResources, filteredAllocations, assumptions, filteredMonths])

  // ── Role heatmap rows ────────────────────────────────────────────────
  const roleHeatmapRows = useMemo(() => {
    if (!assumptions) return []
    return ALL_ROLES
      .map((role) => ({
        id: role,
        label: ROLE_LABELS[role],
        values: filteredMonths.map((m) => {
          const res = calculateRoleUtilisation(role, activeResources, filteredAllocations, assumptions, m, leaveEntries)
          return { month: m, utilisation: res.utilisation, allocatedHours: res.allocatedHours }
        }),
      }))
      .filter((row) => row.values.some((v) => v.allocatedHours > 0))
  }, [activeResources, filteredAllocations, assumptions, filteredMonths])

  // ── Project demand stacked chart ─────────────────────────────────────
  const projectDemandData = useMemo(() => {
    const activeProjects = projects.filter((p) => brandFilter === 'both' || p.frontendBrand === brandFilter)
    return filteredMonths.map((m) => {
      const row: Record<string, number | string> = { month: formatMonth(m) }
      activeProjects.forEach((p) => {
        const hrs = filteredAllocations.filter((a) => a.projectId === p.id && a.month === m).reduce((s, a) => s + a.hours, 0)
        if (hrs > 0) row[p.code] = hrs
      })
      return row
    })
  }, [filteredMonths, filteredAllocations, projects, brandFilter])

  const activeProjectsForChart = useMemo(() =>
    projects.filter((p) =>
      (brandFilter === 'both' || p.frontendBrand === brandFilter) &&
      filteredAllocations.some((a) => a.projectId === p.id)
    ), [projects, brandFilter, filteredAllocations])

  // ── Brand split pie ──────────────────────────────────────────────────
  const brandSplitData = useMemo(() => {
    const dct = filteredAllocations.filter((a) => projects.find((p) => p.id === a.projectId)?.frontendBrand === 'DCT').reduce((s, a) => s + a.hours, 0)
    const plk = filteredAllocations.filter((a) => projects.find((p) => p.id === a.projectId)?.frontendBrand === 'PLK').reduce((s, a) => s + a.hours, 0)
    return [
      { name: 'DCT', value: Math.round(dct) },
      { name: 'PLK', value: Math.round(plk) },
    ].filter((d) => d.value > 0)
  }, [filteredAllocations, projects])

  // ── Brand demand over time ────────────────────────────────────────────
  const brandTimeData = useMemo(() =>
    filteredMonths.map((m) => ({
      month: formatMonth(m),
      DCT: Math.round(filteredAllocations.filter((a) => a.month === m && projects.find((p) => p.id === a.projectId)?.frontendBrand === 'DCT').reduce((s, a) => s + a.hours, 0)),
      PLK: Math.round(filteredAllocations.filter((a) => a.month === m && projects.find((p) => p.id === a.projectId)?.frontendBrand === 'PLK').reduce((s, a) => s + a.hours, 0)),
    })), [filteredMonths, filteredAllocations, projects])

  // ── Overload data ─────────────────────────────────────────────────────
  const personResults = useMemo(() => {
    if (!assumptions) return []
    return activeResources.flatMap((r) =>
      filteredMonths.map((m) => ({ resource: r, result: calculatePersonUtilisation(r, filteredAllocations, assumptions, m, leaveEntries) }))
    )
  }, [activeResources, filteredAllocations, assumptions, filteredMonths])

  function exportPersonCsv() {
    exportCsv('person-utilisation.csv', personResults.map(({ resource, result }) => ({
      Person: resource.displayName, Month: result.month, Capacity: Math.round(result.capacityHours),
      Allocated: Math.round(result.allocatedHours), Utilisation: formatPercent(result.utilisation),
      Overload: Math.round(result.overloadHours), Status: result.status,
    })))
  }

  function exportAllJson() {
    exportJson('erp-export.json', { resources, projects, allocations, scenarios })
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'person', label: 'Person' },
    { key: 'role', label: 'Role' },
    { key: 'brand', label: 'Brand' },
    { key: 'project', label: 'Projects' },
    { key: 'overload', label: 'Overloads' },
  ]

  if (!assumptions) return <PageLayout title="Reports"><p style={{ color: 'var(--text-faint)' }}>No scenario.</p></PageLayout>

  const chartWrapper = (children: React.ReactNode, title: string) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="text-[10px] uppercase tracking-wider mb-5" style={{ color: 'var(--text-faint)' }}>{title}</div>
      {children}
    </motion.div>
  )

  const axisProps = { tick: { fill: '#475569', fontSize: 11 }, axisLine: false, tickLine: false }

  return (
    <PageLayout
      title="Reports"
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={exportPersonCsv}>Person CSV</Button>
          <Button size="sm" variant="primary" onClick={exportAllJson}>Export JSON</Button>
        </div>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Select label="From" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} options={MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))} />
        <Select label="To" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} options={MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))} />
        <Select label="Brand" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value as typeof brandFilter)} options={[{ value: 'both', label: 'Both' }, { value: 'DCT', label: 'DCT' }, { value: 'PLK', label: 'PLK' }]} />
      </div>

      {/* Tabs + display mode toggle */}
      <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {tabs.map((t) => (
            <motion.button
              key={t.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150"
              style={{
                background: activeTab === t.key ? 'var(--accent-light)' : 'var(--surface-2)',
                border: activeTab === t.key ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(139,92,246,0.15)',
                color: activeTab === t.key ? 'var(--accent-text)' : 'var(--text-muted)',
                boxShadow: activeTab === t.key ? '0 0 16px rgba(139,92,246,0.2)' : 'none',
              }}
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* Hours / % toggle — only shown on heatmap tabs */}
        {(activeTab === 'person' || activeTab === 'role' || activeTab === 'overload') && (
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {(['percent', 'hours'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDisplayMode(mode)}
                className="px-3 py-1.5 text-xs font-semibold transition-all"
                style={{
                  background: displayMode === mode ? 'var(--accent-light)' : 'var(--surface-2)',
                  color: displayMode === mode ? 'var(--accent-text)' : 'var(--text-muted)',
                }}
              >
                {mode === 'percent' ? '%' : 'h'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Person utilisation heatmap ── */}
      {activeTab === 'person' && (
        <div className="space-y-8">
          {chartWrapper(
            <UtilisationHeatmap rows={personHeatmapRows} months={filteredMonths} displayMode={displayMode} />,
            'Person Utilisation'
          )}
        </div>
      )}

      {/* ── Role utilisation heatmap ── */}
      {activeTab === 'role' && (
        <div className="space-y-8">
          {chartWrapper(
            <UtilisationHeatmap rows={roleHeatmapRows} months={filteredMonths} displayMode={displayMode} />,
            'Role Utilisation'
          )}
          {chartWrapper(
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={filteredMonths.map((m) => {
                const row: Record<string, number | string> = { month: formatMonth(m) }
                ALL_ROLES.forEach((role) => {
                  const res = calculateRoleUtilisation(role, activeResources, filteredAllocations, assumptions, m, leaveEntries)
                  if (res.allocatedHours > 0) row[ROLE_LABELS[role]] = Math.round(res.allocatedHours)
                })
                return row
              })} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="1 0" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} unit="h" />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                {ALL_ROLES.filter((role) => filteredAllocations.some((a) => a.role === role)).map((role) => (
                  <Bar key={role} dataKey={ROLE_LABELS[role]} stackId="a" fill={ROLE_COLORS[role]} radius={[0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>,
            'Role Demand (stacked hours)'
          )}
        </div>
      )}

      {/* ── Brand split ── */}
      {activeTab === 'brand' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartWrapper(
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={brandSplitData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={3}>
                    <Cell fill="#7c3aed" style={{ filter: 'drop-shadow(0 0 10px rgba(124,58,237,0.5))' }} />
                    <Cell fill="#2563eb" style={{ filter: 'drop-shadow(0 0 10px rgba(37,99,235,0.4))' }} />
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}h`} contentStyle={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} labelStyle={{ color: 'var(--text-muted)' }} itemStyle={{ color: 'var(--text)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>,
            'DCT vs PLK Split'
          )}
          {chartWrapper(
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={brandTimeData} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gDCT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPLK" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 0" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} unit="h" />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                <Area type="monotone" dataKey="DCT" stroke="#7c3aed" strokeWidth={2} fill="url(#gDCT)" />
                <Area type="monotone" dataKey="PLK" stroke="#2563eb" strokeWidth={2} fill="url(#gPLK)" />
              </AreaChart>
            </ResponsiveContainer>,
            'Brand Demand Over Time'
          )}
        </div>
      )}

      {/* ── Project demand ── */}
      {activeTab === 'project' && chartWrapper(
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={projectDemandData} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="1 0" vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} unit="h" />
            <Tooltip content={<DarkTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
            {activeProjectsForChart.map((p, i) => (
              <Bar key={p.id} dataKey={p.code} stackId="a" fill={PERSON_COLORS[i % PERSON_COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>,
        'Project Demand (stacked hours)'
      )}

      {/* ── Overloads ── */}
      {activeTab === 'overload' && (
        <div className="space-y-8">
          {chartWrapper(
            <UtilisationHeatmap
              rows={personHeatmapRows.filter((row) => row.values.some((v) => v.utilisation > 1))}
              months={filteredMonths}
              displayMode={displayMode}
            />,
            'Overloaded People'
          )}
          <div>
            <div className="text-[10px] uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>All Overloads</div>
            {personResults.filter(({ result }) => result.overloadHours > 0).length === 0 ? (
              <p className="text-sm text-emerald-500/60">No overloads in selected period.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Person', 'Month', 'Capacity', 'Allocated', 'Overload', 'Util'].map((h, i) => (
                      <th key={h} className={`pb-3 text-[10px] uppercase tracking-wider font-semibold ${i === 0 ? 'text-left' : 'text-right'}`} style={{ color: 'var(--text-faint)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {personResults
                    .filter(({ result }) => result.overloadHours > 0)
                    .sort((a, b) => b.result.overloadHours - a.result.overloadHours)
                    .map(({ resource, result }) => (
                      <tr key={`${resource.id}-${result.month}`} style={{ borderBottom: '1px solid var(--row-divider)' }}>
                        <td className="py-2.5 font-medium" style={{ color: 'var(--text)' }}>{resource.displayName}</td>
                        <td className="py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>{formatMonth(result.month)}</td>
                        <td className="py-2.5 text-right tabular" style={{ color: 'var(--text-faint)' }}>{formatHours(result.capacityHours)}</td>
                        <td className="py-2.5 text-right tabular" style={{ color: 'var(--text-muted)' }}>{formatHours(result.allocatedHours)}</td>
                        <td className="py-2.5 text-right tabular font-bold text-red-400" style={{ textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>+{formatHours(result.overloadHours)}</td>
                        <td className="py-2.5 text-right tabular font-semibold text-orange-400">{formatPercent(result.utilisation)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  )
}
