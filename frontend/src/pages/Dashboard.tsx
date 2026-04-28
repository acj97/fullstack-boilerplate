import { Sidebar } from '../components/Sidebar'

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 px-14 py-12 overflow-y-auto">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-muted m-0">Welcome back, Abraham.</p>
        <div className="mt-10 min-h-45 justify-between grid grid-cols-3 mb-10 border border-border">
          <div className="border-r border-border p-8">
            <h3 className="text-muted font-semibold text-sm uppercase">
              Total Payment
            </h3>
            <div className="font-serif text-ink text-6xl mt-4">
              30
            </div>
          </div>
          <div className="border-r border-border p-8">
            <h3 className="text-muted font-semibold text-sm uppercase">
              Successful Payment
            </h3>
            <div className="font-serif text-accent text-6xl mt-4">
              20
            </div>
          </div>
          <div className="p-8">
            <h3 className="text-muted font-semibold text-sm uppercase">
              Failed Payment
            </h3>
            <div className="font-serif text-danger text-6xl mt-4">
              10
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
