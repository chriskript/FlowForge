import { BarChart3, FolderGit2, Users } from 'lucide-react'
import { GitHubIcon } from '../ui/GitHubIcon'

type DashboardTab = 'dashboard' | 'repos' | 'contributors'

const navItems: Array<{ key: DashboardTab; label: string; icon: typeof BarChart3 }> = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'repos', label: 'Repos', icon: FolderGit2 },
  { key: 'contributors', label: 'Contributors', icon: Users },
]

type SidebarProps = {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl lg:block">
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-300/20 text-sm font-semibold text-cyan-200">
          <GitHubIcon size={16} iconTitle="GitHub" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
          <p className="text-sm font-medium text-slate-100">Analytics</p>
        </div>
      </div>

      <nav aria-label="Primary">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onTabChange(item.key)}
                  className={[
                    'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-200',
                    activeTab === item.key
                      ? 'bg-cyan-300/15 text-cyan-100 ring-1 ring-inset ring-cyan-300/30'
                      : 'text-slate-300 hover:translate-x-1 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
