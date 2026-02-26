import { useEffect, useMemo, useRef, useState } from "react";

type PopoverProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
};

function getFocusable(root: HTMLElement) {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(root.querySelectorAll<HTMLElement>(selectors));
}

export default function Popover({
  trigger,
  children,
  className,
  panelClassName,
}: PopoverProps) {
  const [open, setOpen] = useState(false);

  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const panelId = useMemo(
    () => `popover-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  // fecha ao clicar fora (mouse + touch)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!open) return;
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // fecha no ESC e devolve foco
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // foco ao abrir
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    // tenta focar primeiro elemento focável, senão foca o painel
    const focusables = getFocusable(panel);
    (focusables[0] ?? panel).focus();
  }, [open]);

  return (
    <span ref={wrapRef} className={`relative inline-flex ${className ?? ""}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="text-zinc-200 underline decoration-zinc-700 underline-offset-2 hover:text-white"
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          tabIndex={-1}
          className={`absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 shadow-xl ${panelClassName ?? ""}`}
        >
          {children}
        </div>
      )}
    </span>
  );
}