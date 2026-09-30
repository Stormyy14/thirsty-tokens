/**
 * Where the tokens are served matters twice:
 *  1. the local climate changes how much water the cooling towers evaporate;
 *  2. the grid mix changes how much water is consumed generating the power
 *     (thermoelectric plants evaporate a lot, hydro reservoirs evaporate too,
 *     wind and solar almost nothing).
 */

export interface Region {
  id: string;
  name: string;
  icon: string;
  /** Consumptive water per kWh generated (L/kWh), a.k.a. EWIF. */
  ewif: number;
  /** Multiplier on the provider's fleet WUE for this climate. */
  climate: number;
  /** Grid carbon intensity in gCO₂e/kWh, for the bonus CO₂ number. */
  carbon: number;
  note: string;
}

export const REGIONS: Region[] = [
  { id: "global", name: "World average", icon: "🌍", ewif: 4.0, climate: 1, carbon: 470, note: "Blend of global generation mixes." },
  { id: "us", name: "United States", icon: "🗽", ewif: 3.14, climate: 1, carbon: 370, note: "US average EWIF used by Li et al. (2023)." },
  { id: "us-west", name: "US West (Arizona/California)", icon: "🌵", ewif: 5.2, climate: 1.5, carbon: 230, note: "Hot and dry: towers evaporate more, and the grid is water-heavy." },
  { id: "us-east", name: "US East (Virginia)", icon: "🏛️", ewif: 2.4, climate: 1, carbon: 360, note: "Data Center Alley — the densest cluster on Earth." },
  { id: "eu", name: "Europe", icon: "🏰", ewif: 3.2, climate: 0.8, carbon: 240, note: "Milder climate, more nuclear/wind." },
  { id: "nordics", name: "Nordics", icon: "🧊", ewif: 1.2, climate: 0.3, carbon: 40, note: "Free air cooling most of the year." },
  { id: "ireland", name: "Ireland", icon: "☘️", ewif: 1.8, climate: 0.4, carbon: 280, note: "Cool and damp — popular for hyperscalers." },
  { id: "cn", name: "China", icon: "🏯", ewif: 6.0, climate: 1.1, carbon: 560, note: "Coal-heavy grid: thermoelectric plants are thirsty." },
  { id: "in", name: "India", icon: "🪷", ewif: 3.5, climate: 1.5, carbon: 710, note: "Hot climate increases evaporative cooling." },
  { id: "best", name: "Best case: renewables + dry cooling", icon: "🌱", ewif: 0.2, climate: 0.1, carbon: 20, note: "Wind/solar power and closed-loop cooling. Rare today." },
];

export function getRegion(id: string): Region {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}

/** Maps a visitor's country (from Cloudflare's request.cf) to a nearby region. */
export function regionForCountry(country: string | null | undefined): string | null {
  if (!country) return null;
  const c = country.toUpperCase();
  if (c === "US" || c === "CA") return "us";
  if (["NO", "SE", "FI", "DK", "IS"].includes(c)) return "nordics";
  if (c === "IE") return "ireland";
  if (c === "CN" || c === "HK") return "cn";
  if (c === "IN") return "in";
  const eu = ["PT", "ES", "FR", "DE", "IT", "NL", "BE", "LU", "AT", "PL", "CZ", "SK", "HU", "RO", "BG", "GR", "HR", "SI", "EE", "LV", "LT", "MT", "CY", "GB", "CH"];
  if (eu.includes(c)) return "eu";
  return null;
}
