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
import { Card } from '../ui/Card'

const commitsPerDay = [
  { day: 'Mon', commits: 22 },
  { day: 'Tue', commits: 31 },
  { day: 'Wed', commits: 28 },
  { day: 'Thu', commits: 36 },
  { day: 'Fri', commits: 44 },
  { day: 'Sat', commits: 19 },
  { day: 'Sun', commits: 25 },
]

const workItems = [
  { label: 'Pull Requests', count: 37 },
  { label: 'Issues', count: 42 },
]

export function ActivityOverview() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 sm:col-span-2 xl:col-span-3">
      <Card title="Commits Over Time">
        <p className="text-xs text-slate-400">Daily commits this week</p>

        <div className="mt-4 h-64 w-full">
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

      <Card title="Pull Requests vs Issues">
        <p className="text-xs text-slate-400">Current sprint throughput</p>

        <div className="mt-4 h-64 w-full">
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