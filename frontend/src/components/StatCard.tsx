type StatCardProps = {
  label: string
  value: number | string
  color?: 'default' | 'success' | 'danger'
  loading?: boolean
}

export function StatCard({ label, value, color = 'default', loading = false }: StatCardProps) {
  const colorClass = {
    default: 'text-ink',
    success: 'text-accent',
    danger: 'text-danger',
  }[color]

  return (
    <div className="p-8">
      <h3 className="text-muted font-semibold text-sm uppercase">{label}</h3>
      {loading ? (
        <div className="mt-4 h-14 w-20 rounded bg-soft animate-pulse" />
      ) : (
        <div className={`font-serif text-6xl mt-4 ${colorClass}`}>{value}</div>
      )}
    </div>
  )
}
