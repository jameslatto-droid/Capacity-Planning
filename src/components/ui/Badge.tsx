interface BadgeProps {
  children: string
  variant?: 'default' | 'violet' | 'emerald' | 'amber' | 'red' | 'blue'
}

const variants: Record<string, string> = {
  default: 'text-slate-400 border-slate-700',
  violet: 'text-violet-300 border-violet-500/40',
  emerald: 'text-emerald-300 border-emerald-500/40',
  amber: 'text-amber-300 border-amber-500/40',
  red: 'text-red-300 border-red-500/40',
  blue: 'text-blue-300 border-blue-500/40',
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${variants[variant]}`}
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {children}
    </span>
  )
}
