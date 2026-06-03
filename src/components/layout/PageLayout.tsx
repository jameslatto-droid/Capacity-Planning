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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="px-8 pt-10 pb-8">
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            )}
          </motion.div>
          {actions && (
            <motion.div
              className="flex items-center gap-2 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {actions}
            </motion.div>
          )}
        </div>
      </div>
      <div className="flex-1 px-8 pb-12">{children}</div>
    </motion.div>
  )
}
