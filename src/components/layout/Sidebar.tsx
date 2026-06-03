import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/resources', label: 'Resources', icon: '👥' },
  { to: '/projects', label: 'Projects', icon: '📋' },
  { to: '/allocations', label: 'Allocations', icon: '📅' },
  { to: '/scenarios', label: 'Scenarios', icon: '🔀' },
  { to: '/optimisation', label: 'Optimisation', icon: '⚡' },
  { to: '/reports', label: 'Reports', icon: '📊' },
]

export function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="px-4 py-5 border-b border-gray-700">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          {import.meta.env['VITE_APP_NAME'] ?? 'Resource Planner'}
        </div>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
