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
  displayMode?: 'percent' | 'hours'
}

function glowStyle(util: number): string {
  if (util > 1.15) return '0 0 0 1px rgba(220,38,38,0.6)'
  if (util > 1.0) return '0 0 0 1px rgba(234,88,12,0.5)'
  return 'none'
}

function labelColor(util: number): string {
  if (util <= 0) return 'transparent'
  // Use high-contrast white for all filled cells — the coloured bg handles meaning
  return 'rgba(255,255,255,0.92)'
}

export function UtilisationHeatmap({ rows, months, displayMode = 'percent' }: Props) {
  if (!rows.length) return <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No data.</p>

  return (
    <div className="overflow-x-auto">
      {/* Month headers */}
      <div className="flex mb-2 pl-36">
        {months.map((m) => (
          <div
            key={m}
            className="flex-1 text-center text-[10px] uppercase tracking-widest px-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {formatMonth(m)}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {rows.map((row, ri) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: ri * 0.03, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center"
          >
            {/* Label */}
            <div
              className="w-36 shrink-0 pr-3 text-right text-xs font-medium truncate"
              style={{ color: 'var(--text-muted)' }}
              title={row.label}
            >
              {row.label}
            </div>

            {/* Cells — solid fill, no fade */}
            <div className="flex flex-1 rounded-lg overflow-hidden h-8" style={{ gap: '1px' }}>
              {row.values.map((v) => {
                const isEmpty = v.allocatedHours <= 0
                const bg = isEmpty ? 'var(--surface-2)' : utilisationColor(v.utilisation)
                const label =
                  displayMode === 'hours'
                    ? isEmpty ? '' : `${Math.round(v.allocatedHours)}h`
                    : isEmpty ? '' : formatPercent(v.utilisation)

                return (
                  <div
                    key={v.month}
                    className="heatmap-cell flex-1 flex items-center justify-center"
                    style={{ background: bg, boxShadow: glowStyle(v.utilisation) }}
                    title={`${row.label} · ${formatMonth(v.month)} · ${formatPercent(v.utilisation)} · ${Math.round(v.allocatedHours)}h`}
                  >
                    {label && (
                      <span
                        className="text-[10px] font-semibold tabular select-none leading-none"
                        style={{
                          color: labelColor(v.utilisation),
                          textShadow: v.utilisation > 1 ? '0 0 6px rgba(0,0,0,0.4)' : 'none',
                        }}
                      >
                        {label}
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
      <div className="flex items-center gap-5 mt-5 pl-36 flex-wrap">
        {[
          { label: 'Low',      color: utilisationColor(0.3) },
          { label: 'Healthy',  color: utilisationColor(0.72) },
          { label: 'High',     color: utilisationColor(0.92) },
          { label: 'Overload', color: utilisationColor(1.08) },
          { label: 'Critical', color: utilisationColor(1.2) },
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
