import { type ReactNode, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Resource, Allocation, CapacityAssumptions, LeaveEntry, ResourceRole } from '../../types'
import { ROLE_LABELS } from '../../types'
import { calculateMonthlyCapacityWithLeave } from '../../domain/capacity/leaveCalculations'
import { formatHours } from '../../utils/format'

// Primary disciplines only — secondary/overhead roles excluded from display
const PRIMARY_ROLES: ResourceRole[] = [
  'project-management',
  'process-engineering',
  'mechanical-engineering',
  'drafting',
  'procurement',
  'quality',
]

interface Props {
  resources: Resource[]
  allocations: Allocation[]
  leaveEntries: LeaveEntry[]
  assumptions: CapacityAssumptions
  months: string[]
  leadingPanel?: ReactNode
}

interface RoleData {
  month: string
  capacity: number
  allocated: number
}

function utilColor(avgUtil: number) {
  if (avgUtil > 1) return '#e45b4f'
  if (avgUtil > 0.85) return '#e8703a'
  return '#ffbd66'
}

function RolePanel({ role, data, avgUtil }: { role: ResourceRole; data: RoleData[]; avgUtil: number }) {
  const color = utilColor(avgUtil)
  const gradId = `dc-${role}`
  const maxVal = Math.max(...data.map((d) => Math.max(d.capacity, d.allocated)), 1)
  const firstCap = Math.round(data[0]?.capacity ?? 0)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Accent top bar — instant health signal */}
      <div style={{ height: 3, background: color }} />
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
        {ROLE_LABELS[role]}
      </div>

      <div style={{ height: 100, padding: '0 14px 8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.5} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fill: 'var(--text-faint)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, maxVal * 1.15]}
              ticks={[firstCap]}
              tick={{ fill: 'rgba(148,163,184,0.45)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={28}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                fontSize: 11,
                color: 'var(--text)',
              }}
              formatter={(v: number, name: string) => [
                formatHours(v),
                name === 'capacity' ? 'Capacity' : 'Allocated',
              ]}
            />
            {/* Capacity ceiling — primary-role headcount only */}
            <Area
              type="monotone"
              dataKey="capacity"
              stroke="rgba(148,163,184,0.4)"
              strokeWidth={1}
              strokeDasharray="4 3"
              fill="none"
              dot={false}
              isAnimationActive={false}
            />
            {/* Allocated hours for this discipline */}
            <Area
              type="monotone"
              dataKey="allocated"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function DisciplineCharts({ resources, allocations, leaveEntries, assumptions, months, leadingPanel }: Props) {
  const activeResources = useMemo(() => resources.filter((r) => r.active), [resources])

  const roleData = useMemo(() => {
    return PRIMARY_ROLES.map((role) => {
      // Capacity: only people whose PRIMARY role is this discipline
      const primaryResources = activeResources.filter((r) => r.role === role)

      const data: RoleData[] = months.map((m) => {
        const capacity = primaryResources.reduce(
          (s, r) => s + calculateMonthlyCapacityWithLeave(r, m, leaveEntries, assumptions),
          0,
        )
        const allocated = allocations
          .filter((a) => a.role === role && a.month === m)
          .reduce((s, a) => s + a.hours, 0)
        return {
          month: new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short' }),
          capacity: Math.round(capacity),
          allocated: Math.round(allocated),
        }
      })

      const totalCap = data.reduce((s, d) => s + d.capacity, 0)
      const totalAlloc = data.reduce((s, d) => s + d.allocated, 0)
      const avgUtil = totalCap > 0 ? totalAlloc / totalCap : 0
      const hasData = totalCap > 0 || totalAlloc > 0
      return { role, data, avgUtil, hasData }
    }).filter((r) => r.hasData)
  }, [activeResources, allocations, assumptions, months, leaveEntries])

  if (!roleData.length) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
      {leadingPanel}
      {roleData.map(({ role, data, avgUtil }) => (
        <RolePanel key={role} role={role} data={data} avgUtil={avgUtil} />
      ))}
    </div>
  )
}
