import type { EstimateInput, Scope, Thinking } from "./calc";
import type { Units } from "./format";
import { DEFAULT_MODEL_ID, MODELS } from "./models";
import { REGIONS } from "./regions";

export type MixId = "chat" | "write" | "read" | "code" | "custom";

export const MIXES: Record<Exclude<MixId, "custom">, { label: string; emoji: string; outShare: number; cacheShare: number; blurb: string; hint: string }> = {
  chat: { label: "Chatting", emoji: "💬", outShare: 0.3, cacheShare: 0, blurb: "Back-and-forth Q&A", hint: "30% written" },
  write: { label: "Writing", emoji: "✍️", outShare: 0.8, cacheShare: 0, blurb: "Long drafts & answers", hint: "80% written" },
  read: { label: "Summarizing", emoji: "📚", outShare: 0.03, cacheShare: 0, blurb: "Big docs in, short notes out", hint: "3% written" },
  code: { label: "Agentic coding", emoji: "🤖", outShare: 0.03, cacheShare: 0.9, blurb: "Huge context, 90% cached", hint: "3% written" },
};

export interface Preset {
  id: string;
  emoji: string;
  label: string;
  /** Second line under the label. */
  detail: string;
  tokens: number;
  mix: Exclude<MixId, "custom">;
}

export const PRESETS: Preset[] = [
  { id: "hi", emoji: "👋", label: "Say “thanks!”", detail: "One polite reply", tokens: 40, mix: "chat" },
  { id: "question", emoji: "❓", label: "Ask a question", detail: "A typical chat turn", tokens: 600, mix: "chat" },
  { id: "email", emoji: "📧", label: "Draft an email", detail: "A few paragraphs", tokens: 1_200, mix: "write" },
  { id: "essay", emoji: "📝", label: "Write an essay", detail: "≈2,000 words", tokens: 3_500, mix: "write" },
  { id: "pdf", emoji: "📄", label: "Sum up a PDF", detail: "≈40 pages", tokens: 25_000, mix: "read" },
  { id: "novel", emoji: "📖", label: "Write a novel", detail: "The whole book", tokens: 130_000, mix: "write" },
  { id: "codehour", emoji: "💻", label: "Agent coding", detail: "For one hour", tokens: 3_000_000, mix: "code" },
  { id: "codeday", emoji: "🔥", label: "Full coding day", detail: "8h with agents", tokens: 40_000_000, mix: "code" },
  { id: "startup", emoji: "🚀", label: "Run a startup", detail: "1 month of API", tokens: 2_000_000_000, mix: "chat" },
  { id: "wiki", emoji: "🌐", label: "Read Wikipedia", detail: "All of it", tokens: 6_000_000_000, mix: "read" },
];

export interface CalcState extends EstimateInput {
  mix: MixId;
  units: Units;
}

export const DEFAULT_STATE: CalcState = {
  model: DEFAULT_MODEL_ID,
  tokens: 1_000_000,
  mix: "chat",
  outShare: MIXES.chat.outShare,
  cacheShare: MIXES.chat.cacheShare,
  thinking: "off",
  region: "auto",
  scope: "full",
  units: "metric",
};

export const MAX_TOKENS = 1e13;

export function parseState(params: URLSearchParams, defaults: Partial<CalcState> = {}): CalcState {
  const base = { ...DEFAULT_STATE, ...defaults };
  const model = params.get("m");
  const t = Number(params.get("t"));
  const mix = params.get("mix") as MixId | null;
  const region = params.get("r");
  const thinking = params.get("th") as Thinking | null;
  const scope = params.get("s") as Scope | null;
  const units = params.get("u");

  const s: CalcState = {
    ...base,
    model: model && MODELS.some((x) => x.id === model) ? model : base.model,
    tokens: Number.isFinite(t) && t > 0 ? Math.min(MAX_TOKENS, Math.round(t)) : base.tokens,
    region: region && (region === "auto" || REGIONS.some((x) => x.id === region)) ? region : base.region,
    thinking: thinking && ["off", "light", "heavy"].includes(thinking) ? thinking : base.thinking,
    scope: scope === "onsite" ? "onsite" : scope === "full" ? "full" : base.scope,
    units: units === "imp" ? "imperial" : units === "met" ? "metric" : base.units,
  };

  if (mix && mix in MIXES) {
    const m = MIXES[mix as keyof typeof MIXES];
    s.mix = mix;
    s.outShare = m.outShare;
    s.cacheShare = m.cacheShare;
  } else if (mix === "custom") {
    s.mix = "custom";
    s.outShare = pct(params.get("o"), base.outShare);
    s.cacheShare = pct(params.get("c"), base.cacheShare);
  }
  return s;
}

export function serializeState(s: CalcState): URLSearchParams {
  const p = new URLSearchParams();
  p.set("m", s.model);
  p.set("t", String(s.tokens));
  if (s.mix !== DEFAULT_STATE.mix) p.set("mix", s.mix);
  if (s.mix === "custom") {
    p.set("o", String(Math.round(s.outShare * 100)));
    p.set("c", String(Math.round(s.cacheShare * 100)));
  }
  if (s.thinking !== "off") p.set("th", s.thinking);
  if (s.region !== "auto") p.set("r", s.region);
  if (s.scope !== "full") p.set("s", s.scope);
  if (s.units === "imperial") p.set("u", "imp");
  return p;
}

function pct(raw: string | null, fallback: number) {
  const n = Number(raw);
  if (raw === null || !Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n)) / 100;
}
