import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 px-6 md:px-14 py-12 overflow-y-auto">
        <button
          type="button"
          className="md:hidden text-ink-2 hover:text-ink transition-colors mb-6"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={22} />
        </button>
        <Outlet />
      </main>
    </div>
  )
}
