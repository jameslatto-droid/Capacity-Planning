import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatMonth } from '../../utils/months'
import type { TeamUtilisationResult } from '../../types'

interface Props {
  data: TeamUtilisationResult[]
  months: string[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          <span className="font-semibold tabular ml-auto pl-4" style={{ color: 'var(--text)' }}>{p.value}h</span>
        </div>
      ))}
    </div>
  )
}

export function CapacityDemandChart({ data, months }: Props) {
  const chartData = months.map((m, i) => ({
    month: formatMonth(m),
    Capacity: Math.round(data[i]?.capacityHours ?? 0),
    Demand: Math.round(data[i]?.allocatedHours ?? 0),
    Overload: Math.round(data[i]?.overloadHours ?? 0),
  }))

  return (
    <div style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCapacity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4c1d95" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4c1d95" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="gradDemand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="gradOverload" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
            <filter id="glowCapacity">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glowDemand">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="1 0"
            vertical={false}
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="month"
            tick={{ fill: '#475569', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#475569', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit="h"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Capacity"
            stroke="#4c1d95"
            strokeWidth={1.5}
            fill="url(#gradCapacity)"
            strokeDasharray="4 2"
          />
          <Area
            type="monotone"
            dataKey="Demand"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#gradDemand)"
            filter="url(#glowDemand)"
          />
          <Area
            type="monotone"
            dataKey="Overload"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#gradOverload)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
