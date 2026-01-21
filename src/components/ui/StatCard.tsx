type StatCardProps = {
  label: string;
  value: string;
  description?: string;
};

export default function StatCard({
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-1">
      <p className="text-sm text-zinc-400">{label}</p>

      <p className="text-2xl font-semibold text-zinc-100">
        {value}
      </p>

      {description && (
        <p className="text-sm text-zinc-500">
          {description}
        </p>
      )}
    </div>
  );
}
