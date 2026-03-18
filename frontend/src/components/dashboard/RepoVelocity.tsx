import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { GithubCommit, GithubPullRequest } from '../../hooks/useGithubData'
import { EmptyState } from '../ui/EmptyState'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

type RepoVelocityProps = {
  commits: GithubCommit[]
  prs: GithubPullRequest[]
  loading: boolean
  error: string | null
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

function buildWeeklyCommitTrend(commits: GithubCommit[]) {
  const now = Date.now()
  const buckets = [0, 0, 0, 0, 0, 0]

  commits.forEach((commit) => {
    const committedAt = new Date(commit.committedAt).getTime()
    if (Number.isNaN(committedAt)) return

    const diffDays = Math.floor((now - committedAt) / MS_PER_DAY)
    if (diffDays < 0 || diffDays >= 42) return

    const bucketIndex = 5 - Math.floor(diffDays / 7)
    if (bucketIndex >= 0 && bucketIndex < buckets.length) {
      buckets[bucketIndex] += 1
    }
  })

  return buckets.map((count, index) => ({ week: `W${index + 1}`, commits: count }))
}

function averageMergeHours(prs: GithubPullRequest[]) {
  const merged = prs.filter((pr) => pr.mergedAt)
  if (merged.length === 0) return null

  const totalHours = merged.reduce((sum, pr) => {
    const created = new Date(pr.createdAt).getTime()
    const mergedAt = new Date(pr.mergedAt ?? pr.createdAt).getTime()
    if (Number.isNaN(created) || Number.isNaN(mergedAt) || mergedAt < created) return sum
    return sum + (mergedAt - created) / (1000 * 60 * 60)
  }, 0)

  return Number((totalHours / merged.length).toFixed(1))
}

function ChartSkeleton() {
  return <Skeleton className="mt-4 h-56 w-full" />
}

export function RepoVelocity({ commits, prs, loading, error }: RepoVelocityProps) {
  const commitsPerWeek = buildWeeklyCommitTrend(commits)
  const currentMergeHours = averageMergeHours(prs)
  const hasCommitTrend = commitsPerWeek.some((entry) => entry.commits > 0)

  const now = Date.now()
  const recentWindowStart = now - 7 * MS_PER_DAY
  const previousWindowStart = now - 14 * MS_PER_DAY

  const recentMerged = prs.filter((pr) => {
    if (!pr.mergedAt) return false
    const mergedTime = new Date(pr.mergedAt).getTime()
    return mergedTime >= recentWindowStart
  })

  const previousMerged = prs.filter((pr) => {
    if (!pr.mergedAt) return false
    const mergedTime = new Date(pr.mergedAt).getTime()
    return mergedTime >= previousWindowStart && mergedTime < recentWindowStart
  })

  const recentAverage = averageMergeHours(recentMerged)
  const previousAverage = averageMergeHours(previousMerged)
  const mergeDelta =
    recentAverage !== null && previousAverage !== null
      ? Number((recentAverage - previousAverage).toFixed(1))
      : null
  const isMergeTimeDown = mergeDelta !== null ? mergeDelta < 0 : false

  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 sm:col-span-2 xl:col-span-3">
        <div className="sm:col-span-2">
          <Card title="Commits Per Week">
            <p className="text-xs text-slate-400">Loading velocity trend...</p>
            <ChartSkeleton />
          </Card>
        </div>

        <Card title="Average PR Merge Time">
          <Skeleton className="mt-3 h-10 w-24" />
          <Skeleton className="mt-4 h-7 w-36" />
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 sm:col-span-2 xl:col-span-3">
        <div className="sm:col-span-2">
          <Card title="Commits Per Week">
            <p className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              Unable to load velocity chart: {error}
            </p>
          </Card>
        </div>

        <Card title="Average PR Merge Time">
          <p className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            Unable to load merge-time metric.
          </p>
        </Card>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 sm:col-span-2 xl:col-span-3">
      <div className="sm:col-span-2">
        <Card title="Commits Per Week">
          <p className="text-xs text-slate-400">6-week commit trend from repository history</p>

          {hasCommitTrend ? (
            <div className="chart-fade mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={commitsPerWeek} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(2, 6, 23, 0.92)',
                      borderColor: 'rgba(148, 163, 184, 0.35)',
                      color: '#e2e8f0',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="commits"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#38bdf8' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No Weekly Commit Trend"
              description="No commit activity is available for the last 6 weeks."
            />
          )}
        </Card>
      </div>

      <Card title="Average PR Merge Time">
        <p className="text-xs text-slate-400">Based on merged pull requests</p>

        {currentMergeHours === null ? (
          <EmptyState
            title="No Merge-Time Baseline"
            description="Merged pull requests are required before this metric can be calculated."
          />
        ) : (
          <>
            <p className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-white">{currentMergeHours}h</p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/40 px-2.5 py-1.5 text-xs">
              {mergeDelta === null ? (
                <>
                  <span className="text-slate-300">-</span>
                  <span className="text-slate-400">not enough baseline data</span>
                </>
              ) : (
                <>
                  <span className={isMergeTimeDown ? 'text-emerald-300' : 'text-rose-300'}>
                    {isMergeTimeDown ? '▼' : '▲'} {Math.abs(mergeDelta)}h
                  </span>
                  <span className="text-slate-400">vs previous 7 days</span>
                </>
              )}
            </div>
          </>
        )}
      </Card>
    </section>
  )
}