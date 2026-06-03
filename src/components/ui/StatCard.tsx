interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: 'default' | 'green' | 'yellow' | 'orange' | 'red' | 'blue'
}

const accentClasses = {
  default: 'border-gray-200',
  green: 'border-green-400',
  yellow: 'border-yellow-400',
  orange: 'border-orange-400',
  red: 'border-red-400',
  blue: 'border-blue-400',
}

const valueCls = {
  default: 'text-gray-900',
  green: 'text-green-700',
  yellow: 'text-yellow-700',
  orange: 'text-orange-700',
  red: 'text-red-700',
  blue: 'text-blue-700',
}

export function StatCard({ label, value, sub, accent = 'default' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg border-l-4 ${accentClasses[accent]} shadow-sm p-4`}>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${valueCls[accent]}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}
