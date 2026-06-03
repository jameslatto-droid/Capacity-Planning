import { useState } from 'react'
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
    const copy: Scenario = {
      ...s,
      id: uuidv4(),
      name: `${s.name} (copy)`,
      createdAt: new Date().toISOString(),
      basedOnScenarioId: s.id,
    }
    addScenario(copy)
  }

  return (
    <PageLayout
      title="Scenarios"
      actions={
        <Button variant="primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          + New Scenario
        </Button>
      }
    >
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Scenario' : 'New Scenario'}</h2>
            <ScenarioForm
              initial={editing ?? undefined}
              basedOn={editing?.basedOnScenarioId ? scenarios.find((s) => s.id === editing.basedOnScenarioId) : undefined}
              onSave={(data) => {
                if (editing) {
                  updateScenario({ ...data, id: editing.id })
                } else {
                  addScenario({ ...data, id: uuidv4() })
                }
                setShowForm(false)
                setEditing(null)
              }}
              onCancel={() => { setShowForm(false); setEditing(null) }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {scenarios.map((s) => {
          const a = s.assumptions
          const isActive = s.id === activeScenarioId
          return (
            <div key={s.id} className={`bg-white rounded-lg shadow-sm border p-4 ${isActive ? 'border-blue-400' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    {isActive && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Active</span>}
                  </div>
                  {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">Created {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  {!isActive && (
                    <Button size="sm" variant="primary" onClick={() => setActiveScenario(s.id)}>Use</Button>
                  )}
                  <Button size="sm" onClick={() => handleDuplicate(s)}>Duplicate</Button>
                  <Button size="sm" onClick={() => { setEditing(s); setShowForm(true) }}>Edit</Button>
                  {scenarios.length > 1 && (
                    <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete scenario?')) deleteScenario(s.id) }}>Del</Button>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                <AssumptionChip label="FT Hours/wk" value={`${a.fullTimeHoursPerWeek}h`} />
                <AssumptionChip label="Leave days" value={`${a.defaultLeaveDaysPerYear}d`} />
                <AssumptionChip label="Leave model" value={a.leaveModel} />
                <AssumptionChip label="Public hols" value={`${a.publicHolidayDaysPerYear}d`} />
                <AssumptionChip label="Admin %" value={`${a.adminManagementAllowancePercent}%`} />
                <AssumptionChip label="Max util" value={`${a.defaultMaxUtilisationPercent}%`} />
              </div>
            </div>
          )
        })}
      </div>
    </PageLayout>
  )
}

function AssumptionChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded p-2">
      <div className="text-gray-400">{label}</div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  )
}

interface FormProps {
  initial?: Scenario
  basedOn?: Scenario
  onSave: (data: Omit<Scenario, 'id'>) => void
  onCancel: () => void
}

function ScenarioForm({ initial, onSave, onCancel }: FormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [ftHours, setFtHours] = useState(String(initial?.assumptions.fullTimeHoursPerWeek ?? 40))
  const [leaveDays, setLeaveDays] = useState(String(initial?.assumptions.defaultLeaveDaysPerYear ?? 25))
  const [leaveModel, setLeaveModel] = useState<'fixed-days' | 'pro-rated'>(initial?.assumptions.leaveModel ?? 'pro-rated')
  const [pubHols, setPubHols] = useState(String(initial?.assumptions.publicHolidayDaysPerYear ?? 7))
  const [adminPct, setAdminPct] = useState(String(initial?.assumptions.adminManagementAllowancePercent ?? 15))
  const [maxUtil, setMaxUtil] = useState(String(initial?.assumptions.defaultMaxUtilisationPercent ?? 100))
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!name.trim()) { setError('Name required'); return }
    const admin = Number(adminPct)
    if (admin < 0 || admin > 50) { setError('Admin % must be 0–50'); return }
    setError('')
    const assumptions: CapacityAssumptions = {
      fullTimeHoursPerWeek: Number(ftHours),
      defaultLeaveDaysPerYear: Number(leaveDays),
      leaveModel: leaveModel as 'fixed-days' | 'pro-rated',
      publicHolidayDaysPerYear: Number(pubHols),
      adminManagementAllowancePercent: admin,
      defaultMaxUtilisationPercent: Number(maxUtil),
    }
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      basedOnScenarioId: initial?.basedOnScenarioId,
      assumptions,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Full-time hours/week" type="number" value={ftHours} onChange={(e) => setFtHours(e.target.value)} />
        <Input label="Leave days/year" type="number" value={leaveDays} onChange={(e) => setLeaveDays(e.target.value)} />
        <div>
          <label className="text-xs font-medium text-gray-600">Leave model</label>
          <select
            value={leaveModel}
            onChange={(e) => setLeaveModel(e.target.value as 'fixed-days' | 'pro-rated')}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="pro-rated">Pro-rated</option>
            <option value="fixed-days">Fixed days</option>
          </select>
        </div>
        <Input label="Public holidays/year" type="number" value={pubHols} onChange={(e) => setPubHols(e.target.value)} />
        <Input label="Admin/mgmt allowance %" type="number" value={adminPct} onChange={(e) => setAdminPct(e.target.value)} />
        <Input label="Max utilisation %" type="number" value={maxUtil} onChange={(e) => setMaxUtil(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  )
}
