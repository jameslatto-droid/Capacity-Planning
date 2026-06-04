interface BadgeProps {
  children: string
  variant?: 'default' | 'violet' | 'emerald' | 'amber' | 'red' | 'blue'
}

const styles: Record<string, { color: string; bg: string; border: string }> = {
  default: { color: 'var(--text-muted)',  bg: 'var(--surface-2)',             border: 'var(--border-s)' },
  violet:  { color: 'var(--accent-text)', bg: 'var(--accent-light)',          border: 'rgba(124,58,237,0.3)' },
  emerald: { color: '#059669',            bg: 'rgba(5,150,105,0.12)',          border: 'rgba(5,150,105,0.3)' },
  amber:   { color: '#d97706',            bg: 'rgba(217,119,6,0.12)',          border: 'rgba(217,119,6,0.3)' },
  red:     { color: '#dc2626',            bg: 'rgba(220,38,38,0.1)',           border: 'rgba(220,38,38,0.25)' },
  blue:    { color: '#3b82f6',            bg: 'rgba(59,130,246,0.1)',          border: 'rgba(59,130,246,0.25)' },
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const s = styles[variant]!
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {children}
    </span>
  )
}
