import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../ui/Card'

const commitsPerWeek = [
  { week: 'W1', commits: 128 },
  { week: 'W2', commits: 146 },
  { week: 'W3', commits: 152 },
  { week: 'W4', commits: 171 },
  { week: 'W5', commits: 166 },
  { week: 'W6', commits: 184 },
]

const currentMergeHours = 18.4
const previousMergeHours = 21.1
const mergeDelta = Number((currentMergeHours - previousMergeHours).toFixed(1))
const isMergeTimeDown = mergeDelta < 0

export function RepoVelocity() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 sm:col-span-2 xl:col-span-3">
      <div className="sm:col-span-2">
        <Card title="Commits Per Week">
          <p className="text-xs text-slate-400">6-week commit trend (mock data)</p>

          <div className="mt-4 h-56 w-full">
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
        </Card>
      </div>

      <Card title="Average PR Merge Time">
        <p className="text-xs text-slate-400">Rolling 14-day average</p>
        <p className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-white">{currentMergeHours}h</p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/40 px-2.5 py-1.5 text-xs">
          <span className={isMergeTimeDown ? 'text-emerald-300' : 'text-rose-300'}>
            {isMergeTimeDown ? '▼' : '▲'} {Math.abs(mergeDelta)}h
          </span>
          <span className="text-slate-400">vs last period</span>
        </div>
      </Card>
    </section>
  )
}