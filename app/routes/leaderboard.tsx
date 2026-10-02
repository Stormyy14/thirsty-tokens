import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/leaderboard";
import { TierBadge } from "~/components/Calculator";
import { FillEmoji } from "~/components/Comparisons";
import { Dropdown, type DropdownOption } from "~/components/Dropdown";
import { estimate, type Scope } from "~/lib/calc";
import { pickHighlights } from "~/lib/comparisons";
import { count, nice, volume, type Units } from "~/lib/format";
import { getModel, getProvider, MODELS, PROVIDERS, TIERS } from "~/lib/models";
import { REGIONS } from "~/lib/regions";
import { MIXES } from "~/lib/state";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "The Thirst Leaderboard · Thirsty Tokens" },
    { name: "description", content: "Every AI model ranked by estimated water per million tokens — Claude, GPT, Gemini, Grok, DeepSeek, Llama, Mistral, Qwen and more." },
  ];
}

const PER = 1_000_000;
type MixKey = keyof typeof MIXES;

export default function Leaderboard() {
  const [region, setRegion] = useState("auto");
  const [scope, setScope] = useState<Scope>("full");
  const [mix, setMix] = useState<MixKey>("chat");
  const [units, setUnits] = useState<Units>("metric");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [a, setA] = useState("claude-opus-5-5");
  const [b, setB] = useState("claude-haiku-4-5");

  const rows = useMemo(() => {
    return MODELS.filter((m) => !hidden.has(m.provider))
      .map((m) => ({
        m,
        est: estimate({ model: m.id, tokens: PER, outShare: MIXES[mix].outShare, cacheShare: MIXES[mix].cacheShare, thinking: "off", region, scope }),
      }))
      .sort((x, y) => y.est.totalMl - x.est.totalMl);
  }, [region, scope, mix, hidden]);

  const max = rows[0]?.est.totalMl ?? 1;
  const top = rows[0];
  const bottom = rows[rows.length - 1];

  const toggleProvider = (id: string) =>
    setHidden((h) => {
      const n = new Set(h);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
      <p className="label text-aqua">Leaderboard</p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl">The Thirst Leaderboard 🏆</h1>
      <p className="mt-4 max-w-2xl text-lg text-foam/80">
        Estimated water per <strong className="text-white">one million tokens</strong>. Lower is better — unless you're a cooling tower.
      </p>

      {top && bottom && (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Tile emoji="🥵" label="Thirstiest" title={top.m.name} value={volume(top.est.totalMl, units)} />
          <Tile emoji="🌵" label="Most frugal" title={bottom.m.name} value={volume(bottom.est.totalMl, units)} />
          <Tile emoji="📏" label="Spread" title="Thirstiest ÷ most frugal" value={`${count(top.est.totalMl / Math.max(bottom.est.totalMl, 1e-9))}×`} />
        </div>
      )}

      {/* filters: one row above the chart */}
      <div className="card mt-8 flex flex-wrap items-end gap-4 p-4 sm:p-5">
        <Filter label="Region" className="min-w-60 flex-1">
          <Dropdown
            size="sm"
            label="Region"
            value={region}
            onChange={setRegion}
            options={[
              { value: "auto", icon: "✨", label: "Auto", display: "Auto · each provider's usual fleet", description: "Each provider's usual fleet" },
              ...REGIONS.map((r) => ({ value: r.id, icon: r.icon, label: r.name, description: r.note, meta: <span className="font-mono">{r.ewif} L/kWh</span> })),
            ]}
          />
        </Filter>
        <Filter label="Workload" className="min-w-48">
          <Dropdown
            size="sm"
            label="Workload"
            value={mix}
            onChange={(v) => setMix(v as MixKey)}
            options={(Object.keys(MIXES) as MixKey[]).map((k) => ({ value: k, icon: MIXES[k].emoji, label: MIXES[k].label, description: MIXES[k].blurb }))}
          />
        </Filter>
        <Filter label="What counts" className="min-w-52">
          <Dropdown
            size="sm"
            label="What counts"
            value={scope}
            onChange={(v) => setScope(v as Scope)}
            options={[
              { value: "full", icon: "🏭", label: "Cooling + power plants", description: "On-site cooling plus water evaporated making the power" },
              { value: "onsite", icon: "❄️", label: "Cooling only", description: "What most companies report" },
            ]}
          />
        </Filter>
        <Filter label="Units" className="min-w-36">
          <Dropdown
            size="sm"
            label="Units"
            value={units}
            onChange={(v) => setUnits(v as Units)}
            options={[
              { value: "metric", icon: "🧪", label: "Liters" },
              { value: "imperial", icon: "🥛", label: "Gallons" },
            ]}
          />
        </Filter>
        <div className="flex w-full flex-wrap gap-2 pt-1">
          {PROVIDERS.map((p) => (
            <button key={p.id} type="button" className="chip" aria-pressed={!hidden.has(p.id)} onClick={() => toggleProvider(p.id)}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color, opacity: hidden.has(p.id) ? 0.3 : 1 }} aria-hidden />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* The chart is also the table: every value is labelled and the rows are real table rows. */}
      <div className="card mt-6 overflow-x-auto p-2 sm:p-4">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-1 text-sm">
          <caption className="sr-only">Estimated water per one million tokens by model</caption>
          <thead>
            <tr className="text-left text-[11px] tracking-wider text-foam/50 uppercase">
              <th className="w-10 px-3 py-2 font-semibold">#</th>
              <th className="px-3 py-2 font-semibold">Model</th>
              <th className="px-3 py-2 font-semibold">Tier</th>
              <th className="w-[45%] px-3 py-2 font-semibold">Water per 1M tokens</th>
              <th className="px-3 py-2 text-right font-semibold">≈</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ m, est }, i) => {
              const p = getProvider(m.provider);
              const eq = pickHighlights(est.totalMl, 1)[0];
              const n = est.totalMl / eq.ml;
              return (
                <tr key={m.id} className="group rounded-xl hover:bg-white/[0.04]">
                  <td className="rounded-l-xl px-3 py-2.5 text-foam/50 tabular-nums">{i + 1}</td>
                  <td className="px-3 py-2.5">
                    <Link to={`/?m=${m.id}&t=${PER}&mix=${mix}${region !== "auto" ? `&r=${region}` : ""}`} className="flex items-center gap-2 font-medium text-white hover:text-aqua">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} aria-hidden />
                      {m.name}
                      <span className="hidden text-xs font-normal text-foam/50 sm:inline">{p.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5"><TierBadge tier={m.tier} /></td>
                  <td className="px-3 py-2.5">
                    <div className="relative flex items-center gap-2">
                      <div
                        className="h-4 rounded-r-[4px] bg-sea transition-[width] duration-500 group-hover:bg-aqua"
                        style={{ width: `max(${(est.totalMl / max) * 80}%, 3px)` }}
                      />
                      <span className="shrink-0 text-foam tabular-nums">{volume(est.totalMl, units)}</span>
                      <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-72 rounded-xl border border-white/10 bg-abyss/95 p-3 text-xs text-foam shadow-xl group-hover:block">
                        <p className="font-semibold text-white">{m.name}</p>
                        <p className="mt-1">Range: {volume(est.lowMl, units)} – {volume(est.highMl, units)}</p>
                        <p>Energy: {nice(est.energyWh / 1000)} kWh · PUE {est.pue} · WUE {nice(est.wue)} L/kWh · grid {est.ewif} L/kWh</p>
                        <p className="mt-1 text-foam/60">Calibration: {m.calibration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="rounded-r-xl px-3 py-2.5 text-right whitespace-nowrap text-foam/70">
                    {count(n)} {eq.emoji}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <HeadToHead a={a} b={b} setA={setA} setB={setB} region={region} scope={scope} mix={mix} units={units} />

      <p className="mt-10 max-w-3xl text-sm text-foam/60">
        Per-model figures are tier estimates, not measurements — labs don't publish per-token energy for closed models.
        Models marked <em>disclosed</em> or <em>benchmarked</em> are anchored to public data. See the{" "}
        <Link to="/methodology" className="text-aqua underline underline-offset-4">methodology</Link>.
      </p>
    </div>
  );
}

function Tile({ emoji, label, title, value }: { emoji: string; label: string; title: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="label">{label}</p>
      <p className="mt-2 flex items-center gap-3 text-3xl font-bold text-white">
        <span aria-hidden>{emoji}</span> {value}
      </p>
      <p className="mt-1 text-sm text-foam/70">{title}</p>
    </div>
  );
}

function HeadToHead({
  a, b, setA, setB, region, scope, mix, units,
}: {
  a: string; b: string; setA: (v: string) => void; setB: (v: string) => void;
  region: string; scope: Scope; mix: MixKey; units: Units;
}) {
  const run = (id: string) =>
    estimate({ model: id, tokens: PER, outShare: MIXES[mix].outShare, cacheShare: MIXES[mix].cacheShare, thinking: "off", region, scope });
  const ea = run(a);
  const eb = run(b);
  const [big, small] = ea.totalMl >= eb.totalMl ? [ea, eb] : [eb, ea];
  const ratio = big.totalMl / Math.max(small.totalMl, 1e-9);
  const diff = big.totalMl - small.totalMl;
  const eq = pickHighlights(diff, 1)[0];

  return (
    <section className="mt-16">
      <p className="label text-aqua">Head to head</p>
      <h2 className="section-title mt-2">Who's thirstier?</h2>
      <div className="card mt-6 grid items-center gap-6 p-5 sm:p-7 md:grid-cols-[1fr_auto_1fr]">
        <ModelSelect value={a} onChange={setA} label="Model A" />
        <span className="text-center font-display text-3xl font-bold text-foam/50">vs</span>
        <ModelSelect value={b} onChange={setB} label="Model B" />
        <div className="md:col-span-3">
          {a === b ? (
            <p className="text-center text-foam/70">Pick two different models. They're equally thirsty, obviously. 🫠</p>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <FillEmoji emoji="🥤" fill={Math.min(1, 1 / ratio)} className="text-7xl" />
              <p className="font-display text-3xl font-bold text-white sm:text-4xl">
                {getModel(big.model.id).name} drinks <span className="text-sun">{count(ratio)}×</span> more
              </p>
              <p className="max-w-xl text-foam/70">
                Per million tokens that's an extra {volume(diff, units)} — about {count(diff / eq.ml)} {eq.emoji}{" "}
                {diff / eq.ml === 1 ? eq.one : eq.many}.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const MODEL_OPTIONS: DropdownOption[] = PROVIDERS.flatMap((p) =>
  MODELS.filter((m) => m.provider === p.id).map((m) => ({
    value: m.id,
    group: p.name,
    icon: <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />,
    label: m.name,
    description: `${p.name} · ${TIERS[m.tier].label}`,
  })),
);

function Filter({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`text-sm ${className}`}>
      <p className="mb-1.5 text-foam/80">{label}</p>
      {children}
    </div>
  );
}

function ModelSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return <Filter label={label}><Dropdown label={label} value={value} onChange={onChange} options={MODEL_OPTIONS} /></Filter>;
}
