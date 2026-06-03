interface BadgeProps {
  children: string
  variant?: 'default' | 'violet' | 'emerald' | 'amber' | 'red' | 'blue'
}

const styles: Record<string, { color: string; bg: string; border: string }> = {
  default: { color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)' },
  violet:  { color: 'var(--accent-text)', bg: 'var(--accent-light)', border: 'rgba(124,58,237,0.25)' },
  emerald: { color: '#059669', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.25)' },
  amber:   { color: '#d97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.25)' },
  red:     { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.25)' },
  blue:    { color: '#2563eb', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.25)' },
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const s = styles[variant]!
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {children}
    </span>
  )
}
