import { motion } from 'motion/react'

interface StatProps {
  label: string
  value: string
  sub?: string
  accent?: 'default' | 'violet' | 'emerald' | 'amber' | 'red'
}

const accentBar: Record<string, string> = {
  default: 'var(--border-s)',
  violet: '#7c3aed',
  emerald: '#059669',
  amber: '#d97706',
  red: '#dc2626',
}
const accentVal: Record<string, string> = {
  default: 'var(--text)',
  violet: 'var(--accent-text)',
  emerald: '#059669',
  amber: '#d97706',
  red: '#dc2626',
}

export function StatCard({ label, value, sub, accent = 'default' }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1.5"
    >
      <div className="w-5 h-0.5 rounded-full" style={{ background: accentBar[accent] }} />
      <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
        {label}
      </div>
      <div className="text-3xl font-bold tracking-tight tabular" style={{ color: accentVal[accent] }}>
        {value}
      </div>
      {sub && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
    </motion.div>
  )
}
