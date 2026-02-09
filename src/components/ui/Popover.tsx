import { useEffect, useId, useRef, useState } from "react";

type PopoverProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
};

export default function Popover({
  trigger,
  children,
  className,
  panelClassName,
}: PopoverProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement | null>(null);

  // fecha ao clicar fora
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  // fecha no ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <span ref={wrapRef} className={`relative inline-flex ${className ?? ""}`}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="text-zinc-200 underline decoration-zinc-700 underline-offset-2 hover:text-white"
      >
        {trigger}
      </button>

      {open && (
        <div
          id={id}
          role="dialog"
          className={`absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 shadow-xl ${panelClassName ?? ""}`}
        >
          {children}
        </div>
      )}
    </span>
  );
}
