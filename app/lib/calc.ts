import { getModel, getProvider, modelEnergy, type Model } from "./models";
import { getRegion } from "./regions";

/**
 * The whole model, in one place:
 *
 *   effective tokens = output × thinking + uncached input × 0.2 + cached input × 0.02
 *   IT energy (kWh)  = effective tokens / 1000 × Wh-per-1k-output / 1000
 *   on-site water    = IT energy × WUE × climate           (cooling towers)
 *   off-site water   = IT energy × PUE × EWIF              (power plants)
 *
 * Input tokens are much cheaper than output tokens because prefill is batched
 * and compute-bound; we use API price ratios (~5× and ~50×) as the proxy.
 */

export const INPUT_WEIGHT = 0.2;
export const CACHED_WEIGHT = 0.02;
/** Spread applied to energy to express how unsure we are about closed models. */
export const LOW_FACTOR = 0.4;
export const HIGH_FACTOR = 2.5;

export type Thinking = "off" | "light" | "heavy";
export type Scope = "full" | "onsite";

export const THINKING: Record<Thinking, { label: string; multiplier: number; hint: string }> = {
  off: { label: "Already counted", multiplier: 1, hint: "My token count already includes any reasoning tokens." },
  light: { label: "+ light thinking", multiplier: 2, hint: "Add hidden reasoning ≈ the visible reply again." },
  heavy: { label: "+ deep thinking", multiplier: 5, hint: "Long chains of thought: 4× the visible reply on top." },
};

export interface EstimateInput {
  model: string;
  tokens: number;
  /** Share of tokens that are output, 0–1. */
  outShare: number;
  /** Share of *input* tokens served from prompt cache, 0–1. */
  cacheShare: number;
  thinking: Thinking;
  region: string;
  scope: Scope;
}

export interface Estimate {
  model: Model;
  providerName: string;
  regionId: string;
  outputTokens: number;
  inputTokens: number;
  cachedTokens: number;
  effectiveTokens: number;
  /** Facility energy (IT × PUE), Wh */
  energyWh: number;
  onsiteMl: number;
  offsiteMl: number;
  totalMl: number;
  lowMl: number;
  highMl: number;
  co2g: number;
  pue: number;
  wue: number;
  ewif: number;
}

export function estimate(input: EstimateInput): Estimate {
  const model = getModel(input.model);
  const provider = getProvider(model.provider);
  const regionId = input.region === "auto" ? provider.defaultRegion : input.region;
  const region = getRegion(regionId);

  const tokens = Math.max(0, input.tokens);
  const outputTokens = tokens * clamp01(input.outShare);
  const inputTotal = tokens - outputTokens;
  const cachedTokens = inputTotal * clamp01(input.cacheShare);
  const inputTokens = inputTotal - cachedTokens;
  const thinkingMult = THINKING[input.thinking]?.multiplier ?? 1;

  const effectiveTokens =
    outputTokens * thinkingMult + inputTokens * INPUT_WEIGHT + cachedTokens * CACHED_WEIGHT;

  const itKwh = (effectiveTokens / 1000) * modelEnergy(model) / 1000;
  const wue = provider.wue * region.climate;
  const facilityKwh = itKwh * provider.pue;

  const onsiteL = itKwh * wue;
  const offsiteL = input.scope === "onsite" ? 0 : facilityKwh * region.ewif;
  const totalL = onsiteL + offsiteL;

  return {
    model,
    providerName: provider.name,
    regionId,
    outputTokens,
    inputTokens,
    cachedTokens,
    effectiveTokens,
    energyWh: facilityKwh * 1000,
    onsiteMl: onsiteL * 1000,
    offsiteMl: offsiteL * 1000,
    totalMl: totalL * 1000,
    lowMl: totalL * 1000 * LOW_FACTOR,
    highMl: totalL * 1000 * HIGH_FACTOR,
    co2g: facilityKwh * region.carbon,
    pue: provider.pue,
    wue,
    ewif: region.ewif,
  };
}

/** Millilitres per one million tokens of a "chat-like" mix, for rankings. */
export function mlPerMillion(modelId: string, region = "auto", scope: Scope = "full") {
  return estimate({
    model: modelId,
    tokens: 1_000_000,
    outShare: 0.3,
    cacheShare: 0,
    thinking: "off",
    region,
    scope,
  }).totalMl;
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
