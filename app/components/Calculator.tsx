import { useEffect, useId, useState, type ReactNode } from "react";
import { Dropdown } from "./Dropdown";
import { THINKING, type Thinking } from "~/lib/calc";
import { compactTokens, parseTokens } from "~/lib/format";
import { getModel, getProvider, modelsByProvider, PROVIDERS, TIERS } from "~/lib/models";
import { getRegion, REGIONS } from "~/lib/regions";
import { MAX_TOKENS, MIXES, PRESETS, type CalcState, type MixId } from "~/lib/state";

interface Props {
  state: CalcState;
  update: (patch: Partial<CalcState>) => void;
  suggestedRegion: string | null;
  country: string | null;
}

export function Calculator({ state, update, suggestedRegion, country }: Props) {
  return (
    <div className="divide-y divide-white/[0.07] [&>*]:py-8 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
      <TokenField state={state} update={update} />
      <ModelPicker state={state} update={update} />
      <MixPicker state={state} update={update} />
      <Advanced state={state} update={update} suggestedRegion={suggestedRegion} country={country} />
    </div>
  );
}

function StepTitle({ n, children, htmlFor }: { n: number; children: ReactNode; htmlFor?: string }) {
  const Tag = htmlFor ? "label" : "p";
  return (
    <Tag htmlFor={htmlFor} className="flex items-center gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aqua/15 font-display text-sm font-bold text-aqua ring-1 ring-aqua/40" aria-hidden>
        {n}
      </span>
      <span className="font-display text-lg font-semibold text-white">{children}</span>
    </Tag>
  );
}

/* ───────────────────────────── tokens ───────────────────────────── */

const SLIDER_MAX = 1300; // 10^13

function TokenField({ state, update }: Pick<Props, "state" | "update">) {
  const id = useId();
  const [text, setText] = useState(() => state.tokens.toLocaleString("en-US"));
  const [focused, setFocused] = useState(false);
  const parsed = parseTokens(text);
  const invalid = text.trim() !== "" && (!Number.isFinite(parsed) || parsed <= 0);

  // Keep the box in sync when a preset or the slider changes tokens.
  useEffect(() => {
    if (!focused) setText(state.tokens.toLocaleString("en-US"));
  }, [state.tokens, focused]);

  const words = state.tokens * 0.75;
  const pages = words / 500;

  return (
    <div>
      <StepTitle n={1} htmlFor={id}>
        How many tokens?
      </StepTitle>
      <div className="mt-4 flex items-stretch gap-3">
        <div className="relative flex-1">
          <input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={text}
            aria-invalid={invalid}
            aria-describedby={`${id}-hint`}
            onFocus={(e) => {
              setFocused(true);
              e.target.select();
            }}
            onBlur={() => {
              setFocused(false);
              setText(state.tokens.toLocaleString("en-US"));
            }}
            onChange={(e) => {
              setText(e.target.value);
              const n = parseTokens(e.target.value);
              if (Number.isFinite(n) && n > 0) update({ tokens: Math.min(MAX_TOKENS, n) });
            }}
            className={`field pr-20 font-display text-3xl font-bold tracking-tight sm:text-4xl ${invalid ? "border-coral" : ""}`}
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-foam/50">tokens</span>
        </div>
      </div>
      <p id={`${id}-hint`} className="mt-2 text-sm text-foam/60">
        {invalid ? (
          <span className="text-coral">Try something like “1500”, “250k” or “3.5M”.</span>
        ) : (
          <>
            ≈ {compactTokens(words)} words · {pages < 1 ? "less than a page" : `${compactTokens(pages)} pages`}
            {pages > 300 && <> · {compactTokens(pages / 300)} novels</>}
          </>
        )}
      </p>
      <input
        type="range"
        aria-label="Tokens (logarithmic)"
        min={0}
        max={SLIDER_MAX}
        step={1}
        value={Math.round(Math.log10(Math.max(1, state.tokens)) * 100)}
        onChange={(e) => {
          const raw = Math.pow(10, Number(e.target.value) / 100);
          update({ tokens: roundNice(raw) });
        }}
        className="mt-4 w-full"
      />
      <div className="mt-1 flex justify-between text-[11px] text-foam/40">
        <span>1</span>
        <span>1K</span>
        <span>1M</span>
        <span>1B</span>
        <span>10T</span>
      </div>

      <p className="mt-7 mb-3 text-sm text-foam/70">…or pick a moment:</p>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
        {PRESETS.map((p) => {
          const active = state.tokens === p.tokens && state.mix === p.mix;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => update({ tokens: p.tokens, mix: p.mix, outShare: MIXES[p.mix].outShare, cacheShare: MIXES[p.mix].cacheShare })}
              className="tile group flex flex-col gap-2 px-2.5 py-3 sm:px-3"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-xl transition group-hover:scale-110 group-aria-pressed:bg-abyss/50" aria-hidden>
                  {p.emoji}
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[11px] text-foam/70 transition group-aria-pressed:bg-aqua group-aria-pressed:font-semibold group-aria-pressed:text-abyss">
                  {compactTokens(p.tokens)}
                </span>
              </span>
              <span>
                <span className="block text-[13px] leading-snug font-semibold text-white">{p.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-foam/55 group-aria-pressed:text-foam/80">{p.detail}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function roundNice(n: number) {
  if (n < 10) return Math.max(1, Math.round(n));
  const mag = Math.pow(10, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / mag) * mag;
}

/* ───────────────────────────── model ───────────────────────────── */

function ModelPicker({ state, update }: Pick<Props, "state" | "update">) {
  const current = getModel(state.model);
  const [providerId, setProviderId] = useState(current.provider);
  useEffect(() => setProviderId(current.provider), [current.provider]);
  const models = modelsByProvider(providerId);

  return (
    <div>
      <StepTitle n={2}>Which AI?</StepTitle>
      <div role="tablist" aria-label="Provider" className="mt-4 flex flex-wrap gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            role="tab"
            type="button"
            aria-selected={p.id === providerId}
            onClick={() => {
              setProviderId(p.id);
              if (p.id !== current.provider) update({ model: modelsByProvider(p.id)[0].id });
            }}
            className="chip chip-solid"
          >
            <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10" style={{ background: p.color }} aria-hidden />
            {p.name}
          </button>
        ))}
      </div>

      <div role="radiogroup" aria-label="Model" className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {models.map((m) => {
          const selected = m.id === state.model;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => update({ model: m.id })}
              className="tile group p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-white">{m.name}</span>
                <TierBadge tier={m.tier} />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-foam/60">
                {m.released !== "—" && <span>{formatReleased(m.released)}</span>}
                {m.reasoning && <span className="rounded bg-white/5 px-1.5">🧠 reasoning</span>}
                {m.openWeights && <span className="rounded bg-white/5 px-1.5">🔓 open weights</span>}
                {m.calibration !== "estimated" && <span className="rounded bg-kelp/10 px-1.5 text-kelp">✓ {m.calibration}</span>}
              </div>
            </button>
          );
        })}
      </div>
      {current.note && <p className="mt-2 text-sm text-foam/60">ℹ️ {current.note}</p>}
    </div>
  );
}

const TIER_STYLE: Record<string, string> = {
  nano: "bg-kelp/15 text-kelp",
  small: "bg-kelp/10 text-kelp",
  mid: "bg-aqua/10 text-aqua",
  large: "bg-sea/20 text-foam",
  frontier: "bg-sun/15 text-sun",
  ultra: "bg-coral/15 text-coral",
};

export function TierBadge({ tier }: { tier: keyof typeof TIERS }) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TIER_STYLE[tier]}`} title={TIERS[tier].blurb}>
      {TIERS[tier].label}
    </span>
  );
}

function formatReleased(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

/* ───────────────────────────── mix ───────────────────────────── */

function MixPicker({ state, update }: Pick<Props, "state" | "update">) {
  const setMix = (mix: MixId) => {
    if (mix === "custom") update({ mix });
    else update({ mix, outShare: MIXES[mix].outShare, cacheShare: MIXES[mix].cacheShare });
  };

  return (
    <div>
      <StepTitle n={3}>What kind of work?</StepTitle>
      <p className="mt-2 text-sm text-foam/60">Writing tokens (output) costs ~5× more energy than reading them (input).</p>
      <div role="radiogroup" aria-label="Kind of work" className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {(Object.keys(MIXES) as (keyof typeof MIXES)[]).map((k) => {
          const mix = MIXES[k];
          return (
            <button key={k} type="button" role="radio" aria-checked={state.mix === k} onClick={() => setMix(k)} className="tile group flex flex-col p-3.5">
              <span className="flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-xl group-aria-checked:bg-abyss/50" aria-hidden>
                  {mix.emoji}
                </span>
                <span
                  className="grid h-5 w-5 place-items-center rounded-full border-2 border-white/20 text-[11px] font-bold text-transparent transition group-aria-checked:border-aqua group-aria-checked:bg-aqua group-aria-checked:text-abyss"
                  aria-hidden
                >
                  ✓
                </span>
              </span>
              <span className="mt-3 text-sm font-semibold text-white">{mix.label}</span>
              <span className="mt-0.5 text-xs leading-snug text-foam/60">{mix.blurb}</span>
              <span className="mt-auto pt-3">
                <span className="block h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
                  <span className="block h-full rounded-full bg-aqua/70 group-aria-checked:bg-aqua" style={{ width: `${Math.max(4, mix.outShare * 100)}%` }} />
                </span>
                <span className="mt-1.5 block font-mono text-[10.5px] text-foam/55 group-aria-checked:text-foam/85">{mix.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <button type="button" className="chip chip-solid" aria-pressed={state.mix === "custom"} onClick={() => setMix("custom")}>
          <span aria-hidden>🎛️</span> Custom mix
        </button>
        {state.mix !== "custom" && <span className="text-xs text-foam/50">Know your exact input/output split? Set it yourself.</span>}
      </div>
      {state.mix === "custom" && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-aqua/30 bg-aqua/[0.05] p-4 sm:grid-cols-2">
          <PercentSlider label="Output share" value={state.outShare} onChange={(v) => update({ outShare: v })} />
          <PercentSlider label="Input served from cache" value={state.cacheShare} onChange={(v) => update({ cacheShare: v })} />
        </div>
      )}
    </div>
  );
}

function PercentSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div>
      <div className="flex justify-between text-sm">
        <label htmlFor={id} className="text-foam/80">{label}</label>
        <span className="font-mono text-white tabular-nums">{Math.round(value * 100)}%</span>
      </div>
      <input id={id} type="range" min={0} max={100} value={Math.round(value * 100)} onChange={(e) => onChange(Number(e.target.value) / 100)} className="mt-2 w-full" />
    </div>
  );
}

/* ───────────────────────────── advanced ───────────────────────────── */

function Advanced({ state, update, suggestedRegion, country }: Props) {
  const provider = getProvider(getModel(state.model).provider);
  const regionId = useId();
  const autoRegion = getRegion(provider.defaultRegion);
  const suggestion = suggestedRegion ? getRegion(suggestedRegion) : null;

  return (
    <div className="space-y-5">
      <StepTitle n={4}>Fine print</StepTitle>

      <div>
        <label htmlFor={regionId} className="text-sm text-foam/80">Data center location</label>
        <div className="mt-2">
          <Dropdown
            id={regionId}
            label="Data center location"
            value={state.region}
            onChange={(v) => update({ region: v })}
            options={[
              {
                value: "auto",
                icon: "✨",
                label: "Auto",
                display: `Auto · ${autoRegion.name}`,
                description: `${provider.name}'s usual fleet · ${autoRegion.icon} ${autoRegion.name}`,
              },
              ...REGIONS.map((r) => ({
                value: r.id,
                icon: r.icon,
                label: r.name,
                description: r.note,
                meta: <span className="font-mono">{r.ewif} L/kWh</span>,
              })),
            ]}
          />
        </div>
        {suggestion && state.region === "auto" && suggestion.id !== autoRegion.id && (
          <button type="button" onClick={() => update({ region: suggestion.id })} className="mt-2 text-left text-sm text-aqua hover:underline">
            📍 You seem to be browsing from {countryName(country)} — see what it'd cost on the {suggestion.name} grid →
          </button>
        )}
      </div>

      <Segmented
        label="Hidden “thinking” tokens"
        value={state.thinking}
        onChange={(v) => update({ thinking: v as Thinking })}
        options={(Object.keys(THINKING) as Thinking[]).map((k) => ({ value: k, label: THINKING[k].label, hint: THINKING[k].hint }))}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Segmented
          label="What counts?"
          value={state.scope}
          onChange={(v) => update({ scope: v as CalcState["scope"] })}
          options={[
            { value: "full", label: "Cooling + power plants", hint: "On-site cooling water plus water evaporated generating the electricity." },
            { value: "onsite", label: "Cooling only", hint: "Only water evaporated at the data center — what most companies report." },
          ]}
        />
        <Segmented
          label="Units"
          value={state.units}
          onChange={(v) => update({ units: v as CalcState["units"] })}
          options={[
            { value: "metric", label: "Liters" },
            { value: "imperial", label: "Gallons" },
          ]}
        />
      </div>
    </div>
  );
}

function Segmented({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; hint?: string }[];
}) {
  const active = options.find((o) => o.value === value);
  return (
    <div>
      <p className="text-sm text-foam/80">{label}</p>
      <div role="radiogroup" aria-label={label} className="mt-2 flex rounded-2xl border border-white/10 bg-abyss/60 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-xl px-2 py-2 text-xs font-semibold transition sm:text-sm ${
              o.value === value ? "bg-aqua text-abyss" : "text-foam/70 hover:text-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {active?.hint && <p className="mt-1.5 text-xs text-foam/50">{active.hint}</p>}
    </div>
  );
}

function countryName(country: string | null) {
  if (!country || country.length !== 2) return "your area";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(country.toUpperCase()) ?? country;
  } catch {
    return country;
  }
}
