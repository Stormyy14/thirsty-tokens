import { createContext, useContext, useEffect } from "react";

type SetLevel = (level: number) => void;

export const WaterLevelContext = createContext<SetLevel>(() => {});

/**
 * Maps a volume onto how high the page's background water should rise:
 * a single drop sits near the floor, a Loch Ness nearly floods the screen.
 */
export function levelForMl(ml: number) {
  const lg = Math.log10(Math.max(ml, 0.01)); // -2 … 16
  const t = Math.min(1, Math.max(0, (lg + 1) / 16));
  return 0.08 + t * 0.55;
}

export function useWaterLevel(ml: number | null) {
  const setLevel = useContext(WaterLevelContext);
  useEffect(() => {
    setLevel(ml === null ? 0.12 : levelForMl(ml));
  }, [ml, setLevel]);
  useEffect(() => () => setLevel(0.12), [setLevel]);
}
