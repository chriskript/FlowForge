import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { useGithubData } from './hooks/useGithubData'
import { calculateRepoHealthScore } from './utils/repoHealth'
import { Card } from './components/ui/Card'
import { Skeleton } from './components/ui/Skeleton'

type RepoSelection = {
  owner: string
  repo: string
}

const REPO_SELECTION_STORAGE_KEY = 'flowforge.repoSelection'

function readUrlRepoSelection(): RepoSelection | null {
  const params = new URLSearchParams(window.location.search)
  const owner = (params.get('owner') ?? '').trim()
  const repo = (params.get('repo') ?? '').trim()

  if (!owner && !repo) {
    return null
  }

  return { owner, repo }
}

function writeUrlRepoSelection(selection: RepoSelection) {
  const url = new URL(window.location.href)

  if (selection.owner) {
    url.searchParams.set('owner', selection.owner)
  } else {
    url.searchParams.delete('owner')
  }

  if (selection.repo) {
    url.searchParams.set('repo', selection.repo)
  } else {
    url.searchParams.delete('repo')
  }

  const nextQuery = url.searchParams.toString()
  const nextUrl = `${url.pathname}${nextQuery ? `?${nextQuery}` : ''}${url.hash}`
  window.history.replaceState(null, '', nextUrl)
}

function readInitialRepoSelection(): RepoSelection {
  const envOwner = (import.meta.env.VITE_GITHUB_OWNER ?? '').trim()
  const envRepo = (import.meta.env.VITE_GITHUB_REPO ?? '').trim()
  const urlSelection = readUrlRepoSelection()

  if (urlSelection) {
    return {
      owner: urlSelection.owner || envOwner,
      repo: urlSelection.repo || envRepo,
    }
  }

  try {
    const raw = window.localStorage.getItem(REPO_SELECTION_STORAGE_KEY)
    if (!raw) {
      return { owner: envOwner, repo: envRepo }
    }

    const parsed = JSON.parse(raw) as Partial<RepoSelection>
    return {
      owner: String(parsed.owner ?? envOwner).trim(),
      repo: String(parsed.repo ?? envRepo).trim(),
    }
  } catch {
    return { owner: envOwner, repo: envRepo }
  }
}

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

const Insights = lazy(() =>
  import('./components/dashboard/Insights').then((module) => ({
    default: module.Insights,
  })),
)

function App() {
  const [selectedRepo, setSelectedRepo] = useState<RepoSelection>(readInitialRepoSelection)
  const [draftRepo, setDraftRepo] = useState<RepoSelection>(selectedRepo)
  const [shareMessage, setShareMessage] = useState<string>('')

  const hasRepoSelection = Boolean(selectedRepo.owner && selectedRepo.repo)

  const { commits, prs, issues, loading, error, refresh } = useGithubData({
    owner: selectedRepo.owner || undefined,
    repo: selectedRepo.repo || undefined,
    enabled: hasRepoSelection,
  })

  useEffect(() => {
    setDraftRepo(selectedRepo)
    writeUrlRepoSelection(selectedRepo)

    try {
      if (selectedRepo.owner || selectedRepo.repo) {
        window.localStorage.setItem(REPO_SELECTION_STORAGE_KEY, JSON.stringify(selectedRepo))
      } else {
        window.localStorage.removeItem(REPO_SELECTION_STORAGE_KEY)
      }
    } catch {
      // Ignore localStorage failures and keep repo switching functional.
    }
  }, [selectedRepo])

  function applyRepoSelection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSelectedRepo({
      owner: draftRepo.owner.trim(),
      repo: draftRepo.repo.trim(),
    })
  }

  function clearRepoSelection() {
    setDraftRepo({ owner: '', repo: '' })
    setSelectedRepo({ owner: '', repo: '' })
  }

  async function copyShareLink() {
    const shareUrl = window.location.href
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareMessage('Link copied')
      window.setTimeout(() => setShareMessage(''), 2000)
    } catch {
      setShareMessage('Copy failed')
      window.setTimeout(() => setShareMessage(''), 2000)
    }
  }

  const mergedPrs = prs.filter((pr) => pr.mergedAt)
  const averageReviewHours =
    mergedPrs.length > 0
      ? Number(
          (
            mergedPrs.reduce((sum, pr) => {
              const created = new Date(pr.createdAt).getTime()
              const mergedAt = new Date(pr.mergedAt ?? pr.createdAt).getTime()
              if (Number.isNaN(created) || Number.isNaN(mergedAt) || mergedAt < created) return sum
              return sum + (mergedAt - created) / (1000 * 60 * 60)
            }, 0) / mergedPrs.length
          ).toFixed(1),
        )
      : null

  const commitsPerWeek = Number((commits.length / 6).toFixed(1))
  const openedIssues = issues.length
  const closedIssues = issues.filter((issue) => issue.state === 'CLOSED').length
  const issueClosureRate = openedIssues > 0 ? closedIssues / openedIssues : 0
  const repoHealth = calculateRepoHealthScore({
    commitFrequencyPerWeek: commitsPerWeek,
    issueClosureRate,
    averagePrMergeHours: averageReviewHours,
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5500,
          style: {
            background: 'rgba(2, 6, 23, 0.94)',
            color: '#e2e8f0',
            border: '1px solid rgba(148, 163, 184, 0.28)',
          },
        }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] gap-4 p-3 sm:gap-6 sm:p-6">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-6">
          <Header />

          <section className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 backdrop-blur-xl sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Repository Settings</p>
                <p className="mt-1 text-sm text-slate-300">
                  {hasRepoSelection
                    ? `Active: ${selectedRepo.owner}/${selectedRepo.repo}`
                    : 'Set owner and repo to load dashboard data.'}
                </p>
              </div>
              <button
                type="button"
                onClick={clearRepoSelection}
                className="rounded-md border border-white/20 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
              >
                Clear
              </button>
            </div>

            <form onSubmit={applyRepoSelection} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-400">Owner</span>
                <input
                  value={draftRepo.owner}
                  onChange={(event) =>
                    setDraftRepo((prev) => ({
                      ...prev,
                      owner: event.target.value,
                    }))
                  }
                  placeholder="octocat"
                  className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-slate-400">Repository</span>
                <input
                  value={draftRepo.repo}
                  onChange={(event) =>
                    setDraftRepo((prev) => ({
                      ...prev,
                      repo: event.target.value,
                    }))
                  }
                  placeholder="hello-world"
                  className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
                />
              </label>

              <div className="flex items-end">
                <div className="grid w-full grid-cols-2 gap-2">
                  <button
                    type="submit"
                    className="rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyShareLink()}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                  >
                    Share
                  </button>
                </div>
              </div>
            </form>

            <p className="mt-2 text-xs text-slate-400">
              Shareable URL uses owner/repo query params.
              {shareMessage ? <span className="ml-2 text-cyan-200">{shareMessage}</span> : null}
            </p>
          </section>

          {!hasRepoSelection ? (
            <div className="rounded-xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              No repository selected. Set owner and repo above or provide VITE_GITHUB_OWNER and
              VITE_GITHUB_REPO in your frontend environment.
            </div>
          ) : null}

          {error && hasRepoSelection ? (
            <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <p>GitHub API error: {error}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className="mt-2 rounded-md border border-rose-200/30 px-2.5 py-1 text-xs text-rose-100 transition hover:bg-rose-500/20"
              >
                Retry
              </button>
            </div>
          ) : null}

          <main className="stagger-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6 auto-rows-[minmax(120px,auto)]">
            <Suspense
              fallback={
                <Card title="Activity Overview">
                  <p className="text-xs text-slate-400">Loading charts...</p>
                </Card>
              }
            >
              <ActivityOverview commits={commits} prs={prs} issues={issues} loading={loading} error={error} />
            </Suspense>

            <Suspense
              fallback={
                <Card title="Repo Velocity">
                  <p className="text-xs text-slate-400">Loading velocity metrics...</p>
                </Card>
              }
            >
              <RepoVelocity commits={commits} prs={prs} loading={loading} error={error} />
            </Suspense>

            <Suspense
              fallback={
                <Card title="Issue Throughput">
                  <p className="text-xs text-slate-400">Loading issue metrics...</p>
                </Card>
              }
            >
              <IssueThroughput issues={issues} loading={loading} error={error} />
            </Suspense>

            <Suspense
              fallback={
                <Card title="Contributors">
                  <p className="text-xs text-slate-400">Loading contributors...</p>
                </Card>
              }
            >
              <Contributors commits={commits} loading={loading} error={error} />
            </Suspense>

            <Suspense
              fallback={
                <Card title="Insights">
                  <p className="text-xs text-slate-400">Loading insights...</p>
                </Card>
              }
            >
              <Insights commits={commits} prs={prs} issues={issues} loading={loading} error={error} />
            </Suspense>

            <Card title="Review SLA">
              <p className="text-xs text-slate-400">
                Average PR review + merge time
                <span
                  className="metric-tooltip"
                  title="Average duration from PR creation to merge for merged pull requests."
                >
                  i
                </span>
              </p>
              {loading ? (
                <Skeleton className="mt-3 h-8 w-28" />
              ) : averageReviewHours === null ? (
                <p className="mt-2 text-xs text-slate-400">Not enough merged PRs yet.</p>
              ) : (
                <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white sm:text-3xl">
                  {averageReviewHours}h
                </p>
              )}
            </Card>

            <Card title="Repo Health">
              <p className="text-xs text-slate-400">
                Composite score from commits, issues, and PR velocity
                <span
                  className="metric-tooltip"
                  title="Weighted formula: commits 35%, issue closure 35%, PR merge speed 30%."
                >
                  i
                </span>
              </p>
              {loading ? (
                <Skeleton className="mt-3 h-8 w-20" />
              ) : !hasRepoSelection ? (
                <p className="mt-2 text-xs text-slate-400">Select a repository to calculate health score.</p>
              ) : error ? (
                <p className="mt-2 text-xs text-rose-200">Score unavailable while API request is failing.</p>
              ) : commits.length === 0 && prs.length === 0 && issues.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">No repository activity available to score.</p>
              ) : (
                <>
                  <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white sm:text-3xl">
                    {repoHealth.score}
                    <span className="ml-1 text-base text-slate-300">/100</span>
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                    <span className="rounded border border-white/10 bg-slate-900/40 px-2 py-1">
                      Commits {repoHealth.breakdown.commitFrequency}
                    </span>
                    <span className="rounded border border-white/10 bg-slate-900/40 px-2 py-1">
                      Issues {repoHealth.breakdown.issueClosureRate}
                    </span>
                    <span className="rounded border border-white/10 bg-slate-900/40 px-2 py-1">
                      PR Speed {repoHealth.breakdown.prMergeSpeed}
                    </span>
                  </div>
                </>
              )}
            </Card>

            <Card title="Deployment Rhythm">
              <p className="text-xs text-slate-400">
                Average commits per week (6-week window)
                <span
                  className="metric-tooltip"
                  title="Computed as total fetched commits divided across six weekly buckets."
                >
                  i
                </span>
              </p>
              {loading ? (
                <Skeleton className="mt-3 h-8 w-20" />
              ) : commits.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">No commit data available.</p>
              ) : (
                <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white sm:text-3xl">
                  {commitsPerWeek}
                </p>
              )}
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
