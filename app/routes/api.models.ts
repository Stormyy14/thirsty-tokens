import { mlPerMillion } from "~/lib/calc";
import { MODELS, PROVIDERS, TIERS, modelEnergy } from "~/lib/models";
import { REGIONS } from "~/lib/regions";

export function loader() {
  return Response.json(
    {
      models: MODELS.map((m) => ({
        ...m,
        whPer1kOutputTokens: modelEnergy(m),
        mlPerMillionTokens: Number(mlPerMillion(m.id).toFixed(2)),
      })),
      providers: PROVIDERS,
      regions: REGIONS,
      tiers: TIERS,
    },
    { headers: { "Cache-Control": "public, max-age=3600", "Access-Control-Allow-Origin": "*" } },
  );
}
