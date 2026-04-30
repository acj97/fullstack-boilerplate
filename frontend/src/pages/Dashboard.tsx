import { useCallback, useEffect, useState } from 'react'
import { type GetPaymentsParams, type Payment, getPayments } from '../api/payments'
import { Select } from '../components/Select'
import { StatCard } from '../components/StatCard'
import { Table } from '../components/Table'
import { useAuthStore } from '../store/authStore'
import { formatDate } from '../utils/date'

type SortState = { key: string; dir: 'asc' | 'desc' } | null
type StatusFilter = GetPaymentsParams['status'] & string

const STATUS_OPTIONS = [
  { label: 'Completed', value: 'completed' as StatusFilter },
  { label: 'Processing', value: 'processing' as StatusFilter },
  { label: 'Failed', value: 'failed' as StatusFilter },
]

function Dashboard() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState>(null)
  const [status, setStatus] = useState<StatusFilter | null>(null)

  const { user } = useAuthStore()

  const fetchPayments = useCallback(() => {
    if (!user?.token) return
    setLoading(true)
    setError(null)
    const sortParam = sort ? (sort.dir === 'desc' ? `-${sort.key}` : sort.key) : undefined
    getPayments(user.token, { sort: sortParam, status: status ?? undefined })
      .then(setPayments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user?.token, sort, status])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  const total = payments.length
  const success = payments.filter((p) => p.status === 'completed').length
  const failed = payments.filter((p) => p.status === 'failed').length

  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <h1 className="font-serif text-3xl font-semibold text-ink">Dashboard</h1>
      </div>
      <p className="text-sm text-muted m-0">Welcome back, {user?.email}.</p>

      <div className="mt-10 flex flex-col md:grid md:grid-cols-3 mb-10 border border-border">
        <div className="border-b md:border-b-0 md:border-r border-border">
          <StatCard label="Total Payment" value={total} loading={loading} />
        </div>
        <div className="border-b md:border-b-0 md:border-r border-border">
          <StatCard label="Successful Payment" value={success} color="success" loading={loading} />
        </div>
        <StatCard label="Failed Payment" value={failed} color="danger" loading={loading} />
      </div>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <div className="flex items-center gap-3 mb-4">
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
          placeholder="All statuses"
          disabled={loading}
        />
      </div>

      <Table
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'merchant_name', label: 'Merchant Name' },
          { key: 'created_at', label: 'Date', sortable: true, render: (val) => val ? formatDate(val as string) : '—' },
          { key: 'amount', label: 'Amount', sortable: true },
          { key: 'status', label: 'Status' },
        ]}
        data={payments}
        loading={loading}
        sortKey={sort?.key}
        sortDir={sort?.dir}
        onSort={handleSort}
      />
    </>
  )
}

export default Dashboard
