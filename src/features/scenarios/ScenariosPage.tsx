import { useState } from 'react'
import { motion } from 'motion/react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { Scenario, CapacityAssumptions } from '../../types'
import { v4 as uuidv4 } from 'uuid'

export function ScenariosPage() {
  const { scenarios, activeScenarioId, addScenario, updateScenario, deleteScenario, setActiveScenario } = usePlannerStore()
  const [editing, setEditing] = useState<Scenario | null>(null)
  const [showForm, setShowForm] = useState(false)

  function handleDuplicate(s: Scenario) {
    addScenario({ ...s, id: uuidv4(), name: `${s.name} (copy)`, createdAt: new Date().toISOString(), basedOnScenarioId: s.id })
  }

  return (
    <PageLayout
      title="Scenarios"
      actions={<Button variant="primary" onClick={() => { setEditing(null); setShowForm(true) }}>+ New scenario</Button>}
    >
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg rounded-2xl p-6"
            style={{ background: '#0e0e1a', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-base font-semibold text-slate-200 mb-5">{editing ? 'Edit Scenario' : 'New Scenario'}</h2>
            <ScenarioForm
              initial={editing ?? undefined}
              onSave={(data) => {
                if (editing) updateScenario({ ...data, id: editing.id })
                else addScenario({ ...data, id: uuidv4() })
                setShowForm(false)
                setEditing(null)
              }}
              onCancel={() => { setShowForm(false); setEditing(null) }}
            />
          </motion.div>
        </div>
      )}

      <div className="space-y-px">
        {scenarios.map((s, i) => {
          const isActive = s.id === activeScenarioId
          const a = s.assumptions
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="group"
              style={{
                background: isActive ? 'rgba(139,92,246,0.06)' : 'transparent',
                border: isActive ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.04)',
                borderRadius: 12,
                padding: '20px 24px',
                marginBottom: 8,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${isActive ? 'text-violet-300' : 'text-slate-300'}`}>{s.name}</span>
                    {isActive && (
                      <span className="text-[10px] uppercase tracking-widest font-bold text-violet-400 border border-violet-500/40 px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(139,92,246,0.15)' }}>Active</span>
                    )}
                  </div>
                  {s.description && <p className="text-xs text-slate-600 mb-3">{s.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {[
                      ['FT h/wk', `${a.fullTimeHoursPerWeek}h`],
                      ['Leave', `${a.defaultLeaveDaysPerYear}d`],
                      ['Model', a.leaveModel],
                      ['Pub hols', `${a.publicHolidayDaysPerYear}d`],
                      ['Admin', `${a.adminManagementAllowancePercent}%`],
                      ['Max util', `${a.defaultMaxUtilisationPercent}%`],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div className="text-[10px] uppercase tracking-widest text-slate-700">{label}</div>
                        <div className="text-xs font-semibold tabular text-slate-400 mt-0.5">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!isActive && <Button size="sm" variant="primary" onClick={() => setActiveScenario(s.id)}>Use</Button>}
                  <Button size="sm" variant="secondary" onClick={() => handleDuplicate(s)}>Dupe</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(s); setShowForm(true) }}>Edit</Button>
                  {scenarios.length > 1 && <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete?')) deleteScenario(s.id) }}>Del</Button>}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </PageLayout>
  )
}

function ScenarioForm({ initial, onSave, onCancel }: { initial?: Scenario; onSave: (d: Omit<Scenario, 'id'>) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [ftHours, setFtHours] = useState(String(initial?.assumptions.fullTimeHoursPerWeek ?? 40))
  const [leaveDays, setLeaveDays] = useState(String(initial?.assumptions.defaultLeaveDaysPerYear ?? 25))
  const [leaveModel, setLeaveModel] = useState<'fixed-days' | 'pro-rated'>(initial?.assumptions.leaveModel ?? 'fixed-days')
  const [pubHols, setPubHols] = useState(String(initial?.assumptions.publicHolidayDaysPerYear ?? 0))
  const [adminPct, setAdminPct] = useState(String(initial?.assumptions.adminManagementAllowancePercent ?? 15))
  const [maxUtil, setMaxUtil] = useState(String(initial?.assumptions.defaultMaxUtilisationPercent ?? 100))
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!name.trim()) { setError('Name required'); return }
    const admin = Number(adminPct)
    if (admin < 0 || admin > 50) { setError('Admin % must be 0–50'); return }
    setError('')
    const assumptions: CapacityAssumptions = { fullTimeHoursPerWeek: Number(ftHours), defaultLeaveDaysPerYear: Number(leaveDays), leaveModel, publicHolidayDaysPerYear: Number(pubHols), adminManagementAllowancePercent: admin, defaultMaxUtilisationPercent: Number(maxUtil) }
    onSave({ name: name.trim(), description: description.trim() || undefined, createdAt: initial?.createdAt ?? new Date().toISOString(), basedOnScenarioId: initial?.basedOnScenarioId, assumptions })
  }

  return (
    <div className="flex flex-col gap-3">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="FT hours/week" type="number" value={ftHours} onChange={(e) => setFtHours(e.target.value)} />
        <Input label="Leave days/year" type="number" value={leaveDays} onChange={(e) => setLeaveDays(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Leave model</span>
          <select value={leaveModel} onChange={(e) => setLeaveModel(e.target.value as 'fixed-days' | 'pro-rated')}
            className="rounded-lg px-3 py-2 text-sm text-slate-300"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="fixed-days" style={{ background: '#0e0e1a' }}>Fixed days</option>
            <option value="pro-rated" style={{ background: '#0e0e1a' }}>Pro-rated</option>
          </select>
        </div>
        <Input label="Public holidays/year" type="number" value={pubHols} onChange={(e) => setPubHols(e.target.value)} />
        <Input label="Admin allowance %" type="number" value={adminPct} onChange={(e) => setAdminPct(e.target.value)} />
        <Input label="Max utilisation %" type="number" value={maxUtil} onChange={(e) => setMaxUtil(e.target.value)} />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  )
}
