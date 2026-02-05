type NumberStepperProps = {
  value: number | "";
  onChange: (v: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
};

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 9,
  step = 1,
  placeholder,
}: NumberStepperProps) {
  function clamp(v: number) {
    return Math.min(max, Math.max(min, v));
  }

  return (
    <div className="flex h-10 w-20 items-center rounded-lg border border-zinc-800 bg-zinc-950/60 overflow-hidden">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : clamp(Number(e.target.value)))
        }
        className="w-full h-full bg-transparent text-center text-sm text-zinc-100 outline-none"
      />
    </div>
  );
}
