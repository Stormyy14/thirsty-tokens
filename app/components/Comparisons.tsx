import { useState } from "react";
import {
  CATEGORY_LABELS,
  COMPARISONS,
  pickHighlights,
  type Comparison,
  type ComparisonCategory,
} from "~/lib/comparisons";
import { count } from "~/lib/format";

const MAX_ICONS = 20;

/** An emoji that fills from the bottom up, `fill` in 0–1. */
export function FillEmoji({ emoji, fill, className = "" }: { emoji: string; fill: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, fill));
  return (
    <span className={`fill-emoji ${className}`} aria-hidden>
      <span className="ghost">{emoji}</span>
      <span className="liquid" style={{ clipPath: `inset(${(1 - pct) * 100}% 0 0 0)` }}>
        {emoji}
      </span>
    </span>
  );
}

function IconRow({ c, n }: { c: Comparison; n: number }) {
  if (n <= 1) {
    return <FillEmoji emoji={c.emoji} fill={n} className="text-6xl" />;
  }
  const shown = Math.min(Math.ceil(n), MAX_ICONS);
  const icons = Array.from({ length: shown }, (_, i) => {
    const f = n > MAX_ICONS ? 1 : Math.min(1, n - i);
    return <FillEmoji key={i} emoji={c.emoji} fill={f} className={shown > 8 ? "text-xl" : "text-3xl"} />;
  });
  return (
    <div className="flex flex-wrap items-end gap-1">
      {icons}
      {n > MAX_ICONS && <span className="ml-1 self-center text-sm font-semibold text-foam/60">+ {count(n - MAX_ICONS)} more</span>}
    </div>
  );
}

function ComparisonCard({ c, ml, delay = 0 }: { c: Comparison; ml: number; delay?: number }) {
  const n = ml / c.ml;
  return (
    <article
      className="card flex animate-pop flex-col justify-between gap-4 p-5 transition hover:-translate-y-1 hover:border-aqua/40"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex min-h-16 items-end">
        <IconRow c={c} n={n} />
      </div>
      <div>
        <p className="text-sm text-foam/70">{c.verb}</p>
        <p className="font-display text-3xl leading-tight font-bold text-white">
          {count(n)} <span className="text-xl font-semibold text-foam">{n === 1 ? c.one : c.many}</span>
        </p>
        <p className="mt-1 text-xs text-foam/50">
          {c.size}
          {c.source && <> · {c.source}</>}
        </p>
      </div>
    </article>
  );
}

export function Highlights({ ml }: { ml: number }) {
  const picks = pickHighlights(ml, 6);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {picks.map((c, i) => (
        // key on volume bucket so cards re-pop when the scale changes
        <ComparisonCard key={`${c.id}`} c={c} ml={ml} delay={i * 60} />
      ))}
    </div>
  );
}

const CATS = Object.keys(CATEGORY_LABELS) as ComparisonCategory[];

export function ComparisonExplorer({ ml }: { ml: number }) {
  const [cat, setCat] = useState<ComparisonCategory>("home");
  const items = COMPARISONS.filter((c) => c.category === cat);
  return (
    <div>
      <div role="tablist" aria-label="Comparison category" className="flex flex-wrap gap-2">
        {CATS.map((k) => (
          <button key={k} role="tab" type="button" aria-selected={k === cat} onClick={() => setCat(k)} className="chip">
            {CATEGORY_LABELS[k]}
          </button>
        ))}
      </div>
      {cat === "footprint" && (
        <p className="mt-3 max-w-3xl text-sm text-foam/60">
          “Virtual water” is what it takes to <em>produce</em> something — irrigating the cotton, growing the cattle feed. It puts AI in perspective: a single burger carries more water than millions of chat prompts.
        </p>
      )}
      <ul className="mt-5 divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-deep/60 backdrop-blur-xl">
        {items.map((c) => {
          const n = ml / c.ml;
          return (
            <li key={c.id} className="flex items-center gap-4 px-5 py-3.5">
              <FillEmoji emoji={c.emoji} fill={Math.min(1, n)} className="text-3xl" />
              <div className="min-w-0 flex-1">
                <p className="text-white">
                  {c.verb} <strong className="font-semibold">{count(n)}</strong> {n === 1 ? c.one : c.many}
                </p>
                <p className="text-xs text-foam/50">{c.size}</p>
              </div>
              <div className="hidden w-40 sm:block" aria-hidden>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-aqua transition-[width] duration-700"
                    style={{ width: `${Math.min(100, n * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-[11px] text-foam/40">{n >= 1 ? "full ✓" : `${Math.round(n * 100)}% of one`}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
