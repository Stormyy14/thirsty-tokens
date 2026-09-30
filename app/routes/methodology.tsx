import { Link } from "react-router";
import type { Route } from "./+types/methodology";
import { CACHED_WEIGHT, estimate, HIGH_FACTOR, INPUT_WEIGHT, LOW_FACTOR, THINKING } from "~/lib/calc";
import { energy, nice, volume } from "~/lib/format";
import { PROVIDERS, TIERS, type TierId } from "~/lib/models";
import { REGIONS } from "~/lib/regions";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Methodology & sources · Thirsty Tokens" },
    { name: "description", content: "How Thirsty Tokens turns tokens into liters: energy per token, PUE, WUE, grid water intensity, uncertainty and every source we use." },
  ];
}

const SOURCES = [
  { id: "li", cite: "Li, Yang, Islam & Ren (2023). Making AI Less “Thirsty”: Uncovering and Addressing the Secret Water Footprint of AI Models.", href: "https://arxiv.org/abs/2304.03271" },
  { id: "google", cite: "Elsworth et al. / Google (2025). Measuring the environmental impact of delivering AI at Google scale — 0.24 Wh, 0.26 mL per median Gemini Apps text prompt.", href: "https://arxiv.org/abs/2508.15734" },
  { id: "altman", cite: "Altman, S. (2025). The Gentle Singularity — ~0.34 Wh and ~0.000085 gal per average ChatGPT query.", href: "https://blog.samaltman.com/the-gentle-singularity" },
  { id: "mistral", cite: "Mistral AI (2025). Our contribution to a global environmental standard for AI — life-cycle analysis of Mistral Large 2.", href: "https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai" },
  { id: "jegham", cite: "Jegham et al. (2025). How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference.", href: "https://arxiv.org/abs/2505.09598" },
  { id: "epoch", cite: "You, J. / Epoch AI (2025). How much energy does ChatGPT use?", href: "https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use" },
  { id: "luccioni", cite: "Luccioni, Jernite & Strubell (2024). Power Hungry Processing: Watts Driving the Cost of AI Deployment?", href: "https://arxiv.org/abs/2311.16863" },
  { id: "mlenergy", cite: "ML.ENERGY Leaderboard — measured GPU energy per response for open models.", href: "https://ml.energy/leaderboard" },
  { id: "lbnl", cite: "Shehabi et al. / LBNL (2024). United States Data Center Energy Usage Report.", href: "https://eta-publications.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report" },
  { id: "uptime", cite: "Uptime Institute (2024). Global Data Center Survey — industry-average PUE ≈1.56.", href: "https://uptimeinstitute.com/resources/research-and-reports" },
  { id: "macknick", cite: "Macknick et al. (2012). Operational water consumption and withdrawal factors for electricity generating technologies. Environ. Res. Lett. 7 045802.", href: "https://iopscience.iop.org/article/10.1088/1748-9326/7/4/045802" },
  { id: "wfn", cite: "Mekonnen & Hoekstra / Water Footprint Network — product water footprints (burgers, coffee, jeans…).", href: "https://www.waterfootprint.org/resources/interactive-tools/product-gallery/" },
];

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-deep/60">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-white/5 text-[11px] tracking-wider text-foam/60 uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={`px-4 py-2.5 ${j === 0 ? "font-medium text-white" : "text-foam/80"} ${typeof c === "number" ? "tabular-nums" : ""}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Methodology() {
  const ex = estimate({ model: "gpt-4o", tokens: 1000, outShare: 0.3, cacheShare: 0, thinking: "off", region: "us", scope: "full" });
  const exOn = estimate({ model: "gpt-4o", tokens: 1000, outShare: 0.3, cacheShare: 0, thinking: "off", region: "us", scope: "onsite" });

  return (
    <article className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 sm:pt-16">
      <p className="label text-aqua">Methodology</p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl">How we turn tokens into liters</h1>
      <p className="mt-5 text-lg text-foam/80">
        Short version: tokens → electricity → water, at two places — the data center's cooling towers and the power
        plants that feed it. Long version below, with every constant we use.
      </p>

      <div className="card mt-10 p-6 font-mono text-sm leading-7 text-foam sm:text-base">
        <p><span className="text-aqua">effective_tokens</span> = output × thinking + input × {INPUT_WEIGHT} + cached_input × {CACHED_WEIGHT}</p>
        <p><span className="text-aqua">IT_energy</span> = effective_tokens / 1000 × Wh_per_1k(model)</p>
        <p><span className="text-aqua">cooling_water</span> = IT_energy × WUE(provider) × climate(region)</p>
        <p><span className="text-aqua">power_water</span> = IT_energy × PUE(provider) × EWIF(region)</p>
        <p className="mt-2 text-white"><span className="text-sun">total</span> = cooling_water + power_water   <span className="text-foam/50">(range ×{LOW_FACTOR} – ×{HIGH_FACTOR})</span></p>
      </div>

      <div className="prose-water">
        <h2>1 · Not all tokens are equal</h2>
        <p>
          Generating a token (output, “decode”) runs the whole model once per token and is memory-bound. Reading tokens
          (input, “prefill”) processes the prompt in big parallel batches and is far cheaper per token. Cached input
          skips most of that work. We use API price ratios — which track provider costs — as the proxy: input costs{" "}
          {INPUT_WEIGHT}× an output token and cached input {CACHED_WEIGHT}×.
        </p>
        <p>
          Reasoning models also produce hidden “thinking” tokens. If your number came from an API bill they're already
          included. If you only counted the visible reply, the thinking toggle multiplies output by{" "}
          {Object.values(THINKING).map((t) => `${t.multiplier}×`).join(", ")}.
        </p>

        <h2>2 · Energy per token, by compute tier</h2>
        <p>
          No major lab publishes per-token energy for its closed models. We place each model in a tier by its public
          size, price and speed, and calibrate the tiers on the few disclosures that exist: Google's{" "}
          <a href="https://arxiv.org/abs/2508.15734" target="_blank" rel="noreferrer">0.24 Wh median Gemini prompt</a>,
          OpenAI's <a href="https://blog.samaltman.com/the-gentle-singularity" target="_blank" rel="noreferrer">0.34 Wh average ChatGPT query</a>,
          and measured open-model benchmarks (<a href="https://ml.energy/leaderboard" target="_blank" rel="noreferrer">ML.ENERGY</a>,{" "}
          <a href="https://arxiv.org/abs/2505.09598" target="_blank" rel="noreferrer">Jegham et al.</a>).
        </p>
      </div>
      <Table
        head={["Tier", "Wh per 1K output tokens (server)", "What's in it"]}
        rows={(Object.keys(TIERS) as TierId[]).map((k) => [TIERS[k].label, TIERS[k].whPer1kOut, TIERS[k].blurb])}
      />

      <div className="prose-water">
        <h2>3 · The data center: PUE and WUE</h2>
        <p>
          <strong>PUE</strong> (power usage effectiveness) is total facility energy ÷ IT energy — the overhead of
          cooling, power conversion and lights. <strong>WUE</strong> (water usage effectiveness) is liters evaporated
          on-site per kWh of IT energy. Both come from each company's sustainability reporting where available. The
          region's climate then scales WUE: hot, dry places evaporate more.
        </p>
      </div>
      <Table
        head={["Provider", "PUE", "WUE (L/kWh)", "Basis"]}
        rows={PROVIDERS.map((p) => [p.name, p.pue, p.wue, p.infraNote])}
      />

      <div className="prose-water">
        <h2>4 · The grid: water behind every kWh</h2>
        <p>
          Thermoelectric plants (coal, gas, nuclear) evaporate water to condense steam; hydro reservoirs lose water to
          evaporation; wind and solar use almost none. The <strong>electricity water intensity factor</strong> (EWIF)
          captures that per kWh. Values follow Li et al. and Macknick et al.'s operational consumption factors, blended
          by generation mix.
        </p>
      </div>
      <Table
        head={["Region", "EWIF (L/kWh)", "Cooling climate ×", "Grid gCO₂e/kWh", "Note"]}
        rows={REGIONS.map((r) => [`${r.icon} ${r.name}`, r.ewif, r.climate, r.carbon, r.note])}
      />

      <div className="prose-water">
        <h2>5 · A worked example</h2>
        <p>
          A 1,000-token ChatGPT-style exchange on GPT-4o (300 out, 700 in) in a US data center: effective tokens ={" "}
          300 + 700 × {INPUT_WEIGHT} = {nice(ex.effectiveTokens)}. That's {energy(ex.energyWh)} at the facility.
          Cooling evaporates {volume(ex.onsiteMl, "metric")} and the power plants another {volume(ex.offsiteMl, "metric")}
          — {volume(ex.totalMl, "metric")} in total. The cooling-only number ({volume(exOn.totalMl, "metric")}) lines up
          with OpenAI's own ~0.32 mL per query; the full number explains why academic estimates run higher.
        </p>

        <h2>6 · How sure are we?</h2>
        <p>
          Not very — and neither is anyone else outside the labs. Each result shows a range from ×{LOW_FACTOR} to ×
          {HIGH_FACTOR} the central estimate, reflecting the spread between published figures for similar models.
          Utilization, batch size, hardware generation (H100 vs B200 vs TPU), speculative decoding and routing all move
          real numbers by 2–5×.
        </p>

        <h3>What's not included</h3>
        <ul>
          <li><strong>Training.</strong> Frontier training runs evaporate millions of liters, but amortized over trillions of served tokens they add little per token.</li>
          <li><strong>Manufacturing.</strong> Chip fabs are very thirsty; Mistral's LCA suggests embodied water can dominate per-query totals.</li>
          <li><strong>Your device & the network.</strong> Small next to the data center for typical use.</li>
          <li><strong>Withdrawal.</strong> We count water consumed (evaporated), not water borrowed and returned.</li>
          <li><strong>Local stress.</strong> A liter in Arizona matters more than a liter in Ireland. We don't weight for scarcity.</li>
        </ul>

        <h2>7 · Use the numbers</h2>
        <p>
          Every result is a shareable URL, and there's a free JSON API running on the same Cloudflare Worker:
        </p>
      </div>
      <pre className="card overflow-x-auto p-5 font-mono text-sm text-foam">
        <code>{`GET /api/estimate?model=claude-sonnet-5-5&tokens=2.5M&mix=code&region=eu
GET /api/models`}</code>
      </pre>

      <div className="prose-water">
        <h2>Sources</h2>
      </div>
      <ol className="mt-4 space-y-3 text-sm text-foam/80">
        {SOURCES.map((s, i) => (
          <li key={s.id} className="flex gap-3">
            <span className="w-6 shrink-0 text-right text-foam/40 tabular-nums">{i + 1}.</span>
            <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-aqua">
              {s.cite}
            </a>
          </li>
        ))}
      </ol>

      <p className="mt-12 text-foam/70">
        Spotted a better number? The whole model lives in a few small data files — every constant on this page is
        rendered straight from them. <Link to="/" className="text-aqua underline underline-offset-4">Back to the calculator →</Link>
      </p>
    </article>
  );
}
