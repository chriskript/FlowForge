import type { GithubCommit, GithubIssue, GithubPullRequest } from '../../hooks/useGithubData'
import type { ReactNode } from 'react'
import {
  CheckCheck,
  CircleDashed,
  Gauge,
  GitCommitHorizontal,
  GitMerge,
  GitPullRequest,
  ShieldCheck,
} from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { Card } from '../ui/Card'
import { GitHubIcon } from '../ui/GitHubIcon'
import { Skeleton } from '../ui/Skeleton'

type ReposTabViewProps = {
  owner: string
  repo: string
  commits: GithubCommit[]
  prs: GithubPullRequest[]
  issues: GithubIssue[]
  loading: boolean
  error: string | null
  averageReviewHours: number | null
  commitsPerWeek: number
  repoHealthScore: number
}

type StatProps = {
  label: string
  value: ReactNode
  icon: typeof Gauge
  tone?: 'default' | 'good' | 'warn'
}

function Stat({ label, value, icon: Icon, tone = 'default' }: StatProps) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-200 border-emerald-300/30 bg-emerald-500/10'
      : tone === 'warn'
        ? 'text-amber-100 border-amber-300/35 bg-amber-500/10'
        : 'text-slate-100 border-white/15 bg-slate-900/35'

  return (
    <div className={`rounded-xl border px-3 py-3 ${toneClass}`}>
      <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] opacity-80">
        <Icon size={13} />
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}

export function ReposTabView({
  owner,
  repo,
  commits,
  prs,
  issues,
  loading,
  error,
  averageReviewHours,
  commitsPerWeek,
  repoHealthScore,
}: ReposTabViewProps) {
  const mergedPrCount = prs.filter((pr) => pr.mergedAt).length
  const openPrCount = prs.filter((pr) => pr.state !== 'MERGED' && pr.state !== 'CLOSED').length
  const openIssueCount = issues.filter((issue) => issue.state !== 'CLOSED').length
  const closedIssueCount = issues.length - openIssueCount
  const issueClosureRate = issues.length > 0 ? Math.round((closedIssueCount / issues.length) * 100) : 0

  const recentPrs = prs
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  const recentIssues = issues
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:col-span-2 xl:col-span-3 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <Card title="Repository Workspace">
            <Skeleton className="h-12 w-2/3" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </Card>
        </div>

        <Card title="Pull Request Queue">
          <Skeleton className="h-52" />
        </Card>

        <Card title="Issue Queue">
          <Skeleton className="h-52" />
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="sm:col-span-2 xl:col-span-3">
        <Card title="Repository Workspace">
          <p className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            Unable to load repository workspace: {error}
          </p>
        </Card>
      </section>
    )
  }

  if (commits.length === 0 && prs.length === 0 && issues.length === 0) {
    return (
      <section className="sm:col-span-2 xl:col-span-3">
        <Card title="Repository Workspace">
          <EmptyState
            title="No Repository Activity"
            description="The selected repository does not have enough events yet to populate the Repos workspace."
          />
        </Card>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:col-span-2 xl:col-span-3 xl:grid-cols-4 sm:gap-6">
      <div className="xl:col-span-2">
      <Card title="Repository Workspace">
        <div className="rounded-xl border border-white/15 bg-slate-900/35 px-4 py-4">
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-slate-400">
            <GitHubIcon size={13} iconTitle="GitHub" />
            Active Repository
          </p>
          <div className="mt-2 flex min-w-0 items-start gap-2" title={`${owner}/${repo}`}>
            <GitHubIcon size={18} className="mt-1 shrink-0 text-cyan-200" iconTitle="GitHub" />
            <h2 className="min-w-0 font-['Space_Grotesk'] text-2xl font-semibold leading-tight text-white">
              <span className="block break-all">{owner}</span>
              <span className="block break-all text-cyan-100/90">/{repo}</span>
            </h2>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat
            label="Health Score"
            value={`${repoHealthScore}/100`}
            icon={ShieldCheck}
            tone={repoHealthScore >= 70 ? 'good' : 'warn'}
          />
          <Stat label="Commits / Week" value={commitsPerWeek.toFixed(1)} icon={GitCommitHorizontal} />
          <Stat label="PR Merge Avg" value={averageReviewHours === null ? 'N/A' : `${averageReviewHours}h`} icon={GitMerge} />
          <Stat label="Issue Closure" value={`${issueClosureRate}%`} icon={CheckCheck} tone={issueClosureRate >= 65 ? 'good' : 'warn'} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-slate-900/40 px-2 py-1.5">
            <GitPullRequest size={12} /> PRs {prs.length}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-slate-900/40 px-2 py-1.5">
            <CircleDashed size={12} /> Open PRs {openPrCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-slate-900/40 px-2 py-1.5">
            <CheckCheck size={12} /> Merged {mergedPrCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-slate-900/40 px-2 py-1.5">
            <Gauge size={12} /> Issues {issues.length}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-slate-900/40 px-2 py-1.5">
            <CircleDashed size={12} /> Open {openIssueCount}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-slate-900/40 px-2 py-1.5">
            <CheckCheck size={12} /> Closed {closedIssueCount}
          </span>
        </div>
      </Card>
      </div>

      <Card title="Pull Request Queue">
        {recentPrs.length === 0 ? (
          <EmptyState
            title="No Pull Requests"
            description="No pull request activity was returned for this repository."
          />
        ) : (
          <ul className="space-y-2">
            {recentPrs.map((pr) => (
              <li key={pr.number} className="rounded-lg border border-white/10 bg-slate-900/30 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium text-slate-100">#{pr.number} {pr.title}</p>
                  <span className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                    {pr.state}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Opened {new Date(pr.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Issue Queue">
        {recentIssues.length === 0 ? (
          <EmptyState
            title="No Issues"
            description="No issue activity was returned for this repository."
          />
        ) : (
          <ul className="space-y-2">
            {recentIssues.map((issue) => (
              <li key={issue.number} className="rounded-lg border border-white/10 bg-slate-900/30 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium text-slate-100">#{issue.number} {issue.title}</p>
                  <span className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                    {issue.state}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Opened {new Date(issue.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}
