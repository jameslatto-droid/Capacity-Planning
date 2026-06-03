import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'motion/react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Button({ variant = 'secondary', size = 'md', className = '', children, style: extStyle, ...props }: ButtonProps) {
  const base = 'inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-40'
  const sz = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'

  const varStyle: React.CSSProperties =
    variant === 'primary'
      ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 0 16px rgba(124,58,237,0.25)' }
      : variant === 'danger'
      ? { background: 'rgba(220,38,38,0.08)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)' }
      : variant === 'ghost'
      ? { color: 'var(--text-muted)' }
      : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      {...(props as object)}
      className={`${base} ${sz} ${className}`}
      style={{ ...varStyle, ...extStyle }}
    >
      {children}
    </motion.button>
  )
}
