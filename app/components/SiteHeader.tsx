import { Link, NavLink } from "react-router";
import { Droplet } from "./Droplet";

const NAV = [
  { to: "/", label: "Calculator", end: true },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/methodology", label: "Methodology" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-abyss/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="Thirsty Tokens home">
          <Droplet className="h-9 w-9 transition group-hover:rotate-12" />
          <span className="hidden font-display text-lg font-bold tracking-tight text-white min-[480px]:inline sm:text-xl">
            Thirsty<span className="text-aqua">Tokens</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              prefetch="intent"
              className={({ isActive }) =>
                `rounded-full px-2 py-1.5 text-[13px] font-medium transition sm:px-4 sm:text-sm ${
                  isActive ? "bg-aqua/15 text-white" : "text-foam/70 hover:text-white"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
