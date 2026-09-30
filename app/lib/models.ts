/**
 * Model + provider catalogue.
 *
 * No lab publishes per-token energy for its closed models, so every model is
 * placed in a compute tier. Tiers are calibrated against the few public
 * disclosures (Google's Gemini paper, OpenAI's ChatGPT figure, Mistral's LCA)
 * and independent benchmarks (Jegham et al. 2025, Epoch AI, ML.ENERGY).
 * Edit this file to add models — everything else is derived.
 */

export type TierId = "nano" | "small" | "mid" | "large" | "frontier" | "ultra";

export interface Tier {
  id: TierId;
  label: string;
  /** Server (IT) energy per 1,000 output tokens in Wh, before PUE. */
  whPer1kOut: number;
  blurb: string;
}

export const TIERS: Record<TierId, Tier> = {
  nano: {
    id: "nano",
    label: "Nano",
    whPer1kOut: 0.02,
    blurb: "≈1–10B active params. Runs on a laptop.",
  },
  small: {
    id: "small",
    label: "Small",
    whPer1kOut: 0.08,
    blurb: "Fast/cheap tier: Haiku, Flash-Lite, mini-class models.",
  },
  mid: {
    id: "mid",
    label: "Mid",
    whPer1kOut: 0.25,
    blurb: "Workhorse MoE models, Flash-class. Calibrated on Gemini's 0.24 Wh median prompt.",
  },
  large: {
    id: "large",
    label: "Large",
    whPer1kOut: 0.6,
    blurb: "GPT-4o / Sonnet class. Calibrated on OpenAI's 0.34 Wh per ChatGPT query.",
  },
  frontier: {
    id: "frontier",
    label: "Frontier",
    whPer1kOut: 1.5,
    blurb: "Top-of-line flagship models. Benchmarks put these 2–4× above large.",
  },
  ultra: {
    id: "ultra",
    label: "Ultra",
    whPer1kOut: 3.5,
    blurb: "Premium 'max compute' models priced far above the frontier tier.",
  },
};

export type Calibration = "disclosed" | "benchmarked" | "estimated";

export interface Provider {
  id: string;
  name: string;
  /** Brand-ish color for the provider chip. Never used on text. */
  color: string;
  /** Short monogram shown in the chip (we don't ship third-party logos). */
  mono: string;
  /** Data-center power usage effectiveness (facility energy / IT energy). */
  pue: number;
  /** On-site water usage effectiveness in L per kWh of IT energy. */
  wue: number;
  /** Where the fleet mostly sits; used when region is "auto". */
  defaultRegion: string;
  infraNote: string;
}

export const PROVIDERS: Provider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    color: "#D97757",
    mono: "A\\",
    pue: 1.12,
    wue: 0.55,
    defaultRegion: "us",
    infraNote: "Runs on AWS (WUE 0.15 L/kWh) and Google Cloud (~1.0 L/kWh); we blend the two.",
  },
  {
    id: "openai",
    name: "OpenAI",
    color: "#10A37F",
    mono: "◎",
    pue: 1.18,
    wue: 0.9,
    defaultRegion: "us",
    infraNote:
      "Azure, Oracle and Stargate sites. WUE chosen so a 0.34 Wh query lands near OpenAI's own ~0.32 mL figure.",
  },
  {
    id: "google",
    name: "Google",
    color: "#4285F4",
    mono: "G",
    pue: 1.09,
    wue: 1.0,
    defaultRegion: "us",
    infraNote: "Fleet PUE 1.09. Gemini paper: 0.24 Wh ↔ 0.26 mL on-site ⇒ ≈1.0 L/kWh.",
  },
  {
    id: "xai",
    name: "xAI",
    color: "#9CA3AF",
    mono: "𝕏",
    pue: 1.3,
    wue: 1.2,
    defaultRegion: "us",
    infraNote: "Colossus (Memphis). No disclosures; we use industry-typical values.",
  },
  {
    id: "meta",
    name: "Meta",
    color: "#0866FF",
    mono: "∞",
    pue: 1.08,
    wue: 0.2,
    defaultRegion: "us",
    infraNote: "Meta reports fleet PUE ≈1.08 and WUE ≈0.20 L/kWh.",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    color: "#4D6BFE",
    mono: "DS",
    pue: 1.4,
    wue: 1.2,
    defaultRegion: "cn",
    infraNote: "Chinese colocation; national average PUE is ~1.4–1.5.",
  },
  {
    id: "mistral",
    name: "Mistral",
    color: "#FA520F",
    mono: "M",
    pue: 1.2,
    wue: 0.5,
    defaultRegion: "eu",
    infraNote: "European data centers. Mistral published a full LCA of Mistral Large 2.",
  },
  {
    id: "alibaba",
    name: "Alibaba Qwen",
    color: "#615CED",
    mono: "Q",
    pue: 1.25,
    wue: 1.0,
    defaultRegion: "cn",
    infraNote: "Alibaba Cloud reports PUE ≈1.2–1.3 at newer sites.",
  },
  {
    id: "others",
    name: "Others",
    color: "#14B8A6",
    mono: "✦",
    pue: 1.3,
    wue: 1.0,
    defaultRegion: "global",
    infraNote: "Typical cloud/colocation values (Uptime Institute survey averages).",
  },
  {
    id: "local",
    name: "Your laptop",
    color: "#EAB308",
    mono: "💻",
    pue: 1.0,
    wue: 0,
    defaultRegion: "global",
    infraNote: "No cooling towers at home! Only the water used to generate your electricity counts.",
  },
];

export interface Model {
  id: string;
  name: string;
  provider: string;
  tier: TierId;
  released: string;
  reasoning?: boolean;
  openWeights?: boolean;
  calibration: Calibration;
  /** Overrides the tier value when we have something better. */
  whPer1kOut?: number;
  note?: string;
}

export const MODELS: Model[] = [
  // Anthropic
  { id: "claude-fable-5-1", name: "Claude Fable 5.1", provider: "anthropic", tier: "ultra", released: "2026-09", reasoning: true, calibration: "estimated", note: "Anthropic's most capable model; priced ~3× Opus." },
  { id: "claude-opus-5-5", name: "Claude Opus 5.5", provider: "anthropic", tier: "frontier", released: "2026-09", reasoning: true, calibration: "estimated" },
  { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", provider: "anthropic", tier: "large", released: "2026-09", reasoning: true, calibration: "estimated" },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "anthropic", tier: "small", released: "2025-10", calibration: "estimated" },
  { id: "claude-opus-4-1", name: "Claude Opus 4.1", provider: "anthropic", tier: "ultra", released: "2025-08", reasoning: true, calibration: "estimated", note: "Legacy; priced at $15/$75 per M tokens." },
  { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", provider: "anthropic", tier: "large", released: "2025-09", reasoning: true, calibration: "estimated" },

  // OpenAI
  { id: "gpt-6-astra", name: "GPT-6 Astra", provider: "openai", tier: "ultra", released: "2026-09", reasoning: true, calibration: "estimated" },
  { id: "gpt-6-sol", name: "GPT-6 Sol", provider: "openai", tier: "large", released: "2026-09", reasoning: true, calibration: "estimated" },
  { id: "gpt-6-luna", name: "GPT-6 Luna", provider: "openai", tier: "small", released: "2026-09", calibration: "estimated" },
  { id: "gpt-5-6", name: "GPT-5.6", provider: "openai", tier: "frontier", released: "2026-05", reasoning: true, calibration: "estimated" },
  { id: "gpt-5-mini", name: "GPT-5 mini", provider: "openai", tier: "small", released: "2025-08", reasoning: true, calibration: "estimated" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai", tier: "large", released: "2024-05", calibration: "disclosed", note: "ChatGPT's long-time default; OpenAI disclosed ~0.34 Wh per average query." },
  { id: "o3", name: "o3", provider: "openai", tier: "frontier", released: "2025-04", reasoning: true, calibration: "benchmarked", note: "Jegham et al. measured o3 among the most energy-hungry models per prompt." },
  { id: "gpt-oss-120b", name: "gpt-oss-120b", provider: "openai", tier: "small", released: "2025-08", openWeights: true, reasoning: true, calibration: "benchmarked", note: "117B MoE, only 5.1B active per token." },
  { id: "gpt-oss-20b", name: "gpt-oss-20b", provider: "openai", tier: "nano", released: "2025-08", openWeights: true, calibration: "benchmarked" },

  // Google
  { id: "gemini-3-8-flash", name: "Gemini 3.8 Flash", provider: "google", tier: "mid", released: "2026-09", reasoning: true, calibration: "disclosed", note: "Flash-class models power the Gemini app, whose median prompt uses 0.24 Wh." },
  { id: "gemini-3-1-pro", name: "Gemini 3.1 Pro", provider: "google", tier: "frontier", released: "2026-02", reasoning: true, calibration: "estimated" },
  { id: "gemini-3-5-flash-lite", name: "Gemini 3.5 Flash-Lite", provider: "google", tier: "small", released: "2026-04", calibration: "estimated" },
  { id: "gemini-2-5-pro", name: "Gemini 2.5 Pro", provider: "google", tier: "large", released: "2025-03", reasoning: true, calibration: "estimated" },
  { id: "gemma-3-27b", name: "Gemma 3 27B", provider: "google", tier: "small", released: "2025-03", openWeights: true, calibration: "benchmarked" },

  // xAI
  { id: "grok-4-7", name: "Grok 4.7", provider: "xai", tier: "frontier", released: "2026-09", reasoning: true, calibration: "estimated" },
  { id: "grok-4-fast", name: "Grok 4 Fast", provider: "xai", tier: "mid", released: "2025-09", calibration: "estimated" },

  // Meta
  { id: "muse-spark-1-3", name: "Muse Spark 1.3", provider: "meta", tier: "mid", released: "2026-09", calibration: "estimated" },
  { id: "llama-4-maverick", name: "Llama 4 Maverick", provider: "meta", tier: "mid", released: "2025-04", openWeights: true, calibration: "benchmarked", note: "400B MoE, 17B active." },
  { id: "llama-3-1-405b", name: "Llama 3.1 405B", provider: "meta", tier: "frontier", released: "2024-07", openWeights: true, calibration: "benchmarked", note: "Dense: every one of 405B params fires for every token." },
  { id: "llama-3-1-8b", name: "Llama 3.1 8B", provider: "meta", tier: "nano", released: "2024-07", openWeights: true, calibration: "benchmarked" },

  // DeepSeek
  { id: "deepseek-v4-1-flash", name: "DeepSeek V4.1 Flash", provider: "deepseek", tier: "mid", released: "2026-09", openWeights: true, calibration: "estimated" },
  { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", provider: "deepseek", tier: "large", released: "2026-04", openWeights: true, reasoning: true, calibration: "estimated" },
  { id: "deepseek-r1", name: "DeepSeek-R1", provider: "deepseek", tier: "large", released: "2025-01", openWeights: true, reasoning: true, calibration: "benchmarked", note: "Famous for very long chains of thought — check the thinking toggle." },

  // Mistral
  { id: "mistral-medium-3-5", name: "Mistral Medium 3.5", provider: "mistral", tier: "large", released: "2026-04", calibration: "estimated" },
  { id: "mistral-large-2", name: "Mistral Large 2", provider: "mistral", tier: "large", released: "2024-07", openWeights: true, calibration: "disclosed", note: "Mistral's LCA: 45 mL per 400-token reply, including hardware manufacturing." },
  { id: "mistral-small-3", name: "Mistral Small 3", provider: "mistral", tier: "small", released: "2025-01", openWeights: true, calibration: "benchmarked" },

  // Alibaba
  { id: "qwen-3-8-max", name: "Qwen3.8 Max", provider: "alibaba", tier: "frontier", released: "2026-08", reasoning: true, calibration: "estimated" },
  { id: "qwen-3-8-flash", name: "Qwen3.8 Flash", provider: "alibaba", tier: "small", released: "2026-08", calibration: "estimated" },

  // Others
  { id: "kimi-k2", name: "Kimi K2", provider: "others", tier: "mid", released: "2025-07", openWeights: true, calibration: "estimated", note: "Moonshot AI. 1T MoE, 32B active." },
  { id: "glm-5-3", name: "GLM 5.3", provider: "others", tier: "mid", released: "2026-09", calibration: "estimated", note: "Z.ai." },
  { id: "command-a-plus", name: "Command A+", provider: "others", tier: "mid", released: "2026-09", calibration: "estimated", note: "Cohere." },

  // Local
  { id: "local-8b", name: "8B model on your laptop", provider: "local", tier: "nano", released: "—", openWeights: true, calibration: "benchmarked", whPer1kOut: 0.3, note: "A consumer GPU/laptop is ~10× less efficient per token than a batched datacenter GPU — but there's no cooling tower." },
];

export const DEFAULT_MODEL_ID = "claude-sonnet-5-5";

export function getModel(id: string | null | undefined): Model {
  return MODELS.find((m) => m.id === id) ?? MODELS.find((m) => m.id === DEFAULT_MODEL_ID)!;
}

export function getProvider(id: string): Provider {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[PROVIDERS.length - 2];
}

export function modelsByProvider(providerId: string): Model[] {
  return MODELS.filter((m) => m.provider === providerId);
}

export function modelEnergy(model: Model): number {
  return model.whPer1kOut ?? TIERS[model.tier].whPer1kOut;
}
