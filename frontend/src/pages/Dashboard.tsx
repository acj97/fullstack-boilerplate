import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { type Payment, getPayments } from '../api/payments'
import { Sidebar } from '../components/Sidebar'
import { StatCard } from '../components/StatCard'
import { Table } from '../components/Table'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/date'

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (!user?.token) return
    setLoading(true)
    getPayments(user.token)
      .then(setPayments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user?.token])

  const total = payments.length
  const success = payments.filter((p) => p.status === 'completed').length
  const failed = payments.filter((p) => p.status === 'failed').length

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 px-6 md:px-14 py-12 overflow-y-auto">
        <div className="flex items-center gap-4 mb-2">
          <button
            className="md:hidden text-ink-2 hover:text-ink transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h1 className="font-serif text-3xl font-semibold text-ink">Dashboard</h1>
        </div>
        <p className="text-sm text-muted m-0">Welcome back, {user?.email}.</p>

        <div className="mt-10 flex flex-col md:grid md:grid-cols-3 mb-10 border border-border">
          <div className="border-b md:border-b-0 md:border-r border-border">
            <StatCard label="Total Payment" value={total} />
          </div>
          <div className="border-b md:border-b-0 md:border-r border-border">
            <StatCard label="Successful Payment" value={success} color="success" />
          </div>
          <StatCard label="Failed Payment" value={failed} color="danger" />
        </div>

        {error && (
          <p className="text-sm text-danger mb-4">{error}</p>
        )}

        <Table
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'merchant_name', label: 'Merchant Name' },
            { key: 'created_at', label: 'Date', render: (val) => val ? formatDate(val as string) : '—' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
          ]}
          data={payments}
          loading={loading}
        />
      </main>
    </div>
  )
}

export default Dashboard
