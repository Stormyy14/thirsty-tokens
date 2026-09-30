import { Link } from "react-router";
import { estimate } from "~/lib/calc";
import { volume, type Units } from "~/lib/format";
import { getModel, getProvider } from "~/lib/models";
import type { CalcState } from "~/lib/state";

const LINEUP = [
  "claude-fable-5-1",
  "claude-opus-5-5",
  "claude-sonnet-5-5",
  "claude-haiku-4-5",
  "gpt-6-astra",
  "gpt-6-sol",
  "gpt-6-luna",
  "gemini-3-1-pro",
  "gemini-3-8-flash",
  "grok-4-7",
  "deepseek-v4-1-flash",
  "qwen-3-8-max",
  "mistral-medium-3-5",
  "llama-4-maverick",
];

/** Same tokens, same settings — only the model changes. One series, so no legend. */
export function Showdown({ state, units }: { state: CalcState; units: Units }) {
  const ids = LINEUP.includes(state.model) ? LINEUP : [...LINEUP, state.model];
  const rows = ids
    .map((id) => ({ id, est: estimate({ ...state, model: id }) }))
    .sort((a, b) => b.est.totalMl - a.est.totalMl);
  const max = rows[0].est.totalMl || 1;

  return (
    <div className="card p-5 sm:p-7">
      <ul className="space-y-2.5" aria-label="Water use by model for your tokens">
        {rows.map(({ id, est }) => {
          const m = getModel(id);
          const p = getProvider(m.provider);
          const you = id === state.model;
          const w = (est.totalMl / max) * 100;
          return (
            <li key={id} className="group grid grid-cols-[minmax(0,9.5rem)_1fr] items-center gap-3 sm:grid-cols-[13rem_1fr]">
              <span className={`flex items-center gap-2 truncate text-sm ${you ? "font-semibold text-white" : "text-foam/80"}`}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} aria-hidden />
                <span className="truncate">{m.name}</span>
                {you && <span className="rounded bg-sun/20 px-1.5 text-[10px] font-bold text-sun uppercase">you</span>}
              </span>
              <div className="relative flex items-center gap-2">
                <div
                  className={`h-5 max-h-6 rounded-r-[4px] transition-[width] duration-700 ${you ? "bg-sun" : "bg-sea group-hover:bg-aqua"}`}
                  style={{ width: `max(${w}%, 3px)` }}
                />
                <span className="shrink-0 text-xs text-foam/80 tabular-nums">{volume(est.totalMl, units)}</span>
                <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-64 rounded-xl border border-white/10 bg-abyss/95 p-3 text-xs text-foam shadow-xl group-hover:block">
                  <p className="font-semibold text-white">{m.name} · {p.name}</p>
                  <p className="mt-1">Water: {volume(est.totalMl, units)} ({volume(est.lowMl, units)}–{volume(est.highMl, units)})</p>
                  <p>Energy: {est.energyWh.toFixed(est.energyWh < 10 ? 2 : 0)} Wh · PUE {est.pue} · WUE {est.wue.toFixed(2)}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-foam/60">
        <p>Bars share one linear scale. Each model uses its provider's usual data-center region unless you picked one.</p>
        <Link to="/leaderboard" className="btn-ghost" prefetch="intent">Full thirst leaderboard →</Link>
      </div>
    </div>
  );
}
