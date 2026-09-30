import { pickHighlights, SCALE_SCENARIOS } from "~/lib/comparisons";
import { count, volume, type Units } from "~/lib/format";

export function ScaleUp({ ml, units }: { ml: number; units: Units }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {SCALE_SCENARIOS.map((s, i) => {
        const total = ml * s.multiplier;
        const best = pickHighlights(total, 1)[0];
        return (
          <article key={s.id} className="card animate-pop p-5" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="text-3xl" aria-hidden>{s.emoji}</div>
            <h3 className="mt-3 font-semibold text-white">{s.title}</h3>
            <p className="text-xs text-foam/50">{s.caption}</p>
            <p className="mt-4 font-display text-2xl font-bold text-aqua">{volume(total, units)}</p>
            <p className="mt-1 text-sm text-foam/70">
              ≈ {count(total / best.ml)} {best.emoji} {total / best.ml === 1 ? best.one : best.many}
            </p>
          </article>
        );
      })}
    </div>
  );
}
