import { type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          {label}
        </span>
      )}
      <select
        {...props}
        className={`rounded-lg px-3 py-2 text-sm text-slate-300 transition-all duration-150 appearance-none ${className}`}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: '#0e0e1a' }}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
