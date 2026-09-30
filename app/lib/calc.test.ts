import { describe, expect, it } from "vitest";
import { estimate, mlPerMillion } from "./calc";
import { pickHighlights } from "./comparisons";
import { parseTokens, volume } from "./format";
import { MODELS, PROVIDERS } from "./models";
import { REGIONS } from "./regions";
import { DEFAULT_STATE, parseState, serializeState } from "./state";

const base = { ...DEFAULT_STATE };

describe("estimate", () => {
  it("lands near OpenAI's disclosed ~0.34 Wh / ~0.32 mL per ChatGPT query", () => {
    const e = estimate({ ...base, model: "gpt-4o", tokens: 1000, scope: "onsite" });
    expect(e.energyWh).toBeGreaterThan(0.1);
    expect(e.energyWh).toBeLessThan(1);
    expect(e.onsiteMl).toBeGreaterThan(0.1);
    expect(e.onsiteMl).toBeLessThan(1);
  });

  it("lands near Google's 0.24 Wh / 0.26 mL median Gemini prompt", () => {
    const e = estimate({ ...base, model: "gemini-3-8-flash", tokens: 1500, outShare: 0.5, scope: "onsite" });
    expect(e.energyWh).toBeGreaterThan(0.08);
    expect(e.energyWh).toBeLessThan(0.6);
    expect(e.onsiteMl).toBeGreaterThan(0.08);
    expect(e.onsiteMl).toBeLessThan(0.6);
  });

  it("full scope ≥ on-site scope, and scales linearly", () => {
    const a = estimate({ ...base, tokens: 1000 });
    const b = estimate({ ...base, tokens: 2000 });
    const on = estimate({ ...base, tokens: 1000, scope: "onsite" });
    expect(a.totalMl).toBeGreaterThan(on.totalMl);
    expect(b.totalMl).toBeCloseTo(a.totalMl * 2, 6);
    expect(a.lowMl).toBeLessThan(a.totalMl);
    expect(a.highMl).toBeGreaterThan(a.totalMl);
  });

  it("thinking and caching move the number the right way", () => {
    const plain = estimate({ ...base, tokens: 1e6 });
    const think = estimate({ ...base, tokens: 1e6, thinking: "heavy" });
    const cached = estimate({ ...base, tokens: 1e6, cacheShare: 0.9 });
    expect(think.totalMl).toBeGreaterThan(plain.totalMl);
    expect(cached.totalMl).toBeLessThan(plain.totalMl);
  });

  it("laptop has no on-site water", () => {
    expect(estimate({ ...base, model: "local-8b" }).onsiteMl).toBe(0);
  });

  it("every model resolves to a real provider and a positive figure", () => {
    const providerIds = new Set(PROVIDERS.map((p) => p.id));
    const regionIds = new Set(REGIONS.map((r) => r.id));
    for (const m of MODELS) {
      expect(providerIds.has(m.provider)).toBe(true);
      expect(mlPerMillion(m.id)).toBeGreaterThan(0);
    }
    for (const p of PROVIDERS) expect(regionIds.has(p.defaultRegion)).toBe(true);
    expect(new Set(MODELS.map((m) => m.id)).size).toBe(MODELS.length);
  });
});

describe("format", () => {
  it("parses human token counts", () => {
    expect(parseTokens("1.5M")).toBe(1_500_000);
    expect(parseTokens("200k")).toBe(200_000);
    expect(parseTokens("3 billion")).toBe(3e9);
    expect(parseTokens("12,000 tokens")).toBe(12_000);
    expect(parseTokens("banana")).toBeNaN();
  });

  it("formats volumes across scales", () => {
    expect(volume(0.26, "metric")).toBe("0.26 mL");
    expect(volume(1500, "metric")).toBe("1.5 L");
    expect(volume(3.2e12, "metric")).toBe("3.2 billion liters");
    expect(volume(3785.41, "imperial")).toBe("1 gallon");
  });
});

describe("comparisons", () => {
  it("always returns something, even for tiny volumes", () => {
    expect(pickHighlights(1e-6).length).toBeGreaterThan(0);
    expect(pickHighlights(150_000).map((c) => c.id)).toContain("bathtub");
  });
});

describe("state", () => {
  it("round-trips through the URL", () => {
    const s = { ...DEFAULT_STATE, model: "o3", tokens: 42_000, mix: "custom" as const, outShare: 0.12, cacheShare: 0.5, thinking: "heavy" as const, region: "nordics", scope: "onsite" as const, units: "imperial" as const };
    expect(parseState(serializeState(s))).toEqual(s);
  });

  it("ignores garbage", () => {
    const s = parseState(new URLSearchParams("m=nope&t=-5&r=mars&th=lots"));
    expect(s.model).toBe(DEFAULT_STATE.model);
    expect(s.tokens).toBe(DEFAULT_STATE.tokens);
    expect(s.region).toBe("auto");
    expect(s.thinking).toBe("off");
  });
});
