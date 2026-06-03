import { motion } from 'motion/react'

interface StatProps {
  label: string
  value: string
  sub?: string
  accent?: 'default' | 'violet' | 'emerald' | 'amber' | 'red' | 'blue'
  animateNumber?: boolean
}

const accentLine: Record<string, string> = {
  default: 'bg-slate-700',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
}

const accentText: Record<string, string> = {
  default: 'text-slate-300',
  violet: 'text-violet-300',
  emerald: 'text-emerald-300',
  amber: 'text-amber-300',
  red: 'text-red-300',
  blue: 'text-blue-300',
}

export function StatCard({ label, value, sub, accent = 'default' }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1.5"
    >
      <div className={`w-6 h-px ${accentLine[accent]}`} />
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
        {label}
      </div>
      <div className={`text-3xl font-bold tracking-tight tabular ${accentText[accent]}`}>
        {value}
      </div>
      {sub && (
        <div className="text-xs text-slate-600">{sub}</div>
      )}
    </motion.div>
  )
}
