export function formatHours(hours: number): string {
  return `${Math.round(hours)}h`
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

export function formatFte(fte: number): string {
  return fte.toFixed(2)
}

export function utilisationColor(utilisation: number): string {
  if (utilisation < 0.6) return 'text-blue-600'
  if (utilisation < 0.85) return 'text-green-600'
  if (utilisation < 1.0) return 'text-yellow-600'
  if (utilisation <= 1.15) return 'text-orange-600'
  return 'text-red-600'
}

export function utilisationBgColor(utilisation: number): string {
  if (utilisation < 0.6) return 'bg-blue-100 text-blue-800'
  if (utilisation < 0.85) return 'bg-green-100 text-green-800'
  if (utilisation < 1.0) return 'bg-yellow-100 text-yellow-800'
  if (utilisation <= 1.15) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

export function statusLabel(utilisation: number): string {
  if (utilisation < 0.6) return 'Underused'
  if (utilisation < 0.85) return 'Healthy'
  if (utilisation < 1.0) return 'High'
  if (utilisation <= 1.15) return 'Overloaded'
  return 'Critical'
}
