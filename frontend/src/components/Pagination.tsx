import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

function getPages(current: number, total: number): (number | '...')[] {
  const t = Math.max(total, 1)
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', t]
  if (current >= t - 3) return [1, '...', t - 4, t - 3, t - 2, t - 1, t]
  return [1, '...', current - 1, current, current + 1, '...', t]
}

export function Pagination({ page, totalPages, onPageChange, disabled = false }: PaginationProps) {
  const isEmpty = totalPages <= 1
  const pages = getPages(page, totalPages)
  const btnBase =
    'flex items-center justify-center size-9 text-sm border rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || disabled || isEmpty}
        className={`${btnBase} border-border text-ink-2 hover:border-border-strong hover:text-ink cursor-pointer`}
      >
        <ChevronLeft size={14} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex items-center justify-center size-9 text-sm text-muted-2 select-none"
          >
            ···
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p as number)}
            disabled={disabled || isEmpty}
            className={`${btnBase} cursor-pointer ${
              p === page
                ? 'border-border-strong bg-ink text-bg font-medium'
                : 'border-border text-ink-2 hover:border-border-strong hover:text-ink'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || disabled || isEmpty}
        className={`${btnBase} border-border text-ink-2 hover:border-border-strong hover:text-ink cursor-pointer`}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
