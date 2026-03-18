import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../ui/Card'

const issueMetrics = [
  { status: 'Opened', count: 48 },
  { status: 'Closed', count: 61 },
]

const backlogSize = 134
const closureDelta = issueMetrics[1].count - issueMetrics[0].count

export function IssueThroughput() {
  return (
    <Card title="Issue Throughput">
      <p className="text-xs text-slate-400">Issues opened vs closed (current week)</p>

      <div className="mt-4 h-56 w-full">
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