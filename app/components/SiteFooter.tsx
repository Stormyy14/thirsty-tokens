import { Link } from "react-router";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/5 bg-abyss/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-foam/70 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-lg font-bold text-white">
            Thirsty<span className="text-aqua">Tokens</span> 💧
          </p>
          <p className="mt-2 max-w-xs">
            Every number here is an estimate with a wide error bar. We show our work so you can argue with it.
          </p>
        </div>
        <div className="space-y-2">
          <p className="label">Explore</p>
          <Link className="block hover:text-white" to="/">Calculator</Link>
          <Link className="block hover:text-white" to="/leaderboard">Thirst leaderboard</Link>
          <Link className="block hover:text-white" to="/methodology">Methodology & sources</Link>
          <a className="block hover:text-white" href="/api/estimate?model=claude-sonnet-5-5&tokens=1000000">JSON API</a>
        </div>
        <div className="sm:justify-self-end">
          <p className="label">Made by</p>
          <a
            href="https://github.com/Stormyy14"
            target="_blank"
            rel="noreferrer"
            className="group mt-3 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] py-2.5 pr-4 pl-2.5 transition hover:-translate-y-0.5 hover:border-aqua/50 hover:bg-aqua/10"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-white transition group-hover:bg-aqua group-hover:text-abyss">
              <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
            </span>
            <span>
              <span className="block font-display text-base font-bold text-white">Correia</span>
              <span className="block text-xs text-foam/60 group-hover:text-aqua">@Stormyy14 on GitHub ↗</span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
