# Thirsty Tokens 💧

**How much water did your AI drink?** A playful, sourced calculator that turns LLM tokens into liters — then into bathtubs, burgers, camels and Olympic pools.

Built with **React Router v8** (framework mode, SSR) on **Cloudflare Workers**.

## Features

- **Calculator** — 38 models from Anthropic, OpenAI, Google, xAI, Meta, DeepSeek, Mistral, Alibaba and others (plus "your laptop"), human-friendly token input (`250k`, `3.5M`), log slider and 10 presets from "say thanks" to "read all of Wikipedia".
- **Honest model** — input vs output vs cached tokens, hidden reasoning tokens, provider PUE/WUE, 10 data-center regions, and a *cooling only* vs *cooling + power plants* toggle. Every result shows a low–high range.
- **Fun comparisons** — 40 everyday references in five groups (drinks, around the house, absurdly big, thirsty creatures, hidden water footprints), with emoji that fill up.
- **The page fills with water** as your estimate grows.
- **Scale it up** (every day for a year, all of ChatGPT's daily prompts, all 8.2B humans), **model showdown**, a printable **water receipt**, and a **Thirst Leaderboard** with head-to-head comparisons.
- **Shareable URLs** — state lives in the query string; results are rendered on the server, so shared links get the right `<title>`/OG text.
- **Edge-aware** — uses Cloudflare's `request.cf.country` to suggest your local grid.
- **JSON API** — `GET /api/estimate?model=claude-sonnet-5-5&tokens=2.5M&mix=code&region=eu` and `GET /api/models`.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for the calculation engine
npm run typecheck
```

## Deploy to Cloudflare Workers

```sh
npx wrangler login   # once
npm run deploy       # builds and runs `wrangler deploy`
```

The Worker name is set in `wrangler.jsonc` (`howmuchwater`) — it will be served at `https://howmuchwater.<your-subdomain>.workers.dev`. Add a custom domain from the Cloudflare dashboard or with a `routes` entry in `wrangler.jsonc`.

`npm run check` runs typecheck + build + `wrangler deploy --dry-run` without publishing.

## Where the numbers live

| File | What |
|---|---|
| `app/lib/models.ts` | Providers (PUE, WUE, default region), compute tiers (Wh per 1K output tokens) and every model |
| `app/lib/regions.ts` | Grid water intensity (EWIF), climate multiplier and carbon intensity per region |
| `app/lib/comparisons.ts` | Everyday volumes and scale-up scenarios |
| `app/lib/calc.ts` | The formula |

The methodology page renders its tables straight from these files, so updating a number updates the docs.

Inspired by [tokenwater.org](https://tokenwater.org/). Core method from Li et al., [“Making AI Less Thirsty”](https://arxiv.org/abs/2304.03271).
