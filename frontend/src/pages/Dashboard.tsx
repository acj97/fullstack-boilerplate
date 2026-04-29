import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { StatCard } from '../components/StatCard'
import { Table } from '../components/Table'
import { formatDate } from '../utils/date'

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        <p className="text-sm text-muted m-0">Welcome back, Abraham.</p>
        <div className="mt-10 flex flex-col md:grid md:grid-cols-3 mb-10 border border-border">
          <div className="border-b md:border-b-0 md:border-r border-border"><StatCard label="Total Payment" value={30} /></div>
          <div className="border-b md:border-b-0 md:border-r border-border"><StatCard label="Successful Payment" value={20} color="success" /></div>
          <StatCard label="Failed Payment" value={10} color="danger" />
        </div>
        <Table columns={[
          { key: 'id', label: 'ID' },
          { key: 'merchant_name', label: 'Merchant Name' },
          { key: 'created_at', label: 'Date', render: (val) => formatDate(val as string | Date) },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status' }
        ]} data={[{
          id: '1',
          merchant_name: 'Merchant 1',
          created_at: new Date(),
          amount: '$100.00',
          status: 'completed'
        }]} />
      </main>
    </div>
  )
}

export default Dashboard
