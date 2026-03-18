import type { GithubCommit, GithubPullRequest } from '../../hooks/useGithubData'
import { GitCommitHorizontal, GitMerge, Trophy, Users } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

type ContributorsTabViewProps = {
  commits: GithubCommit[]
  prs: GithubPullRequest[]
  loading: boolean
  error: string | null
}

type ContributorRow = {
  name: string
  commits: number
  mergedPrs: number
}

function buildContributorRows(commits: GithubCommit[], prs: GithubPullRequest[]): ContributorRow[] {
  const commitMap = new Map<string, number>()
  commits.forEach((commit) => {
    const name = commit.author?.trim() || 'Unknown'
    commitMap.set(name, (commitMap.get(name) ?? 0) + 1)
  })

  const mergedPrMap = new Map<string, number>()
  prs.forEach((pr) => {
    if (!pr.mergedAt) return
    const author = pr.author?.trim() || 'Unknown'
    mergedPrMap.set(author, (mergedPrMap.get(author) ?? 0) + 1)
  })

  const allNames = new Set<string>([...commitMap.keys(), ...mergedPrMap.keys()])
  return Array.from(allNames)
    .map((name) => ({
      name,
      commits: commitMap.get(name) ?? 0,
      mergedPrs: mergedPrMap.get(name) ?? 0,
    }))
    .sort((a, b) => b.commits - a.commits)
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ContributorsTabView({ commits, prs, loading, error }: ContributorsTabViewProps) {
  const rows = buildContributorRows(commits, prs)
  const totalCommits = rows.reduce((sum, row) => sum + row.commits, 0)
  const topRows = rows.slice(0, 8)

  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:col-span-2 xl:col-span-3 xl:grid-cols-3 sm:gap-6">
        <Card title="Contributor Workspace">
          <Skeleton className="h-12 w-2/3" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14" />
            ))}
          </div>
        </Card>

        <Card title="Contribution Share">
          <Skeleton className="h-64" />
        </Card>

        <Card title="Performance Notes">
          <Skeleton className="h-64" />
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="sm:col-span-2 xl:col-span-3">
        <Card title="Contributor Workspace">
          <p className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            Unable to load contributor workspace: {error}
          </p>
        </Card>
      </section>
    )
  }

  if (rows.length === 0) {
    return (
      <section className="sm:col-span-2 xl:col-span-3">
        <Card title="Contributor Workspace">
          <EmptyState
            title="No Contributor Data"
            description="No commit or pull request author data is currently available."
          />
        </Card>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:col-span-2 xl:col-span-3 xl:grid-cols-3 sm:gap-6">
      <div className="xl:col-span-2">
        <Card title="Contributor Workspace">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-slate-900/35 px-3 py-2.5">
              <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-slate-400">
                <Users size={12} />
                Contributors
              </p>
              <p className="mt-1 text-xl font-semibold text-white">{rows.length}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/35 px-3 py-2.5">
              <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-slate-400">
                <GitCommitHorizontal size={12} />
                Total Commits
              </p>
              <p className="mt-1 text-xl font-semibold text-white">{totalCommits}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/35 px-3 py-2.5">
              <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-slate-400">
                <GitMerge size={12} />
                Merged PRs
              </p>
              <p className="mt-1 text-xl font-semibold text-white">{prs.filter((pr) => pr.mergedAt).length}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/35 px-3 py-2.5">
              <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-slate-400">
                <Trophy size={12} />
                Top Author
              </p>
              <p className="mt-1 text-xl font-semibold text-white">{rows[0]?.name ?? 'N/A'}</p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/55 text-slate-300">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Contributor</th>
                  <th className="px-3 py-2.5 font-medium">Commits</th>
                  <th className="px-3 py-2.5 font-medium">Merged PRs</th>
                </tr>
              </thead>
              <tbody>
                {topRows.map((row) => (
                  <tr key={row.name} className="border-t border-white/10 bg-slate-900/30 text-slate-100">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-white/10 text-[10px] font-semibold text-cyan-100">
                          {initials(row.name)}
                        </span>
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">{row.commits}</td>
                    <td className="px-3 py-2.5">{row.mergedPrs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Contribution Share">
        <div className="space-y-3">
          {topRows.slice(0, 6).map((row) => {
            const ratio = totalCommits > 0 ? Math.round((row.commits / totalCommits) * 100) : 0
            return (
              <div key={row.name}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                  <span>{row.name}</span>
                  <span>{ratio}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900/60">
                  <div className="h-full rounded-full bg-cyan-300/70" style={{ width: `${ratio}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-slate-900/35 px-3 py-3 text-xs text-slate-300">
          Higher share concentration can indicate delivery risk if top contributors become unavailable.
        </div>
      </Card>
    </section>
  )
}
