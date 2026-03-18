type DashboardTab = 'dashboard' | 'repos' | 'contributors'

type HeaderProps = {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

const mobileTabs: Array<{ key: DashboardTab; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'repos', label: 'Repos' },
  { key: 'contributors', label: 'Contributors' },
]

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">GitHub Analytics Dashboard</p>
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-white sm:text-3xl">
            FlowForge
          </h1>
        </div>
        <div className="rounded-lg border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-slate-300">
          Live data
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
        {mobileTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={[
              'whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] transition',
              activeTab === tab.key
                ? 'border border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
                : 'border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  )
}
