import { useEffect, useId, useState } from "react";
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
    <div className="space-y-7">
      <TokenField state={state} update={update} />
      <ModelPicker state={state} update={update} />
      <MixPicker state={state} update={update} />
      <Advanced state={state} update={update} suggestedRegion={suggestedRegion} country={country} />
    </div>
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
      <label htmlFor={id} className="label">
        1 · How many tokens?
      </label>
      <div className="mt-3 flex items-stretch gap-3">
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

      <div className="-mx-1 mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = state.tokens === p.tokens && state.mix === p.mix;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => update({ tokens: p.tokens, mix: p.mix, outShare: MIXES[p.mix].outShare, cacheShare: MIXES[p.mix].cacheShare })}
              className="chip"
            >
              <span aria-hidden>{p.emoji}</span>
              {p.label}
              <span className="text-foam/50">{compactTokens(p.tokens)}</span>
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
      <p className="label">2 · Which AI?</p>
      <div role="tablist" aria-label="Provider" className="mt-3 flex flex-wrap gap-2">
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
            className="chip"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} aria-hidden />
            {p.name}
          </button>
        ))}
      </div>

      <div role="radiogroup" aria-label="Model" className="mt-3 grid gap-2 sm:grid-cols-2">
        {models.map((m) => {
          const selected = m.id === state.model;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => update({ model: m.id })}
              className={`group rounded-2xl border p-3 text-left transition ${
                selected ? "border-aqua bg-aqua/10 shadow-lg shadow-aqua/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"
              }`}
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
      <p className="label">3 · What kind of work?</p>
      <p className="mt-1 text-sm text-foam/60">Writing tokens (output) costs ~5× more energy than reading them (input).</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(MIXES) as (keyof typeof MIXES)[]).map((k) => (
          <button key={k} type="button" className="chip" aria-pressed={state.mix === k} onClick={() => setMix(k)}>
            <span aria-hidden>{MIXES[k].emoji}</span> {MIXES[k].label}
            <span className="text-foam/50">{MIXES[k].hint}</span>
          </button>
        ))}
        <button type="button" className="chip" aria-pressed={state.mix === "custom"} onClick={() => setMix("custom")}>
          🎛️ Custom
        </button>
      </div>
      {state.mix === "custom" && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
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
      <p className="label">4 · Fine print</p>

      <div>
        <label htmlFor={regionId} className="text-sm text-foam/80">Data center location</label>
        <select
          id={regionId}
          value={state.region}
          onChange={(e) => update({ region: e.target.value })}
          className="field mt-2 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%23bae6fd%22><path d=%22M5 7l5 6 5-6z%22/></svg>')] bg-[length:18px] bg-[right_14px_center] bg-no-repeat py-2.5 text-sm"
        >
          <option value="auto">
            Auto — {provider.name}'s usual fleet ({autoRegion.icon} {autoRegion.name})
          </option>
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.icon} {r.name}
            </option>
          ))}
        </select>
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
