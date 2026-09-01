import * as React from 'react'
import { useState, useEffect } from 'react'
import { create } from 'zustand'
import {
  BarChart, Bar,
  XAxis as _XAxis, YAxis as _YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

// Cast recharts class components for TypeScript JSX compatibility (TS2786 guard)
const XAxis = _XAxis as unknown as React.FC<any>
const YAxis = _YAxis as unknown as React.FC<any>

const LOG = (msg: string, ...args: any[]) =>
  console.log(`[CapacityPlannerStackTest] ${msg}`, ...args)

// ── Error Boundary ─────────────────────────────────────────────────────────
interface EBState { hasError: boolean; error: any; info: React.ErrorInfo | null }
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { hasError: false, error: null, info: null }

  componentDidCatch(error: any, info: React.ErrorInfo) {
    LOG('ERROR CAUGHT IN BOUNDARY', { error, info })
    this.setState({ hasError: true, error, info })
  }

  render() {
    const { hasError, error, info } = this.state
    if (!hasError) return this.props.children
    const isErr = error instanceof Error
    const safeProp = (o: any, k: string) => {
      try { return String(o?.[k] ?? 'n/a') } catch { return 'n/a' }
    }
    return (
      <div style={{ padding: 24, background: '#1a0000', color: '#ff9999', fontFamily: 'monospace', borderRadius: 8 }}>
        <h2 style={{ margin: '0 0 12px', color: '#ff6b6b' }}>[CapacityPlannerStackTest] Error Boundary Triggered</h2>
        <p><strong>Type:</strong> {typeof error}</p>
        <p><strong>Constructor:</strong> {safeProp(error?.constructor, 'name')}</p>
        <p><strong>isError:</strong> {String(isErr)}</p>
        <p><strong>Message:</strong> {isErr ? (error as Error).message : JSON.stringify(error)}</p>
        <details open>
          <summary style={{ cursor: 'pointer', color: '#ffbd66' }}>Stack trace</summary>
          <pre style={{ overflow: 'auto', maxHeight: 300, background: '#0f0000', padding: 12, borderRadius: 4 }}>
            {isErr ? (error as Error).stack : JSON.stringify(error, null, 2)}
          </pre>
        </details>
        <details>
          <summary style={{ cursor: 'pointer', color: '#ffbd66' }}>Component stack</summary>
          <pre style={{ overflow: 'auto', maxHeight: 200, background: '#0f0000', padding: 12, borderRadius: 4 }}>
            {info?.componentStack ?? 'n/a'}
          </pre>
        </details>
      </div>
    )
  }
}

// ── Zustand store ──────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'resources' | 'planning'
interface AppState {
  activeTab: Tab
  resourceCount: number
  setTab: (t: Tab) => void
  addResource: () => void
}
const useStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  resourceCount: 4,
  setTab: (tab) => set({ activeTab: tab }),
  addResource: () => set((s) => ({ resourceCount: Math.min(s.resourceCount + 1, 8) })),
}))

// ── Mock data ──────────────────────────────────────────────────────────────
const CHART_DATA = [
  { month: 'Jan', capacity: 160, allocated: 140 },
  { month: 'Feb', capacity: 160, allocated: 155 },
  { month: 'Mar', capacity: 160, allocated: 170 },
  { month: 'Apr', capacity: 160, allocated: 130 },
  { month: 'May', capacity: 160, allocated: 150 },
  { month: 'Jun', capacity: 160, allocated: 160 },
]
const RESOURCES = [
  { id: '1', name: 'Alice Smith',   role: 'Engineer',  util: 87 },
  { id: '2', name: 'Bob Jones',     role: 'Designer',  util: 92 },
  { id: '3', name: 'Carol White',   role: 'Manager',   util: 65 },
  { id: '4', name: 'Dave Brown',    role: 'Engineer',  util: 78 },
  { id: '5', name: 'Eve Davis',     role: 'Analyst',   util: 85 },
  { id: '6', name: 'Frank Wilson',  role: 'Engineer',  util: 55 },
  { id: '7', name: 'Grace Lee',     role: 'Designer',  util: 95 },
  { id: '8', name: 'Hank Taylor',   role: 'Manager',   util: 70 },
]

// ── Dashboard ──────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  useEffect(() => { LOG('DashboardPage mounted — recharts rendering') }, [])
  return (
    <div>
      <h3 style={{ color: '#ffbd66', margin: '0 0 16px' }}>Capacity vs Demand (6 months)</h3>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CHART_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
            />
            <Bar dataKey="capacity" fill="#334155" radius={[3, 3, 0, 0]} />
            <Bar dataKey="allocated" fill="#ffbd66" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        {[
          { label: 'Total Capacity', value: '960h', color: '#334155' },
          { label: 'Allocated',      value: '905h', color: '#ffbd66' },
          { label: 'Utilisation',    value: '94%',  color: '#22c55e' },
        ].map((k) => (
          <div key={k.label} style={{ flex: 1, background: '#1e293b', borderRadius: 8, padding: '12px 16px', borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Resources ──────────────────────────────────────────────────────────────
const ResourcesPage: React.FC = () => {
  const { resourceCount, addResource } = useStore()
  useEffect(() => { LOG('ResourcesPage mounted — framer-motion cards active') }, [])
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ color: '#ffbd66', margin: 0 }}>Team Members ({resourceCount})</h3>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={addResource}
          style={{ background: '#ffbd66', color: '#000', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
        >
          + Add Resource
        </motion.button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {RESOURCES.slice(0, resourceCount).map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            style={{ background: '#1e293b', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{r.name}</div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 10 }}>{r.role}</div>
            <div style={{ background: '#0f172a', borderRadius: 4, height: 5 }}>
              <div style={{ width: `${r.util}%`, background: r.util > 90 ? '#ef4444' : r.util > 80 ? '#f59e0b' : '#22c55e', height: '100%', borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>{r.util}% utilised</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Planning ───────────────────────────────────────────────────────────────
const PlanningPage: React.FC = () => {
  useEffect(() => { LOG('PlanningPage mounted — table rendered') }, [])
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return (
    <div>
      <h3 style={{ color: '#ffbd66', margin: '0 0 16px' }}>Allocation Matrix</h3>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource</th>
              {months.map((m) => (
                <th key={m} style={{ padding: '8px 10px', textAlign: 'right', color: '#64748b', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESOURCES.slice(0, 6).map((r) => {
              const isHov = hoveredRow === r.id
              return (
                <tr key={r.id}
                  onMouseEnter={() => setHoveredRow(r.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ background: isHov ? '#1e293b' : 'transparent', transition: 'background 0.15s', cursor: 'default' }}
                >
                  <td style={{ padding: '8px 12px', color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.name}</td>
                  {months.map((m) => {
                    const h = Math.round(100 + Math.random() * 60)
                    return <td key={m} style={{ padding: '8px 10px', textAlign: 'right', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}h</td>
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────
interface StackTestAppProps { spfxVersion: string }

const StackTestApp: React.FC<StackTestAppProps> = ({ spfxVersion }) => {
  const { activeTab, setTab } = useStore()

  useEffect(() => {
    LOG('===== Stack Test App Mounted =====')
    LOG('SPFx version:', spfxVersion)
    LOG('React version:', React.version)
    LOG('Library imports: zustand ✓  recharts ✓  framer-motion ✓')
    LOG('Tab state via zustand: ✓')
  }, [])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'resources', label: 'Resources' },
    { id: 'planning',  label: 'Planning'  },
  ]

  return (
    <ErrorBoundary>
      <div style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif', background: '#0f172a', minHeight: 440, color: '#e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ background: '#1e293b', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'stretch', height: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 24, whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#ffbd66' }}>Capacity Planner</span>
            <span style={{ fontSize: 10, color: '#475569', background: '#0f172a', padding: '2px 7px', borderRadius: 4, marginLeft: 8 }}>
              SPFx {spfxVersion} · Stack Test
            </span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'stretch' }}>
            {tabs.map((t) => {
              const active = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => { LOG('Tab changed to:', t.id); setTab(t.id) }}
                  style={{
                    padding: '0 14px', border: 'none', background: 'transparent', cursor: 'pointer',
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    color: active ? '#ffbd66' : '#94a3b8',
                    borderBottom: active ? '2px solid #ffbd66' : '2px solid transparent',
                    transition: 'color 0.12s',
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Page content */}
        <div style={{ padding: 20 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'dashboard' && <DashboardPage />}
              {activeTab === 'resources' && <ResourcesPage />}
              {activeTab === 'planning'  && <PlanningPage  />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 10, color: '#334155', display: 'flex', gap: 16 }}>
          <span>React {React.version}</span>
          <span>zustand 4.5.6</span>
          <span>recharts 2.13.3</span>
          <span>framer-motion 10.18.0</span>
          <span>SPFx {spfxVersion}</span>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default StackTestApp
