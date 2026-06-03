import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'motion/react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
}

const variantCls: Record<string, string> = {
  primary: 'bg-violet-600 text-white hover:bg-violet-500',
  secondary: 'text-slate-400 border border-white/10 hover:border-white/20 hover:text-slate-200',
  danger: 'text-red-400 border border-red-500/30 hover:border-red-400/60 hover:text-red-300',
  ghost: 'text-slate-500 hover:text-slate-300',
}

const sizeCls: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      {...(props as object)}
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-40 ${variantCls[variant]} ${sizeCls[size]} ${className}`}
      style={
        variant === 'primary'
          ? { boxShadow: '0 0 16px rgba(139,92,246,0.3)' }
          : variant === 'secondary'
          ? { background: 'rgba(255,255,255,0.04)' }
          : {}
      }
    >
      {children}
    </motion.button>
  )
}
