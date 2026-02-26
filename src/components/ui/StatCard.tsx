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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3 min-w-0">
      <dl>
        <dt className="text-sm text-zinc-400">{label}</dt>

        <dd className="text-2xl font-semibold text-zinc-100 tabular-nums">
          {value}
        </dd>

        {description && (
          <p className="text-sm text-zinc-500">{description}</p>
        )}
      </dl>
    </div>
  );
}