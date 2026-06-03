import { motion } from 'motion/react'
import { formatPercent, utilisationColor } from '../../utils/format'
import { formatMonth } from '../../utils/months'

interface HeatmapRow {
  id: string
  label: string
  values: { month: string; utilisation: number; allocatedHours: number }[]
}

interface Props {
  rows: HeatmapRow[]
  months: string[]
}

/** Maps a utilisation ratio to a CSS linear-gradient for horizontal band fill */
function cellGradient(util: number): string {
  if (util <= 0) return 'transparent'
  const base = utilisationColor(util)
  // Glow edges for overload states
  if (util > 1.15) {
    return `linear-gradient(90deg, transparent 0%, ${base} 20%, rgba(220,38,38,0.95) 50%, ${base} 80%, transparent 100%)`
  }
  if (util > 1.0) {
    return `linear-gradient(90deg, transparent 0%, ${base} 15%, ${base} 85%, transparent 100%)`
  }
  return `linear-gradient(90deg, transparent 0%, ${base} 20%, ${base} 80%, transparent 100%)`
}

function textColor(util: number): string {
  if (util <= 0) return 'transparent'
  if (util > 1.15) return '#fca5a5'
  if (util > 1.0) return '#fdba74'
  if (util > 0.85) return '#fde68a'
  if (util > 0.6) return '#6ee7b7'
  return '#93c5fd'
}

function glowStyle(util: number): string {
  if (util > 1.15) return '0 0 14px rgba(220,38,38,0.7)'
  if (util > 1.0) return '0 0 10px rgba(234,88,12,0.5)'
  return 'none'
}

export function UtilisationHeatmap({ rows, months }: Props) {
  if (!rows.length) return <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No data.</p>

  return (
    <div className="overflow-x-auto">
      {/* Month headers */}
      <div className="flex mb-2 pl-36">
        {months.map((m) => (
          <div key={m} className="flex-1 text-center text-[10px] uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>
            {formatMonth(m)}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-1.5">
        {rows.map((row, ri) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: ri * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-0"
          >
            {/* Label */}
            <div className="w-36 shrink-0 pr-3 text-right text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>
              {row.label}
            </div>

            {/* Cells — each is a coloured band in a continuous row */}
            <div className="flex flex-1 rounded-lg overflow-hidden h-9" style={{ gap: '1px', background: 'var(--surface-2)' }}>
              {row.values.map((v) => {
                const isEmpty = v.allocatedHours <= 0
                return (
                  <div
                    key={v.month}
                    className="heatmap-cell flex-1 flex items-center justify-center relative"
                    style={{
                      background: isEmpty ? 'rgba(255,255,255,0.015)' : cellGradient(v.utilisation),
                      boxShadow: glowStyle(v.utilisation),
                    }}
                    title={`${row.label} · ${formatMonth(v.month)} · ${formatPercent(v.utilisation)}`}
                  >
                    {!isEmpty && (
                      <span
                        className="text-[10px] font-bold tabular select-none"
                        style={{ color: textColor(v.utilisation), textShadow: v.utilisation > 1 ? '0 0 8px currentColor' : 'none' }}
                      >
                        {formatPercent(v.utilisation)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 pl-36">
        {[
          { label: 'Low', color: 'rgba(29,78,216,0.65)' },
          { label: 'Healthy', color: 'rgba(5,150,105,0.7)' },
          { label: 'High', color: 'rgba(217,119,6,0.72)' },
          { label: 'Overload', color: 'rgba(234,88,12,0.78)' },
          { label: 'Critical', color: 'rgba(220,38,38,0.85)' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
