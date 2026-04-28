import { LayoutDashboard, LogOut, type LucideIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export type NavId = 'dashboard'

const NAV_ITEMS: {
  id: NavId
  label: string
  Icon: LucideIcon
  path: string
}[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, path: '/dashboard' },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="border-r border-border bg-soft py-6 px-4 flex flex-col gap-7 sticky top-0 h-screen w-56 shrink-0">
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
              onClick={() => navigate(path)}
              className={`relative flex items-center gap-3 py-3 px-3 text-sm font-medium font-sans cursor-pointer text-left w-full rounded-sm transition-colors ${
                isActive
                  ? "bg-surface text-ink"
                  : 'text-ink-2 hover:bg-surface hover:text-ink'
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
          AC
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink font-medium truncate m-0">
            Abraham C.
          </p>
          <p className="text-xs text-muted-2 truncate m-0">
            abrahamchristian97@gmail.com
          </p>
        </div>
        <button
          onClick={() => {}}
          className="shrink-0 text-muted-2 hover:text-danger cursor-pointer transition-colors"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}