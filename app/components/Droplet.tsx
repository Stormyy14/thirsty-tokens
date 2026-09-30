/** Our mascot: a slightly worried water droplet. */
export function Droplet({ className = "", mood = "happy" }: { className?: string; mood?: "happy" | "worried" | "shocked" }) {
  const mouth =
    mood === "happy" ? "M25 47q7 5 14 0" : mood === "worried" ? "M25 50q7 -4 14 0" : "M29 49a3 4 0 1 0 6 0a3 4 0 1 0 -6 0";
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="droplet-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bae6fd" />
          <stop offset="1" stopColor="#1d7fd6" />
        </linearGradient>
      </defs>
      <path d="M32 4C32 4 12 28 12 41a20 20 0 0 0 40 0C52 28 32 4 32 4Z" fill="url(#droplet-g)" />
      <ellipse cx="22" cy="30" rx="3" ry="6" fill="#fff" opacity="0.5" transform="rotate(20 22 30)" />
      <circle cx="24" cy="40" r="3.2" fill="#020a18" />
      <circle cx="40" cy="40" r="3.2" fill="#020a18" />
      <circle cx="25" cy="39" r="1" fill="#fff" />
      <circle cx="41" cy="39" r="1" fill="#fff" />
      <path d={mouth} stroke="#020a18" strokeWidth="3" fill={mood === "shocked" ? "#020a18" : "none"} strokeLinecap="round" />
      {mood !== "happy" && <path d="M50 22q3 5 0 8q-3 -3 0 -8Z" fill="#bae6fd" />}
    </svg>
  );
}
