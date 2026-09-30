import { useEffect, useState } from "react";
import { serializeState, type CalcState } from "~/lib/state";

/**
 * Calculator state lives in React; the URL mirrors it (debounced) so any
 * result is a shareable link. We replace history in place rather than
 * navigating, so typing never triggers loaders or scroll jumps.
 */
export function useCalcState(initial: CalcState) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    const id = setTimeout(() => {
      const qs = serializeState(state).toString();
      const url = `${window.location.pathname}?${qs}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", url);
    }, 250);
    return () => clearTimeout(id);
  }, [state]);

  const update = (patch: Partial<CalcState>) => setState((s) => ({ ...s, ...patch }));
  return [state, update] as const;
}
