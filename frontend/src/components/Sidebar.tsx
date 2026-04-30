import { LayoutDashboard, LogOut, type LucideIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export type NavId = 'dashboard'

const NAV_ITEMS: {
  id: NavId
  label: string
  Icon: LucideIcon
  path: string
}[] = [{ id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, path: '/dashboard' }]

type SidebarProps = {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleNavigate = (path: string) => {
    navigate(path)
    onClose?.()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-56 shrink-0 flex flex-col gap-7 border-r border-border bg-soft py-6 px-4 transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-3 px-1">
          <span className="font-serif text-2xl font-semibold text-ink tracking-[-0.01em] leading-none">
            DurianPay
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ id, label, Icon, path }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={id}
                onClick={() => handleNavigate(path)}
                className={`relative flex items-center gap-3 py-3 px-3 text-sm font-medium font-sans cursor-pointer text-left w-full rounded-sm transition-colors ${
                  isActive ? 'bg-surface text-ink' : 'text-ink-2 hover:bg-surface hover:text-ink'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border">
          <div className="size-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-2 truncate m-0">{user?.email}</p>
            <p className="text-xs text-muted-2 truncate m-0 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 text-muted-2 hover:text-danger cursor-pointer transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>
    </>
  )
}
