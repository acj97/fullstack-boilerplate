import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

function Input({ error, label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col">
      {label && <label className="text-ink-2 font-semibold text-sm">{label}</label>}
      <input
        className={`w-full border-0 border-b-[1.5px] bg-transparent py-3 text-base text-ink font-sans outline-none transition-[border-color] duration-180 placeholder:text-muted-2 ${
          error ? 'border-b-danger focus:border-b-danger' : 'border-b-border focus:border-b-ink'
        } ${className}`}
        {...props}
      />
      {error && <div className="flex items-center gap-1.5 mt-2 text-xs text-danger">{error}</div>}
    </div>
  )
}

export default Input
