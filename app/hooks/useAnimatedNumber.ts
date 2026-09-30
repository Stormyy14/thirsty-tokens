import { useEffect, useRef, useState } from "react";

/**
 * Tweens toward `target` in log space so jumping from 1 mL to 1 billion L
 * feels like a smooth rush of water rather than a teleport.
 */
export function useAnimatedNumber(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const a = Math.log(Math.max(from.current, 1e-9));
    const b = Math.log(Math.max(target, 1e-9));
    if (a === b || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = target;
      setValue(target);
      return;
    }
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const v = Math.exp(a + (b - a) * eased);
      from.current = v;
      setValue(t === 1 ? target : v);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}
