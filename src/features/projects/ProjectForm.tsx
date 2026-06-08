import { useState } from 'react'
import type { Project, Resource, FrontendBrand, ProjectStatus, ProjectPriority, ProjectFlexibility, ProjectType } from '../../types'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { getProjectType } from '../../domain/projects/projectPlanning'

interface Props {
  initial?: Project
  resources: Resource[]
  onSave: (data: Omit<Project, 'id'>) => void
  onCancel: () => void
}

export function ProjectForm({ initial, resources, onSave, onCancel }: Props) {
  const [code, setCode] = useState(initial?.code ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [brand, setBrand] = useState<FrontendBrand>(initial?.frontendBrand ?? 'DCT')
  const [client, setClient] = useState(initial?.client ?? '')
  const [pm, setPm] = useState(initial?.projectManager ?? '')
  const [projectType, setProjectType] = useState<ProjectType>(initial ? getProjectType(initial) : 'live')
  const [includeInResourceCalculations, setIncludeInResourceCalculations] = useState(initial?.includeInResourceCalculations ?? true)
  const [status, setStatus] = useState<ProjectStatus>(initial?.status === 'opportunity' ? 'planned' : initial?.status ?? 'planned')
  const [priority, setPriority] = useState<ProjectPriority>(initial?.priority ?? 'medium')
  const [flexibility, setFlexibility] = useState<ProjectFlexibility>(initial?.flexibility ?? 'flexible')
  const [startMonth, setStartMonth] = useState(initial?.startMonth ?? '2026-01')
  const [endMonth, setEndMonth] = useState(initial?.endMonth ?? '2027-12')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!code.trim()) { setError('Code required'); return }
    if (!name.trim()) { setError('Name required'); return }
    if (startMonth > endMonth) { setError('Start must be before or equal to End'); return }
    setError('')
    onSave({
      code: code.trim(),
      name: name.trim(),
      frontendBrand: brand,
      client: client.trim() || undefined,
      projectManager: pm || undefined,
      projectType,
      includeInResourceCalculations: projectType === 'live' ? true : includeInResourceCalculations,
      status,
      priority,
      flexibility,
      startMonth,
      endMonth,
      notes: notes.trim() || undefined,
    })
  }

  const pmOptions = [{ value: '', label: '— None —' }, ...resources.filter((r) => r.active).map((r) => ({ value: r.id, label: r.displayName }))]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} className="w-36" />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
      </div>
      <div className="flex gap-3">
        <Select label="Brand" value={brand} onChange={(e) => setBrand(e.target.value as FrontendBrand)} options={[{ value: 'DCT', label: 'DCT' }, { value: 'PLK', label: 'PLK' }]} />
        <Select
          label="Type"
          value={projectType}
          onChange={(e) => {
            const next = e.target.value as ProjectType
            setProjectType(next)
            if (next === 'live') setIncludeInResourceCalculations(true)
          }}
          options={[{ value: 'live', label: 'Live' }, { value: 'opportunity', label: 'Opportunity' }]}
        />
      </div>
      {projectType === 'opportunity' && (
        <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Manpower</span>
          <button
            type="button"
            onClick={() => setIncludeInResourceCalculations((value) => !value)}
            className="relative h-7 w-24 rounded-full text-[11px] font-semibold transition-all"
            style={{
              background: includeInResourceCalculations ? 'rgba(5,150,105,0.18)' : 'rgba(107,114,128,0.18)',
              color: includeInResourceCalculations ? '#059669' : 'var(--text-muted)',
              border: `1px solid ${includeInResourceCalculations ? 'rgba(5,150,105,0.35)' : 'var(--border-s)'}`,
            }}
          >
            {includeInResourceCalculations ? 'Included' : 'Excluded'}
          </button>
        </div>
      )}
      <div className="flex gap-3">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} options={[{ value: 'planned', label: 'Planned' }, { value: 'active', label: 'Active' }, { value: 'on-hold', label: 'On Hold' }, { value: 'complete', label: 'Complete' }, { value: 'cancelled', label: 'Cancelled' }]} />
        <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as ProjectPriority)} options={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
      </div>
      <Select label="Flexibility" value={flexibility} onChange={(e) => setFlexibility(e.target.value as ProjectFlexibility)} options={[{ value: 'fixed', label: 'Fixed' }, { value: 'limited', label: 'Limited' }, { value: 'flexible', label: 'Flexible' }]} />
      <Input label="Client" value={client} onChange={(e) => setClient(e.target.value)} />
      <Select label="Project Manager" value={pm} onChange={(e) => setPm(e.target.value)} options={pmOptions} />
      <div className="flex gap-3">
        <Input label="Start month" type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} />
        <Input label="End month" type="month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} />
      </div>
      <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  )
}
