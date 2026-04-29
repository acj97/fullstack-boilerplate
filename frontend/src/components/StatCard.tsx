type StatCardProps = {
  label: string
  value: number | string
  color?: 'default' | 'success' | 'danger'
}

export function StatCard({ label, value, color = 'default' }: StatCardProps) {
  const colorClass = {
    default: 'text-ink',
    success: 'text-accent',
    danger: 'text-danger',
  }[color]

  return (
    <div className="p-8">
      <h3 className="text-muted font-semibold text-sm uppercase">{label}</h3>
      <div className={`font-serif text-6xl mt-4 ${colorClass}`}>{value}</div>
    </div>
  )
}
