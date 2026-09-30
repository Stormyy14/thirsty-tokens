const WAVE =
  "M0 40 C 150 10 150 10 300 40 S 450 70 600 40 S 750 10 900 40 S 1050 70 1200 40 V120 H0 Z";

const BUBBLES = [
  { left: "6%", size: 10, delay: "0s", dur: "9s" },
  { left: "14%", size: 6, delay: "3s", dur: "11s" },
  { left: "27%", size: 14, delay: "1.5s", dur: "13s" },
  { left: "41%", size: 8, delay: "5s", dur: "10s" },
  { left: "55%", size: 12, delay: "2s", dur: "12s" },
  { left: "68%", size: 6, delay: "6s", dur: "9s" },
  { left: "79%", size: 16, delay: "0.5s", dur: "14s" },
  { left: "91%", size: 9, delay: "4s", dur: "10s" },
];

/** The page's water table. Rises with the estimate on the home page. */
export function Waves({ level }: { level: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 transition-[height] duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ height: `${Math.round(level * 100)}vh` }}
    >
      <div className="absolute inset-x-0 -top-[58px] h-[60px] overflow-hidden">
        <svg className="absolute bottom-0 h-full w-[200%] animate-wave-slow opacity-40" viewBox="0 0 2400 120" preserveAspectRatio="none">
          <path d={WAVE} fill="#0f4c8a" />
          <path d={WAVE} transform="translate(1200 0)" fill="#0f4c8a" />
        </svg>
        <svg className="absolute bottom-0 h-[85%] w-[200%] animate-wave opacity-60" viewBox="0 0 2400 120" preserveAspectRatio="none" style={{ animationDirection: "reverse" }}>
          <path d={WAVE} fill="#1d7fd6" fillOpacity="0.5" />
          <path d={WAVE} transform="translate(1200 0)" fill="#1d7fd6" fillOpacity="0.5" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#12508f]/60 via-[#0a2a52]/70 to-[#051731]/90" />
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-0 animate-rise rounded-full border border-foam/40 bg-foam/10"
          style={{ left: b.left, width: b.size, height: b.size, animationDelay: b.delay, animationDuration: b.dur }}
        />
      ))}
    </div>
  );
}
