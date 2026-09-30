import { useMemo } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Calculator } from "~/components/Calculator";
import { ComparisonExplorer, Highlights } from "~/components/Comparisons";
import { Faq, FunFacts } from "~/components/Faq";
import { Receipt } from "~/components/Receipt";
import { ResultPanel } from "~/components/ResultPanel";
import { ScaleUp } from "~/components/ScaleUp";
import { Showdown } from "~/components/Showdown";
import { useCalcState } from "~/hooks/useCalcState";
import { estimate } from "~/lib/calc";
import { cloudflareContext } from "~/lib/context";
import { compactTokens, volume } from "~/lib/format";
import { MODELS, PROVIDERS } from "~/lib/models";
import { regionForCountry } from "~/lib/regions";
import { parseState } from "~/lib/state";
import { useWaterLevel } from "~/lib/water-level";

export function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const cf = context.get(cloudflareContext);
  const country = cf?.country ?? null;
  const initial = parseState(url.searchParams);
  const shared = url.searchParams.has("t");
  const est = estimate(initial);
  return {
    initial,
    country,
    suggestedRegion: regionForCountry(country),
    shared,
    headline: `${compactTokens(initial.tokens)} tokens on ${est.model.name} ≈ ${volume(est.totalMl, initial.units)} of water`,
    origin: url.origin,
  };
}

// State lives in the client after hydration; nothing to re-fetch.
export function shouldRevalidate() {
  return false;
}

export function meta({ loaderData }: Route.MetaArgs) {
  const title = loaderData?.shared
    ? `${loaderData.headline} · Thirsty Tokens`
    : "Thirsty Tokens — how much water did your AI drink?";
  const description = loaderData?.shared
    ? `${loaderData.headline}. Compare Claude, GPT, Gemini & more — in bathtubs, burgers and Olympic pools.`
    : "Estimate the water footprint of AI tokens for Claude, GPT, Gemini, Grok, DeepSeek, Llama and more — then see it in bathtubs, burgers and Olympic pools.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [state, update] = useCalcState(loaderData.initial);
  const est = useMemo(() => estimate(state), [state]);
  useWaterLevel(est.totalMl);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="max-w-3xl">
          <p className="chip pointer-events-none">
            <span className="h-2 w-2 animate-pulse rounded-full bg-kelp" /> {MODELS.length} models · {PROVIDERS.length - 1} providers · sources included
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.02] font-extrabold tracking-tight text-white sm:text-7xl">
            How much water did your AI{" "}
            <span className="bg-gradient-to-r from-foam via-aqua to-sea bg-clip-text text-transparent">drink</span>?
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-foam/80">
            Pick a model, type your tokens, and watch this page fill up. Then see it in bathtubs, burgers, camels and
            Olympic pools.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <div className="card p-5 sm:p-7 lg:col-span-7">
            <Calculator
              state={state}
              update={update}
              suggestedRegion={loaderData.suggestedRegion}
              country={loaderData.country}
            />
          </div>
          <div id="result" className="lg:col-span-5">
            <div className="card border-aqua/20 p-5 sm:p-7 lg:sticky lg:top-24">
              <ResultPanel est={est} units={state.units} tokens={state.tokens} scope={state.scope} />
            </div>
          </div>
        </div>
      </section>

      <MobileResultPill ml={est.totalMl} units={state.units} />

      <Section
        id="enough"
        kicker="In real life"
        title="That's enough water to…"
        lede={`${compactTokens(state.tokens)} tokens on ${est.model.name}, translated into things you can picture.`}
      >
        <Highlights ml={est.totalMl} />
      </Section>

      <Section
        id="scale"
        kicker="Scale it up"
        title="One prompt is a sip. Billions are a river."
        lede="The same request, multiplied by the way people actually use AI."
      >
        <ScaleUp ml={est.totalMl} units={state.units} />
      </Section>

      <Section
        id="showdown"
        kicker="Model showdown"
        title="Same tokens, different thirst"
        lede="Swap the model and keep everything else. Bigger models and hotter, coal-heavy grids drink more."
      >
        <Showdown state={state} units={state.units} />
      </Section>

      <Section id="receipt" kicker="Take-away" title="Your water receipt">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Receipt est={est} units={state.units} tokens={state.tokens} />
          <div className="space-y-5 text-foam/85">
            <p className="text-lg">
              Screenshot it, stick it on the fridge, send it to the colleague who runs 40 agents overnight.
            </p>
            <p>
              <strong className="text-white">Cooling water</strong> is what the data center evaporates to keep GPUs from
              melting. <strong className="text-white">Power-plant water</strong> is evaporated generating the
              electricity — often the bigger half, and the part most corporate reports leave out.
            </p>
            <p>
              Want the gory details — PUE, WUE, EWIF, why input tokens are cheaper than output tokens?{" "}
              <Link to="/methodology" className="text-aqua underline underline-offset-4">Read the methodology</Link>.
            </p>
          </div>
        </div>
      </Section>

      <Section id="explore" kicker="Explore" title="Every comparison we've got">
        <ComparisonExplorer ml={est.totalMl} />
      </Section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <FunFacts />
      </section>

      <Section id="faq" kicker="FAQ" title="Wait, but…">
        <Faq />
      </Section>
    </>
  );
}

function Section({
  id,
  kicker,
  title,
  lede,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto mt-24 max-w-7xl scroll-mt-24 px-4 sm:px-6">
      <p className="label text-aqua">{kicker}</p>
      <h2 className="section-title mt-2">{title}</h2>
      {lede && <p className="mt-3 max-w-2xl text-foam/70">{lede}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function MobileResultPill({ ml, units }: { ml: number; units: "metric" | "imperial" }) {
  return (
    <a
      href="#result"
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-aqua/40 bg-abyss/90 px-4 py-2.5 font-semibold text-white shadow-xl shadow-black/50 backdrop-blur lg:hidden"
    >
      💧 {volume(ml, units)}
    </a>
  );
}
