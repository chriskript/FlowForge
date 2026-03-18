import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, GitCommitHorizontal } from 'lucide-react'
import type { GithubCommit, GithubIssue, GithubPullRequest } from '../../hooks/useGithubData'
import { EmptyState } from '../ui/EmptyState'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

type ActivityOverviewProps = {
  commits: GithubCommit[]
  prs: GithubPullRequest[]
  issues: GithubIssue[]
  loading: boolean
  error: string | null
}

function toDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function buildCommitsPerDay(commits: GithubCommit[]) {
  const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
  const now = new Date()
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (6 - index))
    return {
      key: toDayKey(date),
      day: formatter.format(date),
      commits: 0,
    }
  })

  const dayMap = new Map(days.map((entry) => [entry.key, entry]))

  commits.forEach((commit) => {
    const commitDate = new Date(commit.committedAt)
    if (Number.isNaN(commitDate.getTime())) return

    const key = toDayKey(commitDate)
    const bucket = dayMap.get(key)
    if (bucket) {
      bucket.commits += 1
    }
  })

  return days.map(({ day, commits: total }) => ({ day, commits: total }))
}

function ChartSkeleton() {
  return <Skeleton className="mt-4 h-64 w-full" />
}

export function ActivityOverview({ commits, prs, issues, loading, error }: ActivityOverviewProps) {
  const commitsPerDay = buildCommitsPerDay(commits)
  const workItems = [
    { label: 'Pull Requests', count: prs.length },
    { label: 'Issues', count: issues.length },
  ]
  const hasData = commits.length > 0 || prs.length > 0 || issues.length > 0

  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 sm:col-span-2 xl:col-span-3">
        <Card title="Commits Over Time" titleIcon={<GitCommitHorizontal size={14} />}>
          <p className="text-xs text-slate-400">Loading commit activity...</p>
          <ChartSkeleton />
        </Card>

        <Card title="Pull Requests vs Issues" titleIcon={<BarChart3 size={14} />}>
          <p className="text-xs text-slate-400">Loading issue and PR activity...</p>
          <ChartSkeleton />
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 sm:col-span-2 xl:col-span-3">
        <Card title="Commits Over Time" titleIcon={<GitCommitHorizontal size={14} />}>
          <p className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            Unable to load activity data: {error}
          </p>
        </Card>

        <Card title="Pull Requests vs Issues" titleIcon={<BarChart3 size={14} />}>
          <p className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            Unable to load throughput data: {error}
          </p>
        </Card>
      </section>
    )
  }

  if (!hasData) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 sm:col-span-2 xl:col-span-3">
        <Card title="Commits Over Time" titleIcon={<GitCommitHorizontal size={14} />}>
          <EmptyState
            title="No Commit Activity"
            description="No commits are available in the selected time window."
          />
        </Card>

        <Card title="Pull Requests vs Issues" titleIcon={<BarChart3 size={14} />}>
          <EmptyState
            title="No Throughput Data"
            description="Pull request and issue activity has not been detected yet."
          />
        </Card>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 sm:col-span-2 xl:col-span-3">
      <Card title="Commits Over Time" titleIcon={<GitCommitHorizontal size={14} />}>
        <p className="text-xs text-slate-400">Daily commits from the last 7 days</p>

        <div className="chart-fade mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={commitsPerDay} margin={{ top: 10, right: 16, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
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
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{ r: 3, fill: '#22d3ee' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Pull Requests vs Issues" titleIcon={<BarChart3 size={14} />}>
        <p className="text-xs text-slate-400">Fetched from live repository events</p>

        <div className="chart-fade mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workItems} margin={{ top: 10, right: 16, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
              <XAxis
                dataKey="label"
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
              <Bar dataKey="count" fill="#34d399" radius={[8, 8, 0, 0]} maxBarSize={64} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  )
}