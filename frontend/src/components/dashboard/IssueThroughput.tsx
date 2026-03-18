import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CircleCheckBig } from 'lucide-react'
import type { GithubIssue } from '../../hooks/useGithubData'
import { EmptyState } from '../ui/EmptyState'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

type IssueThroughputProps = {
  issues: GithubIssue[]
  loading: boolean
  error: string | null
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

function toTimestamp(value: string | null) {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

export function IssueThroughput({ issues, loading, error }: IssueThroughputProps) {
  const now = Date.now()
  const windowStart = now - 14 * MS_PER_DAY

  const opened = issues.filter((issue) => {
    const created = toTimestamp(issue.createdAt)
    return created !== null && created >= windowStart
  }).length

  const closed = issues.filter((issue) => {
    const closedAt = toTimestamp(issue.closedAt)
    return closedAt !== null && closedAt >= windowStart
  }).length

  const backlogSize = issues.filter((issue) => issue.state !== 'CLOSED').length
  const issueMetrics = [
    { status: 'Opened', count: opened },
    { status: 'Closed', count: closed },
  ]
  const closureDelta = closed - opened
  const hasData = issues.length > 0

  if (loading) {
    return (
      <Card title="Issue Throughput" titleIcon={<CircleCheckBig size={14} />}>
        <p className="text-xs text-slate-400">Loading issue activity...</p>
        <Skeleton className="mt-4 h-56 w-full" />
        <Skeleton className="mt-4 h-16" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card title="Issue Throughput" titleIcon={<CircleCheckBig size={14} />}>
        <p className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          Unable to load issue throughput: {error}
        </p>
      </Card>
    )
  }

  if (!hasData) {
    return (
      <Card title="Issue Throughput" titleIcon={<CircleCheckBig size={14} />}>
        <EmptyState
          title="No Issues Found"
          description="Issue throughput appears empty for this repository and timeframe."
        />
      </Card>
    )
  }

  return (
    <Card title="Issue Throughput" titleIcon={<CircleCheckBig size={14} />}>
      <p className="text-xs text-slate-400">Opened vs closed in the last 14 days</p>

      <div className="chart-fade mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={issueMetrics} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
            <XAxis dataKey="status" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(2, 6, 23, 0.92)',
                borderColor: 'rgba(148, 163, 184, 0.35)',
                color: '#e2e8f0',
                borderRadius: '0.75rem',
              }}
            />
            <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} maxBarSize={72} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/30 px-3 py-2">
        <p className="text-xs text-slate-400">Backlog Size</p>
        <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold text-white">{backlogSize}</p>
      </div>

      <p className="mt-3 text-xs text-slate-300">
        Trend: {closureDelta > 0 ? 'closed issues are outpacing new issues this week.' : 'new issues are growing faster than closures this week.'}
      </p>
    </Card>
  )
}