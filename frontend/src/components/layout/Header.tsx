export function Header() {
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
        <span className="whitespace-nowrap rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-[11px] text-cyan-100">
          Dashboard
        </span>
        <span className="whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
          Repos
        </span>
        <span className="whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
          Contributors
        </span>
      </div>
    </header>
  )
}
