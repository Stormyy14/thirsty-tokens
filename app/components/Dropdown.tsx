import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  /** Right-aligned extra, e.g. a number. */
  meta?: ReactNode;
  /** Shown on the closed button instead of `label`. */
  display?: string;
  /** Options sharing a group get a small heading. */
  group?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  /** Accessible name, e.g. "Data center location". */
  label: string;
  id?: string;
  size?: "sm" | "md";
}

interface Placement {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

/** A listbox that looks like the rest of the site instead of the OS menu. */
export function Dropdown({ value, onChange, options, label, id, size = "md" }: Props) {
  const uid = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [place, setPlace] = useState<Placement | null>(null);

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  const measure = useCallback(() => {
    const el = btn.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const width = Math.min(Math.max(r.width, 260), vw - 16);
    const left = Math.max(8, Math.min(r.left, vw - width - 8));
    const below = window.innerHeight - r.bottom - 14;
    const above = r.top - 14;
    const up = below < 260 && above > below;
    setPlace({
      left,
      width,
      maxHeight: Math.min(400, up ? above : below),
      ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
    });
  }, []);

  const openMenu = (at = selectedIndex) => {
    measure();
    setActive(at);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  };
  const choose = (i: number) => {
    onChange(options[i].value);
    close();
  };

  useLayoutEffect(() => {
    if (!open) return;
    list.current?.focus({ preventScroll: true });
    const onMove = () => measure();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!list.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    };
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, measure]);

  // Keep the active option visible without scrolling the page itself.
  useEffect(() => {
    const l = list.current;
    const el = open ? document.getElementById(`${uid}-opt-${active}`) : null;
    if (!l || !el) return;
    if (el.offsetTop < l.scrollTop) l.scrollTop = el.offsetTop - 6;
    else if (el.offsetTop + el.offsetHeight > l.scrollTop + l.clientHeight) l.scrollTop = el.offsetTop + el.offsetHeight - l.clientHeight + 6;
  }, [open, active, uid]);

  function onButtonKey(e: KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openMenu();
    }
  }

  function onListKey(e: KeyboardEvent) {
    const last = options.length - 1;
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => Math.min(last, a + 1)),
      ArrowUp: () => setActive((a) => Math.max(0, a - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => choose(active),
      " ": () => choose(active),
      Escape: () => close(),
      Tab: () => close(false),
    };
    if (keys[e.key]) {
      if (e.key !== "Tab") e.preventDefault();
      keys[e.key]();
      return;
    }
    // Type-ahead: jump to the next option starting with that letter.
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase();
      for (let step = 1; step <= options.length; step++) {
        const i = (active + step) % options.length;
        if (options[i].label.toLowerCase().startsWith(k)) {
          setActive(i);
          break;
        }
      }
    }
  }

  const pad = size === "sm" ? "py-2" : "py-2.5";

  return (
    <>
      <button
        ref={btn}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${uid}-list` : undefined}
        aria-label={`${label}: ${selected?.label ?? ""}`}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onButtonKey}
        className={`field group flex items-center gap-3 text-left text-sm transition hover:border-white/25 ${pad} ${
          open ? "border-aqua ring-2 ring-aqua/20" : ""
        }`}
      >
        {selected?.icon && (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5 text-base" aria-hidden>
            {selected.icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate font-medium text-white">{selected?.display ?? selected?.label}</span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 text-foam/60 transition duration-200 group-hover:text-foam ${open ? "rotate-180 text-aqua" : ""}`}
          fill="currentColor"
          aria-hidden
        >
          <path d="M5.2 7.4a.75.75 0 0 1 1.06.04L10 11.4l3.74-3.96a.75.75 0 1 1 1.09 1.03l-4.28 4.53a.75.75 0 0 1-1.1 0L5.17 8.47a.75.75 0 0 1 .04-1.06Z" />
        </svg>
      </button>

      {open &&
        place &&
        createPortal(
          <ul
            ref={list}
            id={`${uid}-list`}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${uid}-opt-${active}`}
            onKeyDown={onListKey}
            style={{ left: place.left, width: place.width, top: place.top, bottom: place.bottom, maxHeight: place.maxHeight }}
            className={`fixed z-[100] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-deep/95 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-black/20 backdrop-blur-xl outline-none ${
              place.bottom !== undefined ? "origin-bottom" : "origin-top"
            } animate-menu`}
          >
            {options.map((o, i) => {
              const isSelected = i === selectedIndex;
              const heading = o.group && o.group !== options[i - 1]?.group;
              return (
                <li key={o.value} role="presentation">
                  {heading && <p className="px-3 pt-3 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-foam/45 uppercase">{o.group}</p>}
                  <div
                    id={`${uid}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    onPointerMove={() => active !== i && setActive(i)}
                    onClick={() => choose(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${
                      isSelected
                        ? `ring-1 ring-aqua/40 ring-inset ${i === active ? "bg-aqua/20" : "bg-aqua/12"}`
                        : i === active
                          ? "bg-white/[0.07]"
                          : ""
                    }`}
                  >
                    {o.icon && (
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-base ${isSelected ? "bg-aqua/20" : "bg-white/5"}`}
                        aria-hidden
                      >
                        {o.icon}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-medium ${isSelected ? "text-white" : "text-foam"}`}>{o.label}</span>
                      {o.description && <span className="block truncate text-xs text-foam/50">{o.description}</span>}
                    </span>
                    {o.meta && <span className="hidden shrink-0 text-xs text-foam/60 sm:block">{o.meta}</span>}
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        isSelected ? "bg-aqua text-abyss" : "text-transparent"
                      }`}
                      aria-hidden
                    >
                      ✓
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
