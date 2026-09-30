import { useState } from "react";
import { useAnimatedNumber } from "~/hooks/useAnimatedNumber";
import type { Estimate } from "~/lib/calc";
import { vesselFor } from "~/lib/comparisons";
import { count, energy, mass, nice, volume, volumeParts, type Units } from "~/lib/format";
import { getRegion } from "~/lib/regions";
import { Droplet } from "./Droplet";

interface Props {
  est: Estimate;
  units: Units;
  tokens: number;
  scope: "full" | "onsite";
}

export function ResultPanel({ est, units, tokens, scope }: Props) {
  const animated = useAnimatedNumber(est.totalMl);
  const parts = volumeParts(animated, units);
  const { vessel, fill } = vesselFor(est.totalMl);
  const region = getRegion(est.regionId);
  const mood = est.totalMl < 1_000_000 ? "happy" : est.totalMl < 1e9 ? "worried" : "shocked";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label">Your tokens drank</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 font-sans text-white" aria-live="polite">
            <span className="text-6xl font-bold tracking-tight sm:text-7xl">{parts.value}</span>
            <span className="text-2xl font-semibold text-aqua sm:text-3xl">{parts.unit}</span>
          </p>
          <p className="mt-2 text-sm text-foam/70">
            of fresh water · likely between <strong className="text-foam">{volume(est.lowMl, units)}</strong> and{" "}
            <strong className="text-foam">{volume(est.highMl, units)}</strong>
          </p>
        </div>
        <Droplet mood={mood} className="h-16 w-16 shrink-0 animate-bob sm:h-20 sm:w-20" />
      </div>

      <div className="mt-6 grid items-center gap-6 sm:grid-cols-[150px_1fr]">
        <Vessel fill={Math.min(1, fill)} emoji={vessel.emoji} />
        <div>
          <p className="font-display text-2xl leading-tight font-bold text-white">
            {fill > 1 ? (
              <>That's {count(fill)} {vessel.many}!</>
            ) : (
              <>
                Fills {fill >= 0.995 ? "a whole" : `${fill < 0.01 ? "<1" : Math.round(fill * 100)}% of a`} {vessel.one}
              </>
            )}
          </p>
          <p className="mt-1 text-sm text-foam/60">{vessel.emoji} {vessel.size}</p>
          <SplitBar est={est} units={units} scope={scope} />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Electricity" value={energy(est.energyWh)} hint={`PUE ${est.pue}`} />
        <Stat label="CO₂ bonus" value={mass(est.co2g, units)} hint={`${region.carbon} g/kWh grid`} />
        <Stat label="Per 1K tokens" value={volume((est.totalMl / Math.max(tokens, 1)) * 1000, units)} hint="average" />
        <Stat label="Served from" value={`${region.icon} ${shortRegion(region.name)}`} hint={`${nice(est.ewif)} L/kWh grid`} />
      </dl>

      <ShareBar est={est} units={units} tokens={tokens} />
    </div>
  );
}

function shortRegion(name: string) {
  return name.replace(/\s*\(.*\)/, "").replace("Best case: ", "");
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <dt className="text-[11px] font-semibold tracking-wider text-foam/60 uppercase">{label}</dt>
      <dd className="mt-1 truncate text-lg font-semibold text-white" title={value}>{value}</dd>
      <dd className="text-[11px] text-foam/50">{hint}</dd>
    </div>
  );
}

/** Where the water goes: two segments, 2px surface gap, legend + labels. */
function SplitBar({ est, units, scope }: { est: Estimate; units: Units; scope: "full" | "onsite" }) {
  const total = Math.max(est.totalMl, 1e-12);
  const on = est.onsiteMl / total;
  const off = est.offsiteMl / total;
  return (
    <div className="mt-4">
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-white/5">
        {on > 0 && <div className="h-full rounded-l-full bg-aqua transition-[width] duration-700" style={{ width: `${on * 100}%` }} title={`Cooling: ${volume(est.onsiteMl, units)}`} />}
        {off > 0 && <div className="h-full rounded-r-full bg-sea transition-[width] duration-700" style={{ width: `${off * 100}%` }} title={`Power plants: ${volume(est.offsiteMl, units)}`} />}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foam/70">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-aqua" aria-hidden /> Cooling towers {volume(est.onsiteMl, units)} ({Math.round(on * 100)}%)
        </span>
        {scope === "full" ? (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-sea" aria-hidden /> Power plants {volume(est.offsiteMl, units)} ({Math.round(off * 100)}%)
          </span>
        ) : (
          <span className="text-foam/50">Power-plant water excluded</span>
        )}
      </div>
    </div>
  );
}

function Vessel({ fill, emoji }: { fill: number; emoji: string }) {
  const h = 160;
  const liquidTop = 12 + (1 - fill) * (h - 24);
  return (
    <div className="relative mx-auto w-[150px]">
      <svg viewBox="0 0 150 170" className="w-full" role="img" aria-label={`${Math.round(fill * 100)}% full`}>
        <defs>
          <clipPath id="vessel-clip">
            <path d="M20 10 H130 L118 156 Q117 164 108 164 H42 Q33 164 32 156 Z" />
          </clipPath>
          <linearGradient id="vessel-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#1d7fd6" />
          </linearGradient>
        </defs>
        <path d="M20 10 H130 L118 156 Q117 164 108 164 H42 Q33 164 32 156 Z" fill="rgb(255 255 255 / 0.04)" />
        <g clipPath="url(#vessel-clip)">
          <g style={{ transform: `translateY(${liquidTop}px)`, transition: "transform 1.2s cubic-bezier(0.22,1,0.36,1)" }}>
            <g className="animate-wave" style={{ animationDuration: "4s" }}>
              <path d="M0 6 Q 18.75 0 37.5 6 T 75 6 T 112.5 6 T 150 6 T 187.5 6 T 225 6 T 262.5 6 T 300 6 V 400 H 0 Z" fill="url(#vessel-water)" />
            </g>
          </g>
        </g>
        <path d="M20 10 H130 L118 156 Q117 164 108 164 H42 Q33 164 32 156 Z" fill="none" stroke="rgb(186 230 253 / 0.5)" strokeWidth="2.5" />
        <path d="M34 22 L40 140" stroke="#fff" strokeOpacity="0.25" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="absolute -top-3 -right-2 text-4xl drop-shadow-lg" aria-hidden>{emoji}</span>
    </div>
  );
}

function ShareBar({ est, units, tokens }: { est: Estimate; units: Units; tokens: number }) {
  const [copied, setCopied] = useState(false);
  const text = `${tokens.toLocaleString("en-US")} tokens on ${est.model.name} drank ≈${volume(est.totalMl, units)} of water 💧`;

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Thirsty Tokens", text, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button type="button" onClick={share} className="btn-primary">
        {copied ? "✓ Link copied" : "Share this result"}
      </button>
      <a href="#receipt" className="btn-ghost">🧾 Get the receipt</a>
      <button
        type="button"
        className="btn-ghost"
        onClick={() =>
          window.open(
            `https://bsky.app/intent/compose?text=${encodeURIComponent(`${text}\n${window.location.href}`)}`,
            "_blank",
            "noopener",
          )
        }
      >
        Post to Bluesky
      </button>
    </div>
  );
}
