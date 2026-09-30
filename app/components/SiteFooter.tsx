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
        <div className="space-y-2">
          <p className="label">Inspired by</p>
          <a className="block hover:text-white" href="https://tokenwater.org/" rel="noreferrer" target="_blank">tokenwater.org</a>
          <a className="block hover:text-white" href="https://arxiv.org/abs/2304.03271" rel="noreferrer" target="_blank">Li et al., “Making AI Less Thirsty”</a>
          <p className="pt-2 text-foam/50">Served from the edge by Cloudflare Workers.</p>
        </div>
      </div>
    </footer>
  );
}
