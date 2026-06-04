import { type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className = '', style: extStyle, ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          {label}
        </span>
      )}
      <select
        {...props}
        className={`rounded-lg px-3 py-2 text-sm transition-all appearance-none ${className}`}
        style={{
          background: 'var(--input-bg)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          ...extStyle,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: 'var(--surface)' }}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
