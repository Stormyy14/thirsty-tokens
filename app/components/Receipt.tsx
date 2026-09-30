import type { Estimate } from "~/lib/calc";
import { pickHighlights } from "~/lib/comparisons";
import { compactTokens, count, energy, mass, volume, type Units } from "~/lib/format";
import { getRegion } from "~/lib/regions";

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline gap-2 ${strong ? "text-base font-semibold" : ""}`}>
      <span className="shrink-0">{k}</span>
      <span className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-neutral-400" />
      <span className="shrink-0 text-right">{v}</span>
    </div>
  );
}

export function Receipt({ est, units, tokens }: { est: Estimate; units: Units; tokens: number }) {
  const region = getRegion(est.regionId);
  const eq = pickHighlights(est.totalMl, 3);
  const order = Math.abs(hash(`${est.model.id}${tokens}`)) % 100000;

  return (
    <div className="receipt mx-auto w-full max-w-sm rotate-[-1.2deg] px-6 pt-7 pb-10 font-mono text-[13px] leading-relaxed text-neutral-800 shadow-2xl shadow-black/60 transition hover:rotate-0">
      <div className="text-center">
        <p className="text-lg font-bold tracking-widest">THIRSTY TOKENS</p>
        <p className="text-[11px] text-neutral-500">EDGE WATER CO. · SERVED BY CLOUDFLARE</p>
        <p className="mt-1 text-[11px] text-neutral-500">ORDER #{String(order).padStart(5, "0")}</p>
      </div>
      <div className="my-4 border-t border-dashed border-neutral-400" />
      <Line k="MODEL" v={est.model.name} />
      <Line k="PROVIDER" v={est.providerName} />
      <Line k="REGION" v={`${region.icon} ${region.name.replace(/\s*\(.*\)/, "")}`} />
      <div className="my-3 border-t border-dashed border-neutral-400" />
      <Line k="TOKENS" v={compactTokens(tokens)} />
      <Line k="  output" v={compactTokens(est.outputTokens)} />
      <Line k="  input" v={compactTokens(est.inputTokens)} />
      {est.cachedTokens > 0 && <Line k="  cached" v={compactTokens(est.cachedTokens)} />}
      <Line k="ELECTRICITY" v={energy(est.energyWh)} />
      <Line k="CO₂e" v={mass(est.co2g, units)} />
      <div className="my-3 border-t border-dashed border-neutral-400" />
      <Line k="COOLING WATER" v={volume(est.onsiteMl, units)} />
      <Line k="POWER-PLANT WATER" v={volume(est.offsiteMl, units)} />
      <div className="my-3 border-t-2 border-neutral-800" />
      <Line k="TOTAL" v={volume(est.totalMl, units)} strong />
      <div className="my-3 border-t border-dashed border-neutral-400" />
      <p className="text-[11px] text-neutral-500">EQUIVALENT TO:</p>
      {eq.map((c) => (
        <p key={c.id}>
          {c.emoji} {count(est.totalMl / c.ml)} {est.totalMl / c.ml === 1 ? c.one : c.many}
        </p>
      ))}
      <div className="barcode mx-auto mt-6 h-12 w-4/5" />
      <p className="mt-3 text-center text-[11px] text-neutral-500">THANK YOU FOR HYDRATING THE CLOUD</p>
      <p className="text-center text-[11px] text-neutral-500">*estimates · no refunds on evaporation*</p>
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
