import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { v4 as uuidv4 } from 'uuid'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import {
  getLeaveDaysInMonth,
  getEntryWorkingDays,
  countWorkingDays,
} from '../../domain/capacity/leaveCalculations'
import { generateMonthRange, formatMonth, currentMonth } from '../../utils/months'
import type { LeaveEntry, LeaveType } from '../../types'
import { LEAVE_TYPE_LABELS } from '../../types'

const MONTHS = generateMonthRange('2026-01', '2026-12')

const LEAVE_TYPES = Object.entries(LEAVE_TYPE_LABELS) as [LeaveType, string][]

const typeColor: Record<LeaveType, string> = {
  'annual':         'rgba(37,99,235,0.7)',
  'sick':           'rgba(217,119,6,0.7)',
  'public-holiday': 'rgba(124,58,237,0.7)',
  'unpaid':         'rgba(107,114,128,0.7)',
  'other':          'rgba(75,85,99,0.6)',
}
const typeTextColor: Record<LeaveType, string> = {
  'annual':         '#93c5fd',
  'sick':           '#fde68a',
  'public-holiday': '#c4b5fd',
  'unpaid':         '#d1d5db',
  'other':          '#9ca3af',
}

interface LeaveFormState {
  resourceId: string
  type: LeaveType
  startDate: string
  endDate: string
  notes: string
}

function emptyForm(defaultResourceId = ''): LeaveFormState {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  return { resourceId: defaultResourceId, type: 'annual', startDate: today, endDate: today, notes: '' }
}

export function LeavePage() {
  const { resources, leaveEntries, addLeaveEntry, updateLeaveEntry, deleteLeaveEntry } = usePlannerStore()

  const [viewStart, setViewStart] = useState('2026-06')
  const [viewEnd,   setViewEnd]   = useState('2026-12')
  const [showForm,  setShowForm]  = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form,      setForm]      = useState<LeaveFormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [filterResource, setFilterResource] = useState('all')

  const viewMonths = useMemo(() => generateMonthRange(viewStart, viewEnd), [viewStart, viewEnd])
  const activeResources = resources.filter((r) => r.active)

  // Who's off this month (current month)
  const now = currentMonth()
  const outThisMonth = useMemo(() => {
    return activeResources
      .map((r) => {
        const days = getLeaveDaysInMonth(r, now, leaveEntries)
        const entries = leaveEntries.filter((e) => {
          if (e.resourceId !== r.id) return false
          const s = new Date(e.startDate + 'T00:00:00')
          const end2 = new Date(e.endDate   + 'T00:00:00')
          const [y, m] = now.split('-').map(Number)
          const ms = new Date(y!, m! - 1, 1)
          const me = new Date(y!, m!, 0)
          return s <= me && end2 >= ms
        })
        return { resource: r, days, entries }
      })
      .filter((x) => x.days > 0)
  }, [activeResources, leaveEntries, now])

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm(filterResource !== 'all' ? filterResource : ''))
    setFormError('')
    setShowForm(true)
  }
  function openEdit(entry: LeaveEntry) {
    setEditingId(entry.id)
    setForm({
      resourceId: entry.resourceId,
      type: entry.type,
      startDate: entry.startDate,
      endDate: entry.endDate,
      notes: entry.notes ?? '',
    })
    setFormError('')
    setShowForm(true)
  }

  function handleSave() {
    if (!form.resourceId) { setFormError('Select a person'); return }
    if (!form.startDate || !form.endDate) { setFormError('Enter both dates'); return }
    if (form.startDate > form.endDate) { setFormError('Start must be before end'); return }
    setFormError('')
    const payload: LeaveEntry = {
      id: editingId ?? uuidv4(),
      resourceId: form.resourceId,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    }
    if (editingId) updateLeaveEntry(payload)
    else addLeaveEntry(payload)
    setShowForm(false)
  }

  const computedDays = form.startDate && form.endDate && form.startDate <= form.endDate
    ? countWorkingDays(form.startDate, form.endDate)
    : 0

  const resourceOptions = [
    { value: 'all', label: 'All people' },
    ...activeResources.map((r) => ({ value: r.id, label: r.displayName })),
  ]

  const filteredEntries = useMemo(() =>
    leaveEntries
      .filter((e) => filterResource === 'all' || e.resourceId === filterResource)
      .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [leaveEntries, filterResource]
  )

  const ROW = { borderBottom: '1px solid var(--row-divider)' }

  return (
    <PageLayout
      title="Leave Tracker"
      subtitle="Recorded leave is reflected in capacity calculations across the app"
      actions={<Button variant="primary" onClick={openAdd}>+ Add leave</Button>}
    >
      {/* Add / Edit modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-s)' }}
            >
              <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text)' }}>
                {editingId ? 'Edit Leave' : 'Add Leave'}
              </h2>
              <div className="flex flex-col gap-3">
                <Select
                  label="Person"
                  value={form.resourceId}
                  onChange={(e) => setForm((f) => ({ ...f, resourceId: e.target.value }))}
                  options={[{ value: '', label: 'Select person…' }, ...activeResources.map((r) => ({ value: r.id, label: r.displayName }))]}
                />
                <Select
                  label="Type"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LeaveType }))}
                  options={LEAVE_TYPES.map(([v, l]) => ({ value: v, label: l }))}
                />
                <div className="flex gap-3">
                  <Input label="From" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                  <Input label="To"   type="date" value={form.endDate}   onChange={(e) => setForm((f) => ({ ...f, endDate:   e.target.value }))} />
                </div>
                {computedDays > 0 && (
                  <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
                    {computedDays} working {computedDays === 1 ? 'day' : 'days'}
                    {form.resourceId && (() => {
                      const r = resources.find((x) => x.id === form.resourceId)
                      if (r && r.workingDaysPerWeek < 5) {
                        const actual = Math.round(computedDays * (r.workingDaysPerWeek / 5) * 10) / 10
                        return ` → ${actual} days for ${r.displayName} (${r.workingDaysPerWeek}-day week)`
                      }
                      return null
                    })()}
                  </div>
                )}
                <Input label="Notes (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                {formError && <p className="text-xs text-red-500">{formError}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-4 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Save</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Who's out this month */}
      {outThisMonth.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-faint)' }}>
            Out this month — {formatMonth(now)}
          </div>
          <div className="flex flex-wrap gap-2">
            {outThisMonth.map(({ resource, days, entries }) => (
              <div
                key={resource.id}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--text)' }}>{resource.displayName}</span>
                <span style={{ color: 'var(--text-muted)' }}>{days}d</span>
                {entries.map((e) => (
                  <span key={e.id} className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: typeColor[e.type], color: typeTextColor[e.type] }}>
                    {LEAVE_TYPE_LABELS[e.type]}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Month-by-month grid */}
      <div className="mb-10">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Select label="From" value={viewStart} onChange={(e) => setViewStart(e.target.value)} options={MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))} />
          <Select label="To"   value={viewEnd}   onChange={(e) => setViewEnd(e.target.value)}   options={MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))} />
          <Select label="Person" value={filterResource} onChange={(e) => setFilterResource(e.target.value)} options={resourceOptions} />
        </div>

        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left pb-3 pr-4 font-semibold text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-faint)', minWidth: 150 }}>Person</th>
                {viewMonths.map((m) => (
                  <th key={m} className="text-center pb-3 px-2 font-semibold text-[10px] uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-faint)', minWidth: 56 }}>
                    {new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeResources
                .filter((r) => filterResource === 'all' || r.id === filterResource)
                .map((r) => {
                  const hasAny = viewMonths.some((m) => getLeaveDaysInMonth(r, m, leaveEntries) > 0)
                  return (
                    <tr key={r.id} style={ROW}>
                      <td className="py-2.5 pr-4 font-medium" style={{ color: hasAny ? 'var(--text)' : 'var(--text-muted)' }}>
                        {r.displayName}
                      </td>
                      {viewMonths.map((m) => {
                        const days = getLeaveDaysInMonth(r, m, leaveEntries)
                        const monthEntries = leaveEntries.filter((e) => {
                          if (e.resourceId !== r.id) return false
                          const [y, mo] = m.split('-').map(Number)
                          const ms2 = new Date(y!, mo! - 1, 1)
                          const me2 = new Date(y!, mo!, 0)
                          return new Date(e.startDate + 'T00:00:00') <= me2 && new Date(e.endDate + 'T00:00:00') >= ms2
                        })
                        const mainType = monthEntries[0]?.type
                        return (
                          <td key={m} className="px-2 py-2 text-center">
                            {days > 0 ? (
                              <button
                                onClick={() => monthEntries[0] && openEdit(monthEntries[0])}
                                className="rounded-md text-[10px] font-bold w-full py-1 transition-all heatmap-cell"
                                style={{
                                  background: mainType ? typeColor[mainType] : 'rgba(37,99,235,0.5)',
                                  color: mainType ? typeTextColor[mainType] : '#93c5fd',
                                }}
                                title={monthEntries.map((e) => `${LEAVE_TYPE_LABELS[e.type]}: ${e.startDate} – ${e.endDate}`).join('\n')}
                              >
                                {days}d
                              </button>
                            ) : (
                              <button
                                onClick={() => { setForm({ ...emptyForm(r.id), resourceId: r.id }); setEditingId(null); setFormError(''); setShowForm(true) }}
                                className="rounded-md w-full py-1 text-[10px] opacity-0 hover:opacity-100 transition-opacity"
                                style={{ background: 'var(--surface-2)', color: 'var(--text-faint)' }}
                                title="Add leave"
                              >
                                +
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave entry list */}
      <div>
        <div className="text-[10px] uppercase tracking-widest font-semibold mb-4" style={{ color: 'var(--text-faint)' }}>
          All Leave Entries {filteredEntries.length > 0 && `· ${filteredEntries.length}`}
        </div>
        {filteredEntries.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No leave entries recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Person', 'Type', 'From', 'To', 'Days', 'Notes', ''].map((h, i) => (
                  <th key={h + i} className={`pb-3 text-[10px] uppercase tracking-widest font-semibold ${i === 0 || i === 5 ? 'text-left' : 'text-center'} ${i >= 6 ? '' : 'pr-3'}`}
                    style={{ color: 'var(--text-faint)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => {
                const r = resources.find((x) => x.id === entry.resourceId)
                const days = r ? getEntryWorkingDays(entry, r) : countWorkingDays(entry.startDate, entry.endDate)
                return (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={ROW}
                    className="group"
                  >
                    <td className="py-2.5 pr-3 font-medium" style={{ color: 'var(--text)' }}>{r?.displayName ?? '—'}</td>
                    <td className="py-2.5 pr-3 text-center">
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: typeColor[entry.type], color: typeTextColor[entry.type] }}>
                        {LEAVE_TYPE_LABELS[entry.type]}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-center tabular text-xs" style={{ color: 'var(--text-muted)' }}>{entry.startDate}</td>
                    <td className="py-2.5 pr-3 text-center tabular text-xs" style={{ color: 'var(--text-muted)' }}>{entry.endDate}</td>
                    <td className="py-2.5 pr-3 text-center font-semibold tabular" style={{ color: 'var(--text)' }}>{days}</td>
                    <td className="py-2.5 pr-3 text-xs" style={{ color: 'var(--text-muted)' }}>{entry.notes ?? ''}</td>
                    <td className="py-2.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(entry)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete this leave entry?')) deleteLeaveEntry(entry.id) }}>Del</Button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </PageLayout>
  )
}
