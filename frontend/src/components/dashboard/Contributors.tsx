import { Card } from '../ui/Card'

type Contributor = {
  name: string
  commits: number
}

const contributors: Contributor[] = [
  { name: 'Alex Rivera', commits: 126 },
  { name: 'Jordan Lee', commits: 112 },
  { name: 'Sam Patel', commits: 97 },
  { name: 'Morgan Chen', commits: 84 },
  { name: 'Taylor Brooks', commits: 73 },
]

const heatmapData = [
  0, 1, 2, 0, 3, 1, 2, 1, 0, 2, 3, 1,
  1, 0, 2, 3, 1, 2, 1, 0, 2, 3, 2, 1,
  2, 3, 1, 0, 2, 1, 0, 2, 3, 1, 2, 0,
  1, 2, 3, 1, 0, 2, 1, 3, 2, 0, 1, 2,
  0, 1, 2, 3, 1, 0, 2, 1, 3, 2, 1, 0,
  1, 0, 2, 1, 3, 2, 0, 1, 2, 3, 1, 0,
  2, 1, 3, 0, 1, 2, 0, 3, 1, 2, 1, 0,
  1, 2, 3, 1, 0, 2, 1, 3, 2, 0, 1, 2,
]

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

export function Contributors() {
  const sortedContributors = [...contributors].sort((a, b) => b.commits - a.commits)

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 sm:col-span-2 xl:col-span-3">
      <div className="sm:col-span-2">
        <Card title="Top Contributors">
          <p className="text-xs text-slate-400">Sorted by total commits (mock data)</p>

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

      <Card title="Contribution Heatmap">
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