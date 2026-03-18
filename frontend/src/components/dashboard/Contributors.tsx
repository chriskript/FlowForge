import { Card } from '../ui/Card'
import type { GithubCommit } from '../../hooks/useGithubData'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Skeleton'
import { Flame, Users } from 'lucide-react'

type ContributorsProps = {
  commits: GithubCommit[]
  loading: boolean
  error: string | null
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function buildContributors(commits: GithubCommit[]) {
  const counts = new Map<string, number>()

  commits.forEach((commit) => {
    const author = commit.author?.trim() || 'Unknown'
    counts.set(author, (counts.get(author) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([name, commitCount]) => ({ name, commits: commitCount }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 6)
}

function buildHeatmapData(commits: GithubCommit[]) {
  const now = new Date()
  const cells = Array.from({ length: 84 }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (83 - index))
    return { key: dayKey(date), count: 0 }
  })

  const map = new Map(cells.map((cell) => [cell.key, cell]))
  commits.forEach((commit) => {
    const committedDate = new Date(commit.committedAt)
    if (Number.isNaN(committedDate.getTime())) return

    const key = dayKey(committedDate)
    const cell = map.get(key)
    if (cell) {
      cell.count += 1
    }
  })

  const maxCount = cells.reduce((max, cell) => Math.max(max, cell.count), 0)
  return cells.map((cell) => {
    if (cell.count === 0 || maxCount === 0) return 0
    if (cell.count <= Math.ceil(maxCount / 3)) return 1
    if (cell.count <= Math.ceil((maxCount * 2) / 3)) return 2
    return 3
  })
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function heatLevelClass(level: number) {
  if (level === 0) return 'bg-slate-800/70'
  if (level === 1) return 'bg-emerald-900/80'
  if (level === 2) return 'bg-emerald-700/90'
  return 'bg-emerald-500'
}

export function Contributors({ commits, loading, error }: ContributorsProps) {
  const sortedContributors = buildContributors(commits)
  const heatmapData = buildHeatmapData(commits)

  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 sm:col-span-2 xl:col-span-3">
        <div className="sm:col-span-2">
          <Card title="Top Contributors" titleIcon={<Users size={14} />}>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14" />
              ))}
            </div>
          </Card>
        </div>

        <Card title="Contribution Heatmap" titleIcon={<Flame size={14} />}>
          <Skeleton className="mt-4 h-36" />
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 sm:col-span-2 xl:col-span-3">
        <div className="sm:col-span-2">
          <Card title="Top Contributors" titleIcon={<Users size={14} />}>
            <p className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              Unable to load contributors: {error}
            </p>
          </Card>
        </div>

        <Card title="Contribution Heatmap" titleIcon={<Flame size={14} />}>
          <p className="text-xs text-slate-400">No heatmap data while API is unavailable.</p>
        </Card>
      </section>
    )
  }

  if (sortedContributors.length === 0) {
    return (
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 sm:col-span-2 xl:col-span-3">
        <div className="sm:col-span-2">
          <Card title="Top Contributors" titleIcon={<Users size={14} />}>
            <EmptyState
              title="No Contributors Detected"
              description="Commit authors could not be derived from the selected repository data."
            />
          </Card>
        </div>

        <Card title="Contribution Heatmap" titleIcon={<Flame size={14} />}>
          <EmptyState
            title="No Heatmap Activity"
            description="Recent commit history is not available to populate the heatmap."
          />
        </Card>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 sm:col-span-2 xl:col-span-3">
      <div className="sm:col-span-2">
        <Card title="Top Contributors" titleIcon={<Users size={14} />}>
          <p className="text-xs text-slate-400">Sorted by total commits from API history</p>

          <ul className="mt-4 space-y-3">
            {sortedContributors.map((contributor) => (
              <li
                key={contributor.name}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/30 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-cyan-100">
                    {initialsFromName(contributor.name)}
                  </div>
                  <p className="text-sm font-medium text-slate-100">{contributor.name}</p>
                </div>

                <p className="text-sm font-semibold text-cyan-200">{contributor.commits} commits</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Contribution Heatmap" titleIcon={<Flame size={14} />}>
        <p className="text-xs text-slate-400">Last 12 weeks activity snapshot</p>

        <div className="mt-4 grid grid-cols-12 gap-1.5">
          {heatmapData.map((level, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-sm ${heatLevelClass(level)}`}
              aria-label={`Contribution cell ${index + 1}, level ${level}`}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span>Less</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-800/70" />
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-900/80" />
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-700/90" />
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          </div>
          <span>More</span>
        </div>
      </Card>
    </section>
  )
}