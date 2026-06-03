import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatMonth } from '../../utils/months'
import type { TeamUtilisationResult } from '../../types'

interface Props {
  data: TeamUtilisationResult[]
  months: string[]
}

export function CapacityDemandChart({ data, months }: Props) {
  const chartData = months.map((m, i) => {
    const d = data[i]
    return {
      month: formatMonth(m),
      Capacity: Math.round(d?.capacityHours ?? 0),
      Demand: Math.round(d?.allocatedHours ?? 0),
      Overload: Math.round(d?.overloadHours ?? 0),
    }
  })

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} unit="h" />
        <Tooltip formatter={(v: number) => `${v}h`} />
        <Legend />
        <Bar dataKey="Capacity" fill="#93c5fd" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Demand" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Overload" fill="#ef4444" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
