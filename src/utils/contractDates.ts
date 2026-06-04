import type { Resource } from '../types'

const CONTRACT_TYPES = new Set<string>(['contractor', 'freelancer'])

/** Returns true when a contractor/freelancer has allocations outside their contract window */
export function isOutsideContract(resource: Resource, month: string): boolean {
  if (!CONTRACT_TYPES.has(resource.employmentType)) return false
  if (!resource.contractStart && !resource.contractEnd) return false

  const [y, mo] = month.split('-').map(Number)
  const monthFirst = `${month}-01`
  const lastDay = new Date(y!, mo!, 0).getDate()
  const monthLast = `${month}-${String(lastDay).padStart(2, '0')}`

  if (resource.contractStart && resource.contractStart > monthLast) return true
  if (resource.contractEnd && resource.contractEnd < monthFirst) return true
  return false
}

export function fmtContractDate(d: string): string {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [y, m, day] = d.split('-')
  return `${parseInt(day!)} ${MONTHS[parseInt(m!) - 1]} ${y}`
}
