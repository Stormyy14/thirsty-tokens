import { useEffect, useState } from "react";

export const FUN_FACTS = [
  { text: "Google says its median Gemini text prompt uses 0.26 mL of water — about five drops.", src: "Google, Aug 2025", href: "https://arxiv.org/abs/2508.15734" },
  { text: "Sam Altman: the average ChatGPT query uses ~0.34 Wh and ~1/15 of a teaspoon of water.", src: "OpenAI, Jun 2025", href: "https://blog.samaltman.com/the-gentle-singularity" },
  { text: "Training GPT-3 is estimated to have evaporated ~700,000 L of fresh water on-site alone.", src: "Li et al. 2023", href: "https://arxiv.org/abs/2304.03271" },
  { text: "Mistral's life-cycle study: one 400-token reply ≈ 45 mL once chip manufacturing is included.", src: "Mistral AI, Jul 2025", href: "https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai" },
  { text: "US data centers directly consumed ~64 billion liters of water in 2023.", src: "LBNL, Dec 2024", href: "https://eta-publications.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report" },
  { text: "One burger (~2,400 L of virtual water) ≈ 9 million median Gemini prompts.", src: "WFN + Google", href: "https://www.waterfootprint.org/resources/interactive-tools/product-gallery/" },
  { text: "Most of AI's water isn't 'drunk' by chips — it evaporates from cooling towers and power plants.", src: "Li et al. 2023", href: "https://arxiv.org/abs/2304.03271" },
];

export function FunFacts() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % FUN_FACTS.length), 6500);
    return () => clearInterval(id);
  }, []);
  const f = FUN_FACTS[i];
  return (
    <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
      <span className="text-2xl" aria-hidden>💡</span>
      <p key={i} className="flex-1 animate-pop text-foam" aria-live="polite">
        {f.text}{" "}
        <a href={f.href} target="_blank" rel="noreferrer" className="text-sm whitespace-nowrap text-aqua hover:underline">
          — {f.src}
        </a>
      </p>
      <div className="flex gap-1.5" aria-hidden>
        {FUN_FACTS.map((_, j) => (
          <span key={j} className={`h-1.5 rounded-full transition-all ${j === i ? "w-5 bg-aqua" : "w-1.5 bg-white/20"}`} />
        ))}
      </div>
    </div>
  );
}

const QA = [
  {
    q: "Why does AI use water at all?",
    a: "GPUs turn electricity into heat. Most large data centers dump that heat by evaporating water in cooling towers (the on-site part). The electricity itself usually comes from thermal power plants that evaporate even more water in their own cooling systems (the off-site part). Both are real fresh water leaving the local watershed as vapor.",
  },
  {
    q: "Why do the numbers online vary from 0.26 mL to 50 mL per prompt?",
    a: "Different boundaries. Google's 0.26 mL counts only on-site cooling. Li et al.'s 10–50 mL for GPT-3 includes power-plant water and an older, less efficient model. Mistral's 45 mL even includes the water used to manufacture chips. Toggle “What counts?” above to see the gap yourself.",
  },
  {
    q: "Isn't the water just recycled?",
    a: "Evaporated water does come back as rain — but somewhere else, and often not where the data center draws it. That's why reports distinguish withdrawal (borrowed, returned) from consumption (gone from the local basin). Everything on this site is consumption.",
  },
  {
    q: "So should I feel guilty about every prompt?",
    a: "A single chat is a few drops — a shower or a burger dwarfs thousands of them. The concern is scale and location: billions of daily prompts plus agent workloads, concentrated in places like Arizona or Aragón where water is already stressed. Use the “Scale it up” section to feel that difference.",
  },
  {
    q: "How can I make my AI use less thirsty?",
    a: "Pick the smallest model that does the job, keep prompts tight, lean on prompt caching, don't max out reasoning effort for trivial tasks, and prefer providers that publish their water data and build in cool climates or with dry cooling.",
  },
  {
    q: "How accurate is this?",
    a: "Within an order of magnitude, honestly. No lab publishes per-token energy for closed models, so we place each model in a compute tier calibrated on the public disclosures we do have — and show a low–high range on every result. The methodology page lists every number and source.",
  },
];

export function Faq() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {QA.map((x) => (
        <details key={x.q} className="card group p-5 open:border-aqua/30">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-white">
            {x.q}
            <span className="mt-0.5 text-aqua transition group-open:rotate-45" aria-hidden>＋</span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-foam/80">{x.a}</p>
        </details>
      ))}
    </div>
  );
}
