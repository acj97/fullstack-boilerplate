import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

export type Column<T> = {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

type TableProps<T> = {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  sortKey?: string
  sortDir?: 'asc' | 'desc' | null
  onSort?: (key: string) => void
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  sortKey,
  sortDir,
  onSort,
}: TableProps<T>) {
  return (
    <div className="border border-border bg-surface overflow-x-auto">
      <table className="table min-w-max">
        <thead>
          <tr>
            {columns.map((col) => {
              const key = String(col.key)
              const isActive = sortKey === key
              return (
                <th key={key}>
                  {col.sortable ? (
                    <button
                      onClick={() => onSort?.(key)}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-ink transition-colors"
                    >
                      {col.label}
                      {isActive && sortDir === 'asc' && <ArrowUp size={13} />}
                      {isActive && sortDir === 'desc' && <ArrowDown size={13} />}
                      {!isActive && <ArrowUpDown size={13} className="opacity-40" />}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 3 }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col) => (
                  <td key={String(col.key)}>—</td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col) => (
                  <td key={String(col.key)}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
