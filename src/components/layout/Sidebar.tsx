import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { useTheme } from '../../utils/ThemeContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/resources', label: 'Team', icon: '◎' },
  { to: '/projects', label: 'Projects', icon: '◈' },
  { to: '/allocations', label: 'Planning', icon: '▤' },
  { to: '/scenarios', label: 'Scenarios', icon: '⊕' },
  { to: '/optimisation', label: 'Optimisation', icon: '◬' },
  { to: '/reports', label: 'Reports', icon: '◻' },
]

export function Sidebar() {
  const { toggle, isDark } = useTheme()
  const appName = import.meta.env['VITE_APP_NAME'] ?? 'Resource Planner'

  return (
    <aside
      className="w-52 min-h-screen flex flex-col shrink-0"
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-bdr)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="gradient-text text-sm font-semibold tracking-tight">{appName}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <NavLink
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 10px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.12s ease',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
                boxShadow: isActive ? 'inset 0 0 0 1px rgba(124,58,237,0.2)' : 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ fontSize: 11, opacity: isActive ? 1 : 0.5 }}>{item.icon}</span>
                  {item.label}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Theme toggle + version */}
      <div className="px-4 py-5 flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--text-faint)' }}>
          v0.1
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span style={{ fontSize: 13 }}>{isDark ? '☀' : '◑'}</span>
        </motion.button>
      </div>
    </aside>
  )
}
