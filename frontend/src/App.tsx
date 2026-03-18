import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Card } from './components/ui/Card'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-4 p-4 sm:gap-6 sm:p-6">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
          <Header />

          <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
            <Card title="GitHub Activity" subtitle="Last 7 days" value="1,284 Events" />
            <Card title="Repo Velocity" subtitle="Pull requests merged" value="37 PRs" />
            <Card title="Issue Throughput" subtitle="Opened vs closed" value="92% Closed" />
            <Card
              title="Top Contributor"
              subtitle="Highest merged contribution"
              value="alexr"
            />
            <Card title="Review SLA" subtitle="Median review time" value="4h 21m" />
            <Card title="Deployment Rhythm" subtitle="Average releases per week" value="6.2" />
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
