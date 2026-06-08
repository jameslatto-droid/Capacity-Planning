import { useState } from 'react'
import { usePlannerStore } from '../store/plannerStore'
import { addMonths, currentMonth } from './months'

export function useDateRange() {
  const { projects } = usePlannerStore()

  const startMonths = projects.map((p) => p.startMonth).filter(Boolean).sort()
  const endMonths = projects.map((p) => p.endMonth).filter(Boolean).sort()

  const minMonth = startMonths[0] ?? addMonths(currentMonth(), -12)
  const maxMonth = endMonths.length ? addMonths(endMonths[endMonths.length - 1]!, 6) : addMonths(currentMonth(), 18)

  const defaultStart = addMonths(currentMonth(), -1)
  const defaultEnd = addMonths(currentMonth(), 6)

  const [startMonth, setStartMonth] = useState(defaultStart)
  const [endMonth, setEndMonth] = useState(defaultEnd)

  return { startMonth, endMonth, setStartMonth, setEndMonth, minMonth, maxMonth }
}
