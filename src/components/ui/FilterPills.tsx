type FilterOption = {
    label: string;
    value: string;
};

type FilterPillsProps = {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

export default function FilterPills({
    options,
    value,
    onChange,
    className = "",
}: FilterPillsProps) {
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {options.map((opt) => {
                const active = opt.value === value;

                return (
                    <button key={opt.value}
                    type="button"
                    onClick={()=> onChange(opt.value)}
                    className={["h-9 px-3 rounded-full text-sm border  transition", active ? "bg-indigo-600 border-indigo-500 text-white" : "bg-zinc-950/40 border-zinc-800 text-zinc-200 hover:bg-zinc-900",
                    ].join (" ")}
                    aria-pressed={active}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    )
}