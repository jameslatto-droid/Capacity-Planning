import { useState } from 'react'
import type { Resource, ResourceRole, EmploymentType } from '../../types'
import { ALL_ROLES, ROLE_LABELS } from '../../types'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'

interface Props {
  initial?: Resource
  onSave: (data: Omit<Resource, 'id'>) => void
  onCancel: () => void
}

const roleOptions = ALL_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))
const employmentOptions = [
  { value: 'employee', label: 'Employee' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'placeholder', label: 'Placeholder' },
]

export function ResourceForm({ initial, onSave, onCancel }: Props) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '')
  const [role, setRole] = useState<ResourceRole>(initial?.role ?? 'other')
  const [secondaryRoles, setSecondaryRoles] = useState<ResourceRole[]>(initial?.secondaryRoles ?? [])
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initial?.employmentType ?? 'employee')
  const [contractHours, setContractHours] = useState(String(initial?.contractHoursPerWeek ?? 40))
  const [workingDays, setWorkingDays] = useState(String(initial?.workingDaysPerWeek ?? 5))
  const [active, setActive] = useState(initial?.active ?? true)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')

  function toggleSecondaryRole(r: ResourceRole) {
    setSecondaryRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])
  }

  function handleSubmit() {
    const hours = Number(contractHours)
    const days = Number(workingDays)
    if (!displayName.trim()) { setError('Name required'); return }
    if (hours <= 0) { setError('Contract hours must be > 0'); return }
    if (days < 1 || days > 7) { setError('Working days must be 1–7'); return }
    setError('')
    onSave({
      displayName: displayName.trim(),
      role,
      secondaryRoles: secondaryRoles.length ? secondaryRoles : undefined,
      employmentType,
      contractHoursPerWeek: hours,
      workingDaysPerWeek: days,
      fullTimeHoursPerWeek: 40,
      active,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Input label="Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as ResourceRole)} options={roleOptions} />
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>Secondary Roles</div>
        <div className="flex flex-wrap gap-3">
          {ALL_ROLES.filter((r) => r !== role).map((r) => (
            <label key={r} className="flex items-center gap-1.5 text-xs cursor-pointer transition-colors" style={{ color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={secondaryRoles.includes(r)} onChange={() => toggleSecondaryRole(r)} className="accent-violet-500" />
              {ROLE_LABELS[r]}
            </label>
          ))}
        </div>
      </div>
      <Select label="Employment Type" value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} options={employmentOptions} />
      <div className="flex gap-3">
        <Input label="Contract h/week" type="number" value={contractHours} onChange={(e) => setContractHours(e.target.value)} />
        <Input label="Working days/week" type="number" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}>
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-violet-500" />
        Active
      </label>
      <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  )
}
