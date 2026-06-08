import {
  Bar,
  ComposedChart,
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
  height?: number
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const visiblePayload = payload.filter((p) => p.name !== 'Overload' || p.value > 0)
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
      {visiblePayload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          <span className="font-semibold tabular ml-auto pl-4" style={{ color: 'var(--text)' }}>{p.value}h</span>
        </div>
      ))}
    </div>
  )
}

export function CapacityDemandChart({ data, months, height = 260 }: Props) {
  const chartData = months.map((m, i) => ({
    month: formatMonth(m),
    Capacity: Math.round(data[i]?.capacityHours ?? 0),
    Allocation: Math.round(data[i]?.allocatedHours ?? 0),
    Overload: Math.round(data[i]?.overloadHours ?? 0),
  }))

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCapacity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.16} />
              <stop offset="95%" stopColor="#64748b" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradAllocation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
            </linearGradient>
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
            stroke="#64748b"
            strokeWidth={1.5}
            fill="url(#gradCapacity)"
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="Allocation"
            stroke="#7c3aed"
            strokeWidth={2.5}
            fill="url(#gradAllocation)"
            dot={{ r: 2.5, fill: '#7c3aed', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 1 }}
          />
          <Bar
            dataKey="Overload"
            fill="#ef4444"
            opacity={0.32}
            radius={[3, 3, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
