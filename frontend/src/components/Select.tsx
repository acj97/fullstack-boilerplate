import { ChevronDown, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export type SelectOption<T extends string> = {
  label: string
  value: T
}

type SelectProps<T extends string> = {
  options: SelectOption<T>[]
  value: T | null
  onChange: (value: T | null) => void
  placeholder?: string
}

export function Select<T extends string>({ options, value, onChange, placeholder = 'All' }: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (val: T | null) => {
    onChange(val)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-sm bg-surface transition-colors cursor-pointer
          ${open ? 'border-border-strong text-ink' : 'border-border text-ink-2 hover:border-border-strong hover:text-ink'}`}
      >
        <span className={selected ? 'text-ink' : 'text-muted'}>{selected?.label ?? placeholder}</span>
        {value !== null ? (
          <X
            size={13}
            className="text-muted-2 hover:text-danger transition-colors"
            onClick={(e) => { e.stopPropagation(); handleSelect(null) }}
          />
        ) : (
          <ChevronDown size={13} className={`text-muted-2 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-full border border-border bg-surface shadow-sm rounded-sm overflow-hidden">
          <button
            onClick={() => handleSelect(null)}
            className="w-full text-left px-3 py-2 text-sm text-muted hover:bg-soft transition-colors"
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors
                ${value === opt.value ? 'bg-accent-soft text-accent-ink font-medium' : 'text-ink-2 hover:bg-soft'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
