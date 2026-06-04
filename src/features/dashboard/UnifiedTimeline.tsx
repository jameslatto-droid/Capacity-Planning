import { useMemo } from 'react'
import { motion } from 'motion/react'
import type { Resource, Project, Allocation, CapacityAssumptions, LeaveEntry } from '../../types'
import { calculatePersonUtilisation, calculateTeamUtilisation } from '../../domain/utilisation/utilisationCalculations'
import { formatPercent, utilisationColor } from '../../utils/format'
import { isOutsideContract } from '../../utils/contractDates'
import { currentMonth } from '../../utils/months'

const LABEL_W = 140
const COL_MIN_W = 60

const brandColor = {
  DCT: { bar: 'rgba(124,58,237,0.55)', border: '#7c3aed', text: '#ede9fe' },
  PLK: { bar: 'rgba(37,99,235,0.55)', border: '#2563eb', text: '#dbeafe' },
} as const

const statusOpacity: Record<string, number> = {
  active: 1, planned: 0.75, opportunity: 0.45, 'on-hold': 0.3, complete: 0.25, cancelled: 0.15,
}

interface UtilCellProps {
  util: number
  isNow: boolean
  isTeam?: boolean
  warning?: boolean
}

function UtilCell({ util, isNow, isTeam = false, warning = false }: UtilCellProps) {
  const textColor =
    util <= 0   ? 'var(--text-faint)'
    : util < 0.6  ? '#93c5fd'
    : util < 0.85 ? '#6ee7b7'
    : util < 1.0  ? '#fcd34d'
    : util < 1.15 ? '#fb923c'
    : '#f87171'

  return (
    <div
      title={warning ? 'Allocated outside contract period' : undefined}
      style={{
        background: utilisationColor(util),
        color: warning ? '#fbbf24' : textColor,
        height: 26,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        fontSize: 10,
        fontWeight: isTeam ? 700 : 500,
        fontVariantNumeric: 'tabular-nums',
        boxShadow: isNow ? 'inset 0 0 0 1px rgba(124,58,237,0.5)' : 'none',
        outline: warning ? '1.5px dashed rgba(245,158,11,0.75)' : 'none',
        outlineOffset: -1,
      }}
    >
      {warning && <span style={{ fontSize: 8, lineHeight: 1 }}>⚠</span>}
      {util > 0 ? formatPercent(util) : '—'}
    </div>
  )
}

interface Props {
  resources: Resource[]
  projects: Project[]
  allocations: Allocation[]
  assumptions: CapacityAssumptions
  months: string[]
  leaveEntries: LeaveEntry[]
  startMonth: string
  endMonth: string
}

export function UnifiedTimeline({
  resources, projects, allocations, assumptions, months, leaveEntries, startMonth, endMonth,
}: Props) {
  const now = currentMonth()
  const nowIdx = months.indexOf(now)
  const nowPct = nowIdx >= 0 ? ((nowIdx + 0.5) / months.length) * 100 : -1

  const teamData = useMemo(
    () => months.map(m => calculateTeamUtilisation(resources, allocations, assumptions, m, leaveEntries)),
    [resources, allocations, assumptions, months, leaveEntries],
  )

  const personData = useMemo(
    () => resources.map(r => ({
      resource: r,
      cells: months.map(m => calculatePersonUtilisation(r, allocations, assumptions, m, leaveEntries)),
    })),
    [resources, allocations, assumptions, months, leaveEntries],
  )

  const visibleProjects = useMemo(
    () => projects
      .filter(p => p.status !== 'cancelled' && p.startMonth <= endMonth && p.endMonth >= startMonth)
      .sort((a, b) => a.startMonth.localeCompare(b.startMonth)),
    [projects, startMonth, endMonth],
  )

  const gridCols = `${LABEL_W}px repeat(${months.length}, minmax(${COL_MIN_W}px, 1fr))`
  const minWidth = LABEL_W + months.length * COL_MIN_W

  function barPos(p: Project) {
    const cs = p.startMonth < startMonth ? startMonth : p.startMonth
    const ce = p.endMonth > endMonth ? endMonth : p.endMonth
    const si = months.indexOf(cs)
    const ei = months.indexOf(ce)
    const sIdx = si >= 0 ? si : 0
    const eIdx = ei >= 0 ? ei : months.length - 1
    return {
      left: (sIdx / months.length) * 100,
      width: ((eIdx - sIdx + 1) / months.length) * 100,
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflowX: 'auto' }}
    >
      <div style={{ minWidth }}>

        {/* ── Month header ── */}
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, marginBottom: 3 }}>
          <div /> {/* spacer */}
          {months.map((m, i) => {
            const prevYear = i > 0 ? months[i - 1]!.slice(0, 4) : null
            const showYear = i === 0 || (prevYear !== m.slice(0, 4))
            const monthLabel = new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short' })
            return (
              <div
                key={m}
                style={{
                  textAlign: 'center',
                  paddingBottom: 4,
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: m === now ? 'var(--accent-text)' : 'var(--text-faint)',
                }}
              >
                {showYear && (
                  <div style={{ fontSize: 8, opacity: 0.6, marginBottom: 1 }}>{m.slice(0, 4)}</div>
                )}
                {monthLabel}
              </div>
            )
          })}
        </div>

        {/* ── Team row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '1px', marginBottom: 1 }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              paddingRight: 10, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)',
            }}
          >
            Team
          </div>
          {teamData.map((data, i) => (
            <UtilCell key={months[i]} util={data.utilisation} isNow={months[i] === now} isTeam />
          ))}
        </div>

        {/* Gap after team */}
        <div style={{ height: 3 }} />

        {/* ── Person rows ── */}
        {personData.map(({ resource, cells }) => (
          <div
            key={resource.id}
            style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '1px', marginBottom: 1 }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: 10, fontSize: 10, color: 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {resource.displayName}
            </div>
            {cells.map((result, i) => (
              <UtilCell
                key={months[i]}
                util={result.utilisation}
                isNow={months[i] === now}
                warning={result.allocatedHours > 0 && isOutsideContract(resource, months[i]!)}
              />
            ))}
          </div>
        ))}

        {/* ── Projects section ── */}
        {visibleProjects.length > 0 && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 0 8px' }} />
            <div
              style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--text-faint)', marginBottom: 6,
              }}
            >
              Portfolio
            </div>

            {visibleProjects.map(p => {
              const pos = barPos(p)
              const col = brandColor[p.frontendBrand] ?? brandColor.DCT
              const opacity = statusOpacity[p.status] ?? 0.6

              return (
                <div key={p.id} style={{ display: 'flex', height: 26, marginBottom: 2 }}>
                  {/* Label */}
                  <div
                    style={{
                      width: LABEL_W, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      paddingRight: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10, fontWeight: 500, color: col.border,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                      title={`${p.code} ${p.name}`}
                    >
                      {p.code}
                    </span>
                  </div>

                  {/* Timeline container */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    {/* Month grid lines */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' }}>
                      {months.map((_, mi) => (
                        <div
                          key={mi}
                          style={{
                            flex: 1,
                            borderLeft: mi === 0 ? 'none' : '1px solid var(--border)',
                          }}
                        />
                      ))}
                    </div>

                    {/* Now line */}
                    {nowPct >= 0 && (
                      <div
                        style={{
                          position: 'absolute', top: 0, bottom: 0, width: 1, zIndex: 5,
                          left: `${nowPct}%`,
                          background: 'rgba(124,58,237,0.5)',
                          boxShadow: '0 0 4px rgba(124,58,237,0.3)',
                        }}
                      />
                    )}

                    {/* Bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${pos.left}%`,
                        width: `${pos.width}%`,
                        top: 2, bottom: 2,
                        background: col.bar,
                        opacity,
                        borderRadius: 6,
                        outline: `1.5px solid ${col.border}`,
                        outlineOffset: -1,
                        display: 'flex', alignItems: 'center', overflow: 'hidden',
                        transition: 'opacity 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = String(opacity) }}
                      title={`${p.code} ${p.name} · ${p.status}`}
                    >
                      <span
                        style={{
                          padding: '0 8px', fontSize: 10, fontWeight: 600,
                          color: col.text,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        {pos.width > 12 ? `${p.code}  ${p.name}` : p.code}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </motion.div>
  )
}
