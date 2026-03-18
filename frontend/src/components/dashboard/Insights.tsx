import type { GithubCommit, GithubIssue, GithubPullRequest } from '../../hooks/useGithubData'
import { useEffect, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { Lightbulb } from 'lucide-react'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'

type InsightsProps = {
  commits: GithubCommit[]
  prs: GithubPullRequest[]
  issues: GithubIssue[]
  loading: boolean
  error: string | null
}

type AlertLevel = 'green' | 'yellow' | 'red'

type InsightAlert = {
  key: string
  title: string
  message: string
  level: AlertLevel
}

const DAY_MS = 1000 * 60 * 60 * 24

function toTimestamp(value: string | null | undefined) {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

function buildInsights(
  commits: GithubCommit[],
  prs: GithubPullRequest[],
  issues: GithubIssue[],
): InsightAlert[] {
  const now = Date.now()
  const recent14Start = now - 14 * DAY_MS
  const previous14Start = now - 28 * DAY_MS
  const recent7Start = now - 7 * DAY_MS
  const previous7Start = now - 14 * DAY_MS

  const openedRecent = issues.filter((issue) => {
    const created = toTimestamp(issue.createdAt)
    return created !== null && created >= recent14Start
  }).length

  const closedRecent = issues.filter((issue) => {
    const closedAt = toTimestamp(issue.closedAt)
    return closedAt !== null && closedAt >= recent14Start
  }).length

  const openedPrevious = issues.filter((issue) => {
    const created = toTimestamp(issue.createdAt)
    return created !== null && created >= previous14Start && created < recent14Start
  }).length

  const closedPrevious = issues.filter((issue) => {
    const closedAt = toTimestamp(issue.closedAt)
    return closedAt !== null && closedAt >= previous14Start && closedAt < recent14Start
  }).length

  const backlogDeltaRecent = openedRecent - closedRecent
  const backlogDeltaPrevious = openedPrevious - closedPrevious

  const backlogAlert: InsightAlert =
    backlogDeltaRecent > backlogDeltaPrevious + 3
      ? {
          key: 'backlog',
          title: 'Increasing Backlog',
          message: `Backlog growth accelerated to +${backlogDeltaRecent} in the last 14 days.`,
          level: 'red',
        }
      : backlogDeltaRecent > backlogDeltaPrevious
        ? {
            key: 'backlog',
            title: 'Backlog Trend Warning',
            message: `Backlog is trending up (+${backlogDeltaRecent}) compared to previous period.`,
            level: 'yellow',
          }
        : {
            key: 'backlog',
            title: 'Backlog Healthy',
            message: 'Issue backlog is stable or improving this period.',
            level: 'green',
          }

  const mergedRecent = prs.filter((pr) => {
    const mergedAt = toTimestamp(pr.mergedAt)
    return mergedAt !== null && mergedAt >= recent14Start
  })

  const avgMergeHours =
    mergedRecent.length > 0
      ? mergedRecent.reduce((sum, pr) => {
          const created = toTimestamp(pr.createdAt)
          const mergedAt = toTimestamp(pr.mergedAt)
          if (created === null || mergedAt === null || mergedAt < created) return sum
          return sum + (mergedAt - created) / (1000 * 60 * 60)
        }, 0) / mergedRecent.length
      : null

  let mergeAlert: InsightAlert
  if (avgMergeHours === null) {
    mergeAlert = {
      key: 'pr-merge',
      title: 'PR Merge Speed Unavailable',
      message: 'No merged PRs in the last 14 days to evaluate merge speed.',
      level: 'yellow',
    }
  } else if (avgMergeHours > 72) {
    mergeAlert = {
      key: 'pr-merge',
      title: 'Slow PR Merges',
      message: `Average merge time is ${avgMergeHours.toFixed(1)}h, which is above target.`,
      level: 'red',
    }
  } else if (avgMergeHours > 36) {
    mergeAlert = {
      key: 'pr-merge',
      title: 'PR Merge Speed Warning',
      message: `Average merge time is ${avgMergeHours.toFixed(1)}h and should improve.`,
      level: 'yellow',
    }
  } else {
    mergeAlert = {
      key: 'pr-merge',
      title: 'PR Merge Speed Healthy',
      message: `Average merge time is ${avgMergeHours.toFixed(1)}h.`,
      level: 'green',
    }
  }

  const commitsRecent = commits.filter((commit) => {
    const committedAt = toTimestamp(commit.committedAt)
    return committedAt !== null && committedAt >= recent7Start
  }).length

  const commitsPrevious = commits.filter((commit) => {
    const committedAt = toTimestamp(commit.committedAt)
    return committedAt !== null && committedAt >= previous7Start && committedAt < recent7Start
  }).length

  let commitAlert: InsightAlert
  if (commitsPrevious > 0 && commitsRecent <= commitsPrevious * 0.5) {
    commitAlert = {
      key: 'commits',
      title: 'Drop in Commits',
      message: `Commits dropped from ${commitsPrevious} to ${commitsRecent} week over week.`,
      level: 'red',
    }
  } else if (commitsPrevious > 0 && commitsRecent < commitsPrevious) {
    commitAlert = {
      key: 'commits',
      title: 'Commit Trend Warning',
      message: `Commits declined from ${commitsPrevious} to ${commitsRecent} this week.`,
      level: 'yellow',
    }
  } else if (commitsRecent === 0) {
    commitAlert = {
      key: 'commits',
      title: 'Commit Activity Low',
      message: 'No commits detected in the last 7 days.',
      level: 'yellow',
    }
  } else {
    commitAlert = {
      key: 'commits',
      title: 'Commit Activity Healthy',
      message: `Commit output is steady with ${commitsRecent} commits this week.`,
      level: 'green',
    }
  }

  return [backlogAlert, mergeAlert, commitAlert]
}

export function Insights({ commits, prs, issues, loading, error }: InsightsProps) {
  const hasAnyData = commits.length > 0 || prs.length > 0 || issues.length > 0
  const alerts = useMemo(() => buildInsights(commits, prs, issues), [commits, prs, issues])
  const lastAlertsSignatureRef = useRef<string>('')

  useEffect(() => {
    if (loading || error || !hasAnyData) {
      return
    }

    const signature = JSON.stringify(alerts)
    if (lastAlertsSignatureRef.current === signature) {
      return
    }

    alerts.forEach((alert) => {
      const levelStyles: Record<AlertLevel, { border: string; background: string; color: string }> = {
        green: {
          border: '1px solid rgba(110, 231, 183, 0.35)',
          background: 'rgba(6, 78, 59, 0.85)',
          color: '#d1fae5',
        },
        yellow: {
          border: '1px solid rgba(252, 211, 77, 0.4)',
          background: 'rgba(120, 53, 15, 0.86)',
          color: '#fef3c7',
        },
        red: {
          border: '1px solid rgba(252, 165, 165, 0.45)',
          background: 'rgba(127, 29, 29, 0.88)',
          color: '#fee2e2',
        },
      }

      toast(`${alert.title}: ${alert.message}`, {
        id: `insight-${alert.key}`,
        style: {
          ...levelStyles[alert.level],
        },
      })
    })

    lastAlertsSignatureRef.current = signature
  }, [alerts, error, hasAnyData, loading])

  if (loading) {
    return (
      <Card title="Insights" titleIcon={<Lightbulb size={14} />}>
        <p className="text-xs text-slate-400">Preparing insight notifications...</p>
        <Skeleton className="mt-3 h-10 w-full" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card title="Insights" titleIcon={<Lightbulb size={14} />}>
        <p className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          Unable to generate insights while API is failing: {error}
        </p>
      </Card>
    )
  }

  if (!hasAnyData) {
    return (
      <Card title="Insights" titleIcon={<Lightbulb size={14} />}>
        <EmptyState
          title="No Insight Signals"
          description="Activity data is required before trend notifications can be generated."
        />
      </Card>
    )
  }

  return (
    <Card title="Insights" titleIcon={<Lightbulb size={14} />}>
      <p className="text-xs text-slate-400">Insights are delivered as toast notifications when trend status changes.</p>
      <div className="mt-3 rounded-lg border border-white/10 bg-slate-900/35 px-3 py-2 text-xs text-slate-300">
        Toast alerts active: {alerts.length} checks (backlog, merge speed, commits).
      </div>
    </Card>
  )
}
