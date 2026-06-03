import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/resources', label: 'Resources', icon: '◎' },
  { to: '/projects', label: 'Projects', icon: '◈' },
  { to: '/allocations', label: 'Allocations', icon: '▤' },
  { to: '/scenarios', label: 'Scenarios', icon: '⊕' },
  { to: '/optimisation', label: 'Optimisation', icon: '◬' },
  { to: '/reports', label: 'Reports', icon: '◻' },
]

export function Sidebar() {
  const appName = import.meta.env['VITE_APP_NAME'] ?? 'Resource Planner'

  return (
    <aside
      className="w-52 min-h-screen flex flex-col"
      style={{ background: '#06060c', borderRight: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="gradient-text text-sm font-semibold tracking-tight leading-snug">
          {appName}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
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
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'text-violet-300 bg-violet-500/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { boxShadow: 'inset 0 0 0 1px rgba(139,92,246,0.2)' }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-xs ${isActive ? 'text-violet-400' : 'text-slate-600'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-5">
        <div className="text-[10px] text-slate-700 font-mono tracking-widest uppercase">v0.1.0</div>
      </div>
    </aside>
  )
}
