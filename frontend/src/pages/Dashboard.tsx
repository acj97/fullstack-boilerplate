import debounce from 'lodash/debounce'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { type GetPaymentsParams, type Payment, getPayments } from '../api/payments'
import { Pagination } from '../components/Pagination'
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

const PAGE_SIZE_OPTIONS = [5, 10, 15]

function Dashboard() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState>(null)
  const [status, setStatus] = useState<StatusFilter | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 })
  const [statsLoading, setStatsLoading] = useState(true)

  const { user } = useAuthStore()

  const debouncedSetSearch = useCallback(
    debounce((val: string) => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400),
    []
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    debouncedSetSearch(e.target.value)
  }

  const handleStatusChange = (val: StatusFilter | null) => {
    setStatus(val)
    setPage(1)
  }

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
    setPage(1)
  }

  const fetchStats = useCallback(() => {
    if (!user?.token) return
    setStatsLoading(true)
    Promise.all([
      getPayments(user.token, { page: 1, page_size: 1 }),
      getPayments(user.token, { status: 'completed', page: 1, page_size: 1 }),
      getPayments(user.token, { status: 'failed', page: 1, page_size: 1 }),
    ])
      .then(([all, completed, failed]) => {
        setStats({ total: all.total, success: completed.total, failed: failed.total })
      })
      .finally(() => setStatsLoading(false))
  }, [user?.token])

  const fetchPayments = useCallback(() => {
    if (!user?.token) return
    setLoading(true)
    setError(null)
    const sortParam = sort ? (sort.dir === 'desc' ? `-${sort.key}` : sort.key) : undefined
    getPayments(user.token, {
      sort: sortParam,
      status: status ?? undefined,
      search: debouncedSearch || undefined,
      page,
      page_size: pageSize,
    })
      .then((res) => {
        setPayments(res.payments)
        setTotal(res.total)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user?.token, sort, status, debouncedSearch, page, pageSize])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <h1 className="font-serif text-3xl font-semibold text-ink">Dashboard</h1>
      </div>
      <p className="text-sm text-muted m-0">Welcome back, {user?.email}.</p>

      <div className="mt-10 flex flex-col md:grid md:grid-cols-3 mb-10 border border-border">
        <div className="border-b md:border-b-0 md:border-r border-border">
          <StatCard label="Total Payment" value={stats.total} loading={statsLoading} />
        </div>
        <div className="border-b md:border-b-0 md:border-r border-border">
          <StatCard label="Successful Payment" value={stats.success} color="success" loading={statsLoading} />
        </div>
        <StatCard label="Failed Payment" value={stats.failed} color="danger" loading={statsLoading} />
      </div>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <div className="flex items-center gap-3 mb-4">
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={handleStatusChange}
          placeholder="All statuses"
          disabled={loading}
        />
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            disabled={loading}
            placeholder="Search merchant..."
            className="pl-8 pr-3 py-2 text-sm border border-border rounded-sm bg-surface text-ink placeholder:text-muted outline-none transition-colors focus:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <Table
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'merchant_name', label: 'Merchant Name', sortable: true },
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

      <div className="flex items-center justify-between mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          disabled={loading}
        />
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
          disabled={loading}
          className="px-3 py-2 text-sm border border-border rounded-sm bg-surface text-ink-2 outline-none transition-colors focus:border-border-strong cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
      </div>
    </>
  )
}

export default Dashboard
