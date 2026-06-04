import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', style: extStyle, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          {label}
        </span>
      )}
      <input
        {...props}
        className={`rounded-lg px-3 py-2 text-sm transition-all ${className}`}
        style={{
          background: 'var(--input-bg)',
          border: `1px solid ${error ? 'rgba(220,38,38,0.5)' : 'var(--border)'}`,
          color: 'var(--text)',
          ...extStyle,
        }}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  )
}
