/**
 * Things to measure water against. Volumes in millilitres.
 * "footprint" items are virtual water (Water Footprint Network, global
 * averages) — the water it takes to *produce* the thing, not what's inside it.
 */

export type ComparisonCategory = "drinks" | "home" | "big" | "animals" | "footprint";

export interface Comparison {
  id: string;
  emoji: string;
  /** Leading verb phrase, e.g. "Fill". */
  verb: string;
  one: string;
  many: string;
  ml: number;
  category: ComparisonCategory;
  /** Human-readable size shown under the card. */
  size: string;
  source?: string;
}

export const CATEGORY_LABELS: Record<ComparisonCategory, string> = {
  drinks: "Drinks",
  home: "Around the house",
  big: "Absurdly big",
  animals: "Thirsty creatures",
  footprint: "Hidden water footprints",
};

export const COMPARISONS: Comparison[] = [
  // drinks
  { id: "drop", emoji: "💧", verb: "Drip", one: "drop of water", many: "drops of water", ml: 0.05, category: "drinks", size: "≈0.05 mL each" },
  { id: "teaspoon", emoji: "🥄", verb: "Fill", one: "teaspoon", many: "teaspoons", ml: 5, category: "drinks", size: "5 mL" },
  { id: "espresso", emoji: "☕", verb: "Pull", one: "espresso shot", many: "espresso shots", ml: 30, category: "drinks", size: "30 mL" },
  { id: "shot", emoji: "🥃", verb: "Pour", one: "shot glass", many: "shot glasses", ml: 44, category: "drinks", size: "44 mL" },
  { id: "glass", emoji: "🥛", verb: "Drink", one: "glass of water", many: "glasses of water", ml: 250, category: "drinks", size: "250 mL" },
  { id: "can", emoji: "🥫", verb: "Fill", one: "soda can", many: "soda cans", ml: 330, category: "drinks", size: "330 mL" },
  { id: "bottle", emoji: "🥤", verb: "Fill", one: "water bottle", many: "water bottles", ml: 500, category: "drinks", size: "500 mL" },
  { id: "wine", emoji: "🍾", verb: "Fill", one: "wine bottle", many: "wine bottles", ml: 750, category: "drinks", size: "750 mL" },
  { id: "hydrate", emoji: "🧍", verb: "Keep a human hydrated for", one: "day", many: "days", ml: 2_000, category: "drinks", size: "≈2 L per day" },

  // home
  { id: "flush", emoji: "🚽", verb: "Flush the toilet", one: "time", many: "times", ml: 6_000, category: "home", size: "6 L per flush" },
  { id: "shower", emoji: "🚿", verb: "Shower for", one: "minute", many: "minutes", ml: 9_000, category: "home", size: "≈9 L per minute" },
  { id: "dishwasher", emoji: "🍽️", verb: "Run the dishwasher", one: "time", many: "times", ml: 12_000, category: "home", size: "≈12 L per cycle" },
  { id: "laundry", emoji: "🧺", verb: "Wash", one: "load of laundry", many: "loads of laundry", ml: 50_000, category: "home", size: "≈50 L per load" },
  { id: "bathtub", emoji: "🛁", verb: "Fill", one: "bathtub", many: "bathtubs", ml: 150_000, category: "home", size: "≈150 L" },
  { id: "kiddie", emoji: "🐤", verb: "Fill", one: "kiddie pool", many: "kiddie pools", ml: 350_000, category: "home", size: "≈350 L" },
  { id: "hose", emoji: "🌱", verb: "Water the garden for", one: "hour", many: "hours", ml: 900_000, category: "home", size: "≈15 L per minute" },
  { id: "hottub", emoji: "♨️", verb: "Fill", one: "hot tub", many: "hot tubs", ml: 1_500_000, category: "home", size: "≈1,500 L" },

  // big
  { id: "firetruck", emoji: "🚒", verb: "Fill", one: "fire truck", many: "fire trucks", ml: 2_800_000, category: "big", size: "≈2,800 L tank" },
  { id: "tanker", emoji: "🚛", verb: "Fill", one: "tanker truck", many: "tanker trucks", ml: 34_000_000, category: "big", size: "≈34,000 L" },
  { id: "pool", emoji: "🏊", verb: "Fill", one: "backyard pool", many: "backyard pools", ml: 60_000_000, category: "big", size: "≈60,000 L" },
  { id: "olympic", emoji: "🏟️", verb: "Fill", one: "Olympic pool", many: "Olympic pools", ml: 2_500_000_000, category: "big", size: "2.5 million L" },
  { id: "niagara", emoji: "🌊", verb: "Run Niagara Falls for", one: "second", many: "seconds", ml: 2_800_000_000, category: "big", size: "≈2.8 million L/s" },
  { id: "lochness", emoji: "🦕", verb: "Fill", one: "Loch Ness", many: "Loch Nesses", ml: 7.4e15, category: "big", size: "7.4 km³" },

  // animals
  { id: "goldfish", emoji: "🐠", verb: "Fill", one: "goldfish bowl", many: "goldfish bowls", ml: 4_000, category: "animals", size: "≈4 L" },
  { id: "human", emoji: "🫀", verb: "Match the water inside", one: "human body", many: "human bodies", ml: 42_000, category: "animals", size: "≈42 L in an adult" },
  { id: "camel", emoji: "🐫", verb: "Refill", one: "thirsty camel", many: "thirsty camels", ml: 100_000, category: "animals", size: "≈100 L in one go" },
  { id: "elephant", emoji: "🐘", verb: "Quench an elephant for", one: "day", many: "days", ml: 200_000, category: "animals", size: "≈200 L per day" },
  { id: "whale", emoji: "🐋", verb: "Match", one: "blue whale gulp", many: "blue whale gulps", ml: 100_000_000, category: "animals", size: "≈100,000 L per gulp" },

  // footprints
  { id: "paper", emoji: "📄", verb: "Make", one: "sheet of paper", many: "sheets of paper", ml: 10_000, category: "footprint", size: "≈10 L per A4 sheet", source: "Water Footprint Network" },
  { id: "bread", emoji: "🍞", verb: "Bake", one: "slice of bread", many: "slices of bread", ml: 40_000, category: "footprint", size: "≈40 L per slice", source: "Water Footprint Network" },
  { id: "beer", emoji: "🍺", verb: "Brew", one: "glass of beer", many: "glasses of beer", ml: 74_000, category: "footprint", size: "≈74 L per 250 mL", source: "Water Footprint Network" },
  { id: "apple", emoji: "🍎", verb: "Grow", one: "apple", many: "apples", ml: 125_000, category: "footprint", size: "≈125 L each", source: "Water Footprint Network" },
  { id: "coffee", emoji: "☕", verb: "Grow the beans for", one: "cup of coffee", many: "cups of coffee", ml: 130_000, category: "footprint", size: "≈130 L per cup", source: "Water Footprint Network" },
  { id: "egg", emoji: "🥚", verb: "Produce", one: "egg", many: "eggs", ml: 196_000, category: "footprint", size: "≈196 L each", source: "Water Footprint Network" },
  { id: "chocolate", emoji: "🍫", verb: "Make", one: "chocolate bar", many: "chocolate bars", ml: 1_700_000, category: "footprint", size: "≈1,700 L per 100 g", source: "Water Footprint Network" },
  { id: "burger", emoji: "🍔", verb: "Make", one: "burger", many: "burgers", ml: 2_400_000, category: "footprint", size: "≈2,400 L each", source: "Water Footprint Network" },
  { id: "tshirt", emoji: "👕", verb: "Make", one: "cotton T-shirt", many: "cotton T-shirts", ml: 2_700_000, category: "footprint", size: "≈2,700 L each", source: "WWF / WFN" },
  { id: "jeans", emoji: "👖", verb: "Make", one: "pair of jeans", many: "pairs of jeans", ml: 8_000_000, category: "footprint", size: "≈8,000 L each", source: "Water Footprint Network" },
  { id: "phone", emoji: "📱", verb: "Manufacture", one: "smartphone", many: "smartphones", ml: 12_000_000, category: "footprint", size: "≈12,000 L each", source: "Industry estimates" },
  { id: "beef", emoji: "🥩", verb: "Raise", one: "kg of beef", many: "kg of beef", ml: 15_400_000, category: "footprint", size: "≈15,400 L per kg", source: "Water Footprint Network" },
];

/** Crowd favourites get a nudge when they're in range. */
const FEATURED = new Set(["bathtub", "olympic", "glass", "shower", "burger"]);

/** Vessels for the "how full is it?" visual, smallest first. */
export const VESSELS = [
  "teaspoon", "shot", "glass", "bottle", "goldfish", "bathtub", "hottub",
  "firetruck", "tanker", "pool", "olympic", "lochness",
].map((id) => COMPARISONS.find((c) => c.id === id)!);

export function vesselFor(ml: number) {
  const v = VESSELS.find((x) => x.ml >= ml) ?? VESSELS[VESSELS.length - 1];
  return { vessel: v, fill: ml / v.ml };
}

export function countFor(ml: number, c: Comparison) {
  return ml / c.ml;
}

/**
 * Pick the comparisons that read best for a given volume: counts between
 * ~0.25 and ~2,000 feel tangible. We favour one per category so the grid
 * stays varied, then fill with the next best.
 */
export function pickHighlights(ml: number, n = 6): Comparison[] {
  const scored = COMPARISONS.map((c) => {
    const count = ml / c.ml;
    const lg = Math.log10(count);
    // Sweet spot ≈ 1–20 of a thing; fractions read worse than multiples.
    let score = lg < 0 ? Math.abs(lg) * 1.8 + 0.3 : Math.abs(lg - 0.6);
    if (FEATURED.has(c.id)) score -= 0.5;
    return { c, score, count };
  }).filter((s) => s.count >= 0.05);

  scored.sort((a, b) => a.score - b.score);
  const out: Comparison[] = [];
  const usedCats = new Set<string>();
  for (const s of scored) {
    if (out.length >= n) break;
    if (!usedCats.has(s.c.category) && s.score < 1.4) {
      out.push(s.c);
      usedCats.add(s.c.category);
    }
  }
  for (const s of scored) {
    if (out.length >= n) break;
    if (!out.includes(s.c)) out.push(s.c);
  }
  // Nothing fits (astronomically tiny)? Fall back to drops.
  if (out.length === 0) out.push(COMPARISONS[0]);
  return out;
}

export interface ScaleScenario {
  id: string;
  emoji: string;
  title: string;
  multiplier: number;
  caption: string;
}

export const SCALE_SCENARIOS: ScaleScenario[] = [
  { id: "year", emoji: "📅", title: "Every day for a year", multiplier: 365, caption: "×365" },
  { id: "team", emoji: "🏢", title: "Your 200-person company, every workday", multiplier: 200 * 230, caption: "×46,000" },
  { id: "city", emoji: "🏙️", title: "Everyone in Lisbon, once", multiplier: 545_000, caption: "×545K" },
  { id: "chatgpt", emoji: "🤖", title: "One day of ChatGPT prompts", multiplier: 2_500_000_000, caption: "×2.5B — OpenAI's reported daily prompts" },
  { id: "earth", emoji: "🌍", title: "Every human on Earth, once", multiplier: 8_200_000_000, caption: "×8.2B" },
];
