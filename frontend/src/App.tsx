import { lazy, Suspense } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Card } from './components/ui/Card'

const ActivityOverview = lazy(() =>
  import('./components/dashboard/ActivityOverview').then((module) => ({
    default: module.ActivityOverview,
  })),
)

const RepoVelocity = lazy(() =>
  import('./components/dashboard/RepoVelocity').then((module) => ({
    default: module.RepoVelocity,
  })),
)

const IssueThroughput = lazy(() =>
  import('./components/dashboard/IssueThroughput').then((module) => ({
    default: module.IssueThroughput,
  })),
)

const Contributors = lazy(() =>
  import('./components/dashboard/Contributors').then((module) => ({
    default: module.Contributors,
  })),
)

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-4 p-4 sm:gap-6 sm:p-6">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
          <Header />

          <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
            <Suspense
              fallback={
                <Card title="Activity Overview">
                  <p className="text-xs text-slate-400">Loading charts...</p>
                </Card>
              }
            >
              <ActivityOverview />
            </Suspense>

            <Suspense
              fallback={
                <Card title="Repo Velocity">
                  <p className="text-xs text-slate-400">Loading velocity metrics...</p>
                </Card>
              }
            >
              <RepoVelocity />
            </Suspense>

            <Suspense
              fallback={
                <Card title="Issue Throughput">
                  <p className="text-xs text-slate-400">Loading issue metrics...</p>
                </Card>
              }
            >
              <IssueThroughput />
            </Suspense>

            <Suspense
              fallback={
                <Card title="Contributors">
                  <p className="text-xs text-slate-400">Loading contributors...</p>
                </Card>
              }
            >
              <Contributors />
            </Suspense>

            <Card title="Review SLA">
              <p className="text-xs text-slate-400">Median review time</p>
              <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white sm:text-3xl">
                4h 21m
              </p>
            </Card>

            <Card title="Deployment Rhythm">
              <p className="text-xs text-slate-400">Average releases per week</p>
              <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white sm:text-3xl">
                6.2
              </p>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
