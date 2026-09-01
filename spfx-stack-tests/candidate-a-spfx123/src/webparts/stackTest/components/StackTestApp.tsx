import * as React from 'react'
import { useState, useEffect } from 'react'

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
    return (
      <div style={{ padding: 24, background: '#1a0000', color: '#ff9999', fontFamily: 'monospace', borderRadius: 8 }}>
        <h2 style={{ margin: '0 0 12px', color: '#ff6b6b' }}>Error Boundary — React {React.version}</h2>
        <p><b>Type:</b> {typeof error}</p>
        <p><b>Constructor:</b> {String(error?.constructor?.name ?? 'n/a')}</p>
        <p><b>Message:</b> {isErr ? (error as Error).message : JSON.stringify(error)}</p>
        <details open>
          <summary style={{ cursor: 'pointer', color: '#ffbd66' }}>Stack</summary>
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

// ── Pure React — NO zustand / recharts / framer-motion ─────────────────────
interface Props { spfxVersion: string }

const StackTestApp: React.FC<Props> = ({ spfxVersion }) => {
  const [count, setCount] = useState(0)
  const [tab, setTab] = useState<'a' | 'b' | 'c'>('a')

  useEffect(() => {
    LOG('===== Stack Test App Mounted (React-only build) =====')
    LOG('SPFx version:', spfxVersion)
    LOG('React version:', React.version)
    LOG('NO external libraries — pure React test')
  }, [])

  const tabs: { id: 'a' | 'b' | 'c'; label: string }[] = [
    { id: 'a', label: 'Tab A' },
    { id: 'b', label: 'Tab B' },
    { id: 'c', label: 'Tab C' },
  ]

  return (
    <ErrorBoundary>
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#0f172a', minHeight: 400, color: '#e2e8f0', borderRadius: 12, padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: '#1e293b', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: '#ffbd66', fontSize: 14 }}>
            Stack Test — SPFx {spfxVersion}
          </span>
          <span style={{ fontSize: 10, color: '#475569', background: '#0f172a', padding: '2px 8px', borderRadius: 4 }}>
            React {React.version} · pure React only
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 20px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { LOG('Tab:', t.id); setTab(t.id) }}
              style={{
                padding: '6px 16px', border: 'none', borderRadius: '6px 6px 0 0', cursor: 'pointer',
                background: tab === t.id ? '#334155' : 'transparent',
                color: tab === t.id ? '#ffbd66' : '#64748b',
                fontWeight: tab === t.id ? 600 : 400, fontSize: 13,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: 20 }}>
          {tab === 'a' && (
            <div>
              <h3 style={{ color: '#ffbd66', margin: '0 0 16px', fontSize: 15 }}>React State Test</h3>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>Counter: <b style={{ color: '#e2e8f0' }}>{count}</b></p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => { LOG('Increment'); setCount(c => c + 1) }}
                  style={{ padding: '6px 14px', background: '#ffbd66', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  +1
                </button>
                <button onClick={() => { LOG('Reset'); setCount(0) }}
                  style={{ padding: '6px 14px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  Reset
                </button>
              </div>
              <div style={{ marginTop: 20, background: '#1e293b', borderRadius: 8, padding: 16 }}>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>Environment</p>
                {[
                  ['React version', React.version],
                  ['SPFx version', spfxVersion],
                  ['Libraries', 'pure React only (no zustand / recharts / framer-motion)'],
                  ['window.location', typeof window !== 'undefined' ? window.location.host : 'n/a'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                    <span style={{ color: '#64748b', width: 140, flexShrink: 0 }}>{k}</span>
                    <span style={{ color: '#e2e8f0' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'b' && (
            <div>
              <h3 style={{ color: '#ffbd66', margin: '0 0 16px', fontSize: 15 }}>Conditional Render Test</h3>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} style={{ padding: '8px 12px', margin: '4px 0', background: '#1e293b', borderRadius: 6, fontSize: 13, color: '#94a3b8' }}>
                  Row {i + 1} — clicks: {count}
                </div>
              ))}
            </div>
          )}
          {tab === 'c' && (
            <div>
              <h3 style={{ color: '#ffbd66', margin: '0 0 16px', fontSize: 15 }}>Lifecycle Test</h3>
              <LifecycleTest />
            </div>
          )}
        </div>

        <div style={{ padding: '6px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 10, color: '#334155' }}>
          SPFx {spfxVersion} · React {React.version} · no external libs
        </div>
      </div>
    </ErrorBoundary>
  )
}

const LifecycleTest: React.FC = () => {
  const [mounted, setMounted] = React.useState(false)
  useEffect(() => {
    LOG('LifecycleTest useEffect — mounted')
    setMounted(true)
    return () => { LOG('LifecycleTest cleanup') }
  }, [])
  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: 16 }}>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>useEffect fired: <b style={{ color: mounted ? '#22c55e' : '#ef4444' }}>{mounted ? 'YES ✓' : 'NO'}</b></p>
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
        If this shows YES, React hooks are fully functional in this SPFx environment.
      </p>
    </div>
  )
}

export default StackTestApp
