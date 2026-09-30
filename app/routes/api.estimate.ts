import type { Route } from "./+types/api.estimate";
import { estimate } from "~/lib/calc";
import { pickHighlights } from "~/lib/comparisons";
import { parseTokens } from "~/lib/format";
import { MODELS } from "~/lib/models";
import { parseState } from "~/lib/state";

/**
 * GET /api/estimate?model=claude-sonnet-5-5&tokens=1M&mix=code&region=eu&scope=full
 * Accepts the same short params as the calculator URL (m, t, r, s, th, mix, o, c) too.
 */
export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = new URLSearchParams(url.searchParams);
  const alias: Record<string, string> = { model: "m", tokens: "t", region: "r", scope: "s", thinking: "th", output: "o", cache: "c" };
  for (const [long, short] of Object.entries(alias)) {
    const v = url.searchParams.get(long);
    if (v !== null) q.set(short, v);
  }
  const rawTokens = q.get("t");
  if (rawTokens) q.set("t", String(parseTokens(rawTokens)));

  const model = q.get("m");
  if (model && !MODELS.some((m) => m.id === model)) {
    return Response.json(
      { error: `Unknown model "${model}". See /api/models for valid ids.` },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }

  const state = parseState(q);
  const e = estimate(state);
  const round = (n: number) => Number(n.toPrecision(4));

  return Response.json(
    {
      input: {
        model: state.model,
        tokens: state.tokens,
        outputShare: state.outShare,
        cachedInputShare: state.cacheShare,
        thinking: state.thinking,
        region: e.regionId,
        scope: state.scope,
      },
      water: {
        totalMl: round(e.totalMl),
        lowMl: round(e.lowMl),
        highMl: round(e.highMl),
        onsiteCoolingMl: round(e.onsiteMl),
        offsitePowerMl: round(e.offsiteMl),
      },
      energyWh: round(e.energyWh),
      co2eGrams: round(e.co2g),
      factors: { pue: e.pue, wueLPerKwh: round(e.wue), ewifLPerKwh: e.ewif },
      equivalents: pickHighlights(e.totalMl, 3).map((c) => ({
        id: c.id,
        text: `${c.verb} ${Number((e.totalMl / c.ml).toPrecision(3))} ${e.totalMl / c.ml === 1 ? c.one : c.many}`,
      })),
      methodology: `${url.origin}/methodology`,
    },
    { headers: { "Cache-Control": "public, max-age=300", "Access-Control-Allow-Origin": "*" } },
  );
}
