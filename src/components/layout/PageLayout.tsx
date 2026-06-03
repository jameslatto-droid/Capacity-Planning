import { type ReactNode } from 'react'
import { motion } from 'motion/react'

interface PageLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout({ title, subtitle, actions, children }: PageLayoutProps) {
  return (
    <motion.div
      className="flex-1 flex flex-col min-h-screen"
      style={{ background: 'var(--bg)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="px-8 pt-10 pb-7" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between">
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
          {actions && (
            <div className="flex items-center gap-2 mt-0.5">{actions}</div>
          )}
        </div>
      </div>
      <div className="flex-1 px-8 py-8">{children}</div>
    </motion.div>
  )
}
