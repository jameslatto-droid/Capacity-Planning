import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { useTheme } from '../../utils/ThemeContext'

interface PageLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout({ title, subtitle, actions, children }: PageLayoutProps) {
  const { toggle, isDark } = useTheme()

  return (
    <motion.div
      className="flex-1 flex flex-col min-h-screen"
      style={{ background: 'var(--bg)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className="px-8 pt-8 pb-6 flex items-start justify-between gap-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{title}</h1>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </motion.div>

        <div className="flex items-center gap-3 mt-0.5 shrink-0">
          {actions}
          {/* Theme toggle — always visible in header */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: 12 }}>{isDark ? '☀' : '◑'}</span>
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </motion.button>
        </div>
      </div>

      <div className="flex-1 px-8 py-8">{children}</div>
    </motion.div>
  )
}
