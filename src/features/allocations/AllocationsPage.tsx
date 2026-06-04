import { useState } from 'react'
import { motion } from 'motion/react'
import { usePlannerStore } from '../../store/plannerStore'
import { PageLayout } from '../../components/layout/PageLayout'
import { Select } from '../../components/ui/Select'
import { formatMonth, generateMonthRange } from '../../utils/months'
import { AllocationMatrixByPerson } from './AllocationMatrixByPerson'

type ViewMode = 'person' | 'project' | 'role'
type ValueMode = 'hours' | 'percent'
const MONTHS = generateMonthRange('2026-01', '2026-12')

export function AllocationsPage() {
  const { scenarios, activeScenarioId } = usePlannerStore()
  const [scenarioId, setScenarioId] = useState(activeScenarioId)
  const [viewMode, setViewMode] = useState<ViewMode>('person')
  const [valueMode, setValueMode] = useState<ValueMode>('hours')
  const [startMonth, setStartMonth] = useState('2026-06')
  const [endMonth, setEndMonth] = useState('2026-12')

  const scenarioOptions = scenarios.map((s) => ({ value: s.id, label: s.name }))
  const monthOptions = MONTHS.map((m) => ({ value: m, label: formatMonth(m) }))

  return (
    <PageLayout title="Allocations">
      <div className="flex flex-wrap items-end gap-4 mb-8">
        <Select label="Scenario" value={scenarioId} onChange={(e) => setScenarioId(e.target.value)} options={scenarioOptions} />
        <Select label="From" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} options={monthOptions} />
        <Select label="To" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} options={monthOptions} />
        <div className="flex gap-1 self-end">
          {(['person', 'project', 'role'] as ViewMode[]).map((m) => (
            <motion.button
              key={m}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setViewMode(m)}
              className="px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all duration-150"
              style={{
                background: viewMode === m ? 'var(--accent-light)' : 'var(--surface-2)',
                border: viewMode === m ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(139,92,246,0.15)',
                color: viewMode === m ? 'var(--accent-text)' : 'var(--text-muted)',
                boxShadow: viewMode === m ? '0 0 12px rgba(139,92,246,0.2)' : 'none',
              }}
            >
              By {m}
            </motion.button>
          ))}
        </div>

        {/* h / % toggle */}
        <div className="flex gap-0.5 self-end" style={{ marginLeft: 4 }}>
          {(['hours', 'percent'] as ValueMode[]).map((v) => (
            <motion.button
              key={v}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setValueMode(v)}
              className="px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150"
              style={{
                background: valueMode === v ? 'var(--accent-light)' : 'var(--surface-2)',
                border: valueMode === v ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(139,92,246,0.15)',
                color: valueMode === v ? 'var(--accent-text)' : 'var(--text-muted)',
                boxShadow: valueMode === v ? '0 0 12px rgba(139,92,246,0.2)' : 'none',
              }}
            >
              {v === 'hours' ? 'h' : '%'}
            </motion.button>
          ))}
        </div>
      </div>
      <AllocationMatrixByPerson scenarioId={scenarioId} startMonth={startMonth} endMonth={endMonth} viewMode={viewMode} valueMode={valueMode} />
    </PageLayout>
  )
}
