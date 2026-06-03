export function formatHours(hours: number): string {
  return `${Math.round(hours)}h`
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

export function formatFte(fte: number): string {
  return fte.toFixed(2)
}

/** Returns a CSS background colour for a utilisation ratio — used in heatmaps */
export function utilisationColor(ratio: number): string {
  if (ratio <= 0) return 'rgba(255,255,255,0.03)'
  if (ratio < 0.4) return 'rgba(30,58,138,0.6)'    // deep blue
  if (ratio < 0.6) return 'rgba(29,78,216,0.65)'    // blue
  if (ratio < 0.8) return 'rgba(5,150,105,0.7)'     // emerald
  if (ratio < 1.0) return 'rgba(217,119,6,0.72)'    // amber
  if (ratio <= 1.15) return 'rgba(234,88,12,0.78)'  // orange
  return 'rgba(220,38,38,0.85)'                      // red
}

/** Returns a text colour class for a utilisation ratio */
export function utilisationTextColor(ratio: number): string {
  if (ratio <= 0) return 'text-slate-700'
  if (ratio < 0.6) return 'text-blue-300'
  if (ratio < 0.85) return 'text-emerald-300'
  if (ratio < 1.0) return 'text-amber-300'
  if (ratio <= 1.15) return 'text-orange-300'
  return 'text-red-300'
}

/** Glow shadow for overloaded states */
export function utilisationGlow(ratio: number): string {
  if (ratio > 1.15) return '0 0 12px rgba(220,38,38,0.5)'
  if (ratio > 1.0) return '0 0 10px rgba(234,88,12,0.4)'
  return 'none'
}

export function utilisationBgColor(ratio: number): string {
  return utilisationColor(ratio)
}

export function statusLabel(ratio: number): string {
  if (ratio < 0.6) return 'Underused'
  if (ratio < 0.85) return 'Healthy'
  if (ratio < 1.0) return 'High'
  if (ratio <= 1.15) return 'Overloaded'
  return 'Critical'
}

export function statAccent(ratio: number): 'red' | 'amber' | 'emerald' | 'default' {
  if (ratio > 1.0) return 'red'
  if (ratio > 0.85) return 'amber'
  if (ratio > 0) return 'emerald'
  return 'default'
}
