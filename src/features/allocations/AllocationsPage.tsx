import { useState } from 'react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Select } from '../../components/ui/Select'
import { formatMonth, generateMonthRange } from '../../utils/months'
import { AllocationMatrixByPerson } from './AllocationMatrixByPerson'

type ViewMode = 'person' | 'project' | 'role'

const MONTHS = generateMonthRange('2025-01', '2025-12')

export function AllocationsPage() {
  const { scenarios, activeScenarioId } = usePlannerStore()
  const [scenarioId, setScenarioId] = useState(activeScenarioId)
  const [viewMode, setViewMode] = useState<ViewMode>('person')
  const [startMonth, setStartMonth] = useState('2025-04')
  const [endMonth, setEndMonth] = useState('2025-09')

  const scenarioOptions = scenarios.map((s) => ({ value: s.id, label: s.name }))
  const monthOptions = MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))

  return (
    <PageLayout title="Allocations">
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <Select label="Scenario" value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} options={scenarioOptions} />
        <Select label="From" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} options={monthOptions} />
        <Select label="To" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} options={monthOptions} />
        <div className="flex gap-1 self-end">
          {(['person', 'project', 'role'] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 rounded text-sm font-medium capitalize transition-colors ${
                viewMode === m ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              By {m}
            </button>
          ))}
        </div>
      </div>

      <AllocationMatrixByPerson
        scenarioId={scenarioId}
        startMonth={startMonth}
        endMonth={endMonth}
        viewMode={viewMode}
      />
    </PageLayout>
  )
}
