export function exportCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0]!)
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = String(row[h] ?? '')
        return val.includes(',') ? `"${val}"` : val
      }).join(',')
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  downloadBlob(blob, filename)
}

export function exportJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
