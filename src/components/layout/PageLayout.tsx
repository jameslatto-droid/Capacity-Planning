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
      className="flex-1 flex flex-col"
      style={{ background: 'var(--bg)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="px-8 pt-5 pb-4 flex items-start justify-between gap-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{title}</h1>
          {subtitle && (
            <p className="mt-0.5" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{subtitle}</p>
          )}
        </motion.div>

        {actions && (
          <div className="flex items-center gap-3 mt-0.5 shrink-0">
            {actions}
          </div>
        )}
      </div>

      <div className="flex-1 px-8 py-6">{children}</div>
    </motion.div>
  )
}
