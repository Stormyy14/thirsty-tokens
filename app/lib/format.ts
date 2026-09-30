export type Units = "metric" | "imperial";

const ML_PER_FLOZ = 29.5735;
const ML_PER_GAL = 3785.41;

function trim(n: number, digits: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

/** A number with sensible precision: 0.0042, 0.42, 4.2, 42, 4,200. */
export function nice(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  const a = Math.abs(n);
  if (a === 0) return "0";
  if (a < 0.001) return n.toExponential(1);
  if (a < 0.01) return trim(n, 4);
  if (a < 1) return trim(n, 3);
  if (a < 10) return trim(n, 2);
  if (a < 100) return trim(n, 1);
  return big(n);
}

/** Large numbers with words: 12,400 · 3.4 million · 1.2 billion. */
export function big(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e15) return trim(n / 1e15, 1) + " quadrillion";
  if (a >= 1e12) return trim(n / 1e12, 1) + " trillion";
  if (a >= 1e9) return trim(n / 1e9, 1) + " billion";
  if (a >= 1e6) return trim(n / 1e6, 1) + " million";
  return Math.round(n).toLocaleString("en-US");
}

/** Compact tokens: 500 · 12K · 1.5M · 2B. */
export function compactTokens(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e12) return trim(n / 1e12, 1) + "T";
  if (a >= 1e9) return trim(n / 1e9, 1) + "B";
  if (a >= 1e6) return trim(n / 1e6, 1) + "M";
  if (a >= 1e3) return trim(n / 1e3, 1) + "K";
  return trim(n, 0);
}

export interface VolumeParts {
  value: string;
  unit: string;
}

export function volumeParts(ml: number, units: Units): VolumeParts {
  if (units === "imperial") {
    const gal = ml / ML_PER_GAL;
    if (gal < 1) return { value: nice(ml / ML_PER_FLOZ), unit: "fl oz" };
    if (gal >= 1e6) return splitWords(gal, "gallons");
    return { value: nice(gal), unit: gal === 1 ? "gallon" : "gallons" };
  }
  if (ml < 1000) return { value: nice(ml), unit: "mL" };
  const l = ml / 1000;
  if (l >= 1e6) return splitWords(l, "liters");
  return { value: nice(l), unit: "L" };
}

function splitWords(n: number, unit: string): VolumeParts {
  const s = big(n);
  const [num, word] = s.split(" ");
  return word ? { value: num, unit: `${word} ${unit}` } : { value: s, unit };
}

export function volume(ml: number, units: Units): string {
  const p = volumeParts(ml, units);
  return `${p.value} ${p.unit}`;
}

export function energy(wh: number): string {
  if (wh < 1) return `${nice(wh * 1000)} mWh`;
  if (wh < 1000) return `${nice(wh)} Wh`;
  if (wh < 1e6) return `${nice(wh / 1000)} kWh`;
  if (wh < 1e9) return `${nice(wh / 1e6)} MWh`;
  return `${nice(wh / 1e9)} GWh`;
}

export function mass(g: number, units: Units): string {
  if (units === "imperial") {
    const oz = g / 28.3495;
    if (oz < 16) return `${nice(oz)} oz`;
    const lb = oz / 16;
    if (lb < 4000) return `${nice(lb)} lb`;
    return `${nice(lb / 2000)} tons`;
  }
  if (g < 1000) return `${nice(g)} g`;
  if (g < 1e6) return `${nice(g / 1000)} kg`;
  return `${nice(g / 1e6)} t`;
}

/** Count for "Fill 3.2 bathtubs" style phrases. */
export function count(n: number): string {
  if (n < 0.001) return "<0.001";
  if (n < 0.01) return Number(n.toPrecision(1)).toString();
  if (n < 10) return trim(n, n < 1 ? 2 : 1);
  return big(n);
}

/** Parses "1.5M", "200k", "3 billion", "12,000". Returns NaN when unparseable. */
export function parseTokens(raw: string): number {
  const s = raw.trim().toLowerCase().replace(/[,_\s]/g, "");
  const m = s.match(/^(\d*\.?\d+)(k|thousand|m|mil|million|b|bn|billion|t|trillion)?(tokens?)?$/);
  if (!m) return NaN;
  const n = parseFloat(m[1]);
  const mult: Record<string, number> = {
    k: 1e3, thousand: 1e3,
    m: 1e6, mil: 1e6, million: 1e6,
    b: 1e9, bn: 1e9, billion: 1e9,
    t: 1e12, trillion: 1e12,
  };
  return Math.round(n * (m[2] ? mult[m[2]] : 1));
}
