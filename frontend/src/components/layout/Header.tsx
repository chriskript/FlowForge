export function Header() {
  return (
    <header className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
      <div className="flex items-center justify-between gap-3">
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
    </header>
  )
}
