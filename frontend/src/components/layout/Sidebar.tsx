const navItems = ['Dashboard', 'Repos', 'Contributors']

export function Sidebar() {
  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl lg:block">
      <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-300/20 text-sm font-semibold text-cyan-200">
          FF
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
          <p className="text-sm font-medium text-slate-100">Analytics</p>
        </div>
      </div>

      <nav aria-label="Primary">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={item}>
              <button
                type="button"
                className={[
                  'w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                  index === 0
                    ? 'bg-cyan-300/15 text-cyan-100 ring-1 ring-inset ring-cyan-300/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
                ].join(' ')}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
