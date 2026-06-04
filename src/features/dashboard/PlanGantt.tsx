import { useMemo } from 'react'
import { motion } from 'motion/react'
import type { Project, Allocation } from '../../types'
import { generateMonthRange, currentMonth } from '../../utils/months'
import { formatHours } from '../../utils/format'

interface Props {
  projects: Project[]
  allocations: Allocation[]
  brandFilter: 'DCT' | 'PLK' | 'both'
  startMonth: string
  endMonth: string
}

const brandColor: Record<string, { bar: string; border: string; text: string }> = {
  DCT: { bar: 'rgba(124,58,237,0.55)', border: '#7c3aed', text: '#ede9fe' },
  PLK: { bar: 'rgba(37,99,235,0.55)',  border: '#2563eb', text: '#dbeafe' },
}

const statusOpacity: Record<string, number> = {
  active: 1, planned: 0.75, opportunity: 0.45, 'on-hold': 0.3, complete: 0.25, cancelled: 0.15,
}

const statusDash: Record<string, string> = {
  opportunity: '4 3', planned: '0', active: '0', 'on-hold': '3 3',
}

export function PlanGantt({ projects, allocations, brandFilter, startMonth, endMonth }: Props) {
  const months = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth])
  const now = currentMonth()

  const nowIdx = months.indexOf(now)
  const nowPct = nowIdx >= 0 ? ((nowIdx + 0.5) / months.length) * 100 : -1

  // Year boundary positions
  const yearBoundaries = useMemo(() => {
    const seen = new Set<string>()
    return months.reduce<{ label: string; pct: number }[]>((acc, m, i) => {
      const year = m.slice(0, 4)
      if (!seen.has(year)) {
        seen.add(year)
        acc.push({ label: year, pct: (i / months.length) * 100 })
      }
      return acc
    }, [])
  }, [months])

  const visibleProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (brandFilter !== 'both' && p.frontendBrand !== brandFilter) return false
        if (p.status === 'cancelled') return false
        // overlaps with window
        return p.startMonth <= endMonth && p.endMonth >= startMonth
      })
      .sort((a, b) => a.startMonth.localeCompare(b.startMonth))
  }, [projects, brandFilter, startMonth, endMonth])

  function barPosition(p: Project) {
    const clampedStart = p.startMonth < startMonth ? startMonth : p.startMonth
    const clampedEnd   = p.endMonth   > endMonth   ? endMonth   : p.endMonth

    const si = months.indexOf(clampedStart)
    const ei = months.indexOf(clampedEnd)

    if (si === -1 && ei === -1) return null

    const sIdx = si >= 0 ? si : 0
    const eIdx = ei >= 0 ? ei : months.length - 1

    const left  = (sIdx / months.length) * 100
    const width = ((eIdx - sIdx + 1) / months.length) * 100

    return { left, width }
  }

  if (!visibleProjects.length) {
    return (
      <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-muted)' }}>
        No projects in this range.
      </div>
    )
  }

  const ROW_H = 34

  return (
    <div className="overflow-x-auto select-none">
      {/* Header — month labels */}
      <div className="relative" style={{ marginLeft: 0 }}>
        {/* Year markers */}
        {yearBoundaries.map(({ label, pct }) => (
          <div
            key={label}
            className="absolute top-0 text-[10px] font-bold uppercase tracking-wider"
            style={{ left: `${pct}%`, color: 'var(--text-faint)', transform: 'translateX(-2px)' }}
          >
            {label}
          </div>
        ))}
        {/* Month ticks */}
        <div className="flex mt-4 mb-2">
          {months.map((m) => (
            <div
              key={m}
              className="flex-1 text-center text-[9px] uppercase tracking-wide"
              style={{ color: 'var(--text-faint)' }}
            >
              {new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short' })}
            </div>
          ))}
        </div>
      </div>

      {/* Gantt body */}
      <div className="relative" style={{ marginLeft: 0 }}>
        {/* Month grid lines */}
        <div className="absolute inset-0 flex pointer-events-none" style={{ zIndex: 0 }}>
          {months.map((m, i) => (
            <div
              key={m}
              className="flex-1 border-l"
              style={{ borderColor: i === 0 ? 'transparent' : 'var(--border)' }}
            />
          ))}
        </div>

        {/* Current month line */}
        {nowPct >= 0 && nowPct <= 100 && (
          <div
            className="absolute top-0 bottom-0 w-px z-10"
            style={{
              left: `${nowPct}%`,
              background: 'rgba(124,58,237,0.6)',
              boxShadow: '0 0 6px rgba(124,58,237,0.4)',
            }}
          />
        )}

        {/* Project rows */}
        {visibleProjects.map((p, i) => {
          const pos = barPosition(p)
          if (!pos) return null

          const col = brandColor[p.frontendBrand] ?? brandColor['DCT']!
          const opacity = statusOpacity[p.status] ?? 0.6
          const dash = statusDash[p.status] ?? '0'
          const totalHours = allocations
            .filter((a) => a.projectId === p.id)
            .reduce((s, a) => s + a.hours, 0)

          const isNarrow = pos.width < 12

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scaleX: 0.85 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
              style={{ height: ROW_H, marginBottom: 3 }}
            >
              <div
                className="absolute top-1 rounded-md flex items-center overflow-hidden group cursor-default"
                style={{
                  left: `${pos.left}%`,
                  width: `${pos.width}%`,
                  height: ROW_H - 8,
                  background: col.bar,
                  opacity,
                  outline: `1.5px ${dash !== '0' ? 'dashed' : 'solid'} ${col.border}`,
                  outlineOffset: -1,
                  transition: 'opacity 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = String(opacity) }}
                title={`${p.code} ${p.name} · ${p.status} · ${formatHours(totalHours)}`}
              >
                <span
                  className="px-2 text-[11px] font-semibold truncate whitespace-nowrap leading-none"
                  style={{ color: col.text }}
                >
                  {isNarrow ? p.code : `${p.code}  ${p.name}`}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>


      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pl-0 flex-wrap">
        {[
          { label: 'DCT', color: '#7c3aed' },
          { label: 'PLK', color: '#2563eb' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color, opacity: 0.6, outline: `1.5px solid ${color}` }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{label}</span>
          </div>
        ))}
        {[{ label: 'Planned', border: 'dashed' }, { label: 'Opportunity', border: 'dashed', opacity: '0.4' }].map(({ label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border border-dashed border-violet-500" style={{ opacity: 0.5 }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
