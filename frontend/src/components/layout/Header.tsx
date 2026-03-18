import { Activity, BarChart3, FolderGit2, LayoutDashboard, Users } from 'lucide-react'
import { GitHubIcon } from '../ui/GitHubIcon'

type DashboardTab = 'dashboard' | 'repos' | 'contributors'

type HeaderProps = {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

const mobileTabs: Array<{ key: DashboardTab; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'repos', label: 'Repos', icon: FolderGit2 },
  { key: 'contributors', label: 'Contributors', icon: Users },
]

const modeLabel: Record<DashboardTab, string> = {
  dashboard: 'Unified Overview',
  repos: 'Repository Workspace',
  contributors: 'Contributor Workspace',
}

const modeIcon: Record<DashboardTab, typeof LayoutDashboard> = {
  dashboard: BarChart3,
  repos: FolderGit2,
  contributors: Users,
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const ModeIcon = modeIcon[activeTab]

  return (
    <header className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">GitHub Analytics Dashboard</p>
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-white sm:text-3xl">
            FlowForge
          </h1>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-cyan-200/90">
            <ModeIcon size={13} />
            {modeLabel[activeTab]}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-slate-300">
          <GitHubIcon size={12} className="text-slate-200" iconTitle="GitHub" />
          <Activity size={13} />
          Live data
          <span className="relative inline-flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={[
                'inline-flex whitespace-nowrap items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition',
                activeTab === tab.key
                  ? 'border border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
                  : 'border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}
