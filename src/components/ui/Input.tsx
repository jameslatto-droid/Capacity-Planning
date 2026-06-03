import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          {label}
        </span>
      )}
      <input
        {...props}
        className={`rounded-lg px-3 py-2 text-sm text-slate-200 transition-all duration-150 ${className}`}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
        }}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  )
}
