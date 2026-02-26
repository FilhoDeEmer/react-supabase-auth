import Button from "./Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;

  totalItems?: number;
  pageSize?: number;

  className?: string;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = "",
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);

  const canPrev = safePage > 1;
  const canNext = safePage < safeTotalPages;

  const rangeText =
    totalItems != null && pageSize != null
      ? (() => {
          if (totalItems <= 0) return `0 de 0`;
          const start = (safePage - 1) * pageSize + 1;
          const end = Math.min(safePage * pageSize, totalItems);
          return `${start}-${end} de ${totalItems}`;
        })()
      : null;

  return (
    <div
      className={`mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${className}`}
      aria-label="Paginação"
    >
      <div className="text-sm text-zinc-400 tabular-nums">
        {rangeText ? (
          <span>{rangeText}</span>
        ) : (
          <span>
            Página {safePage} de {safeTotalPages}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="h-10 px-4 w-auto"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={!canPrev}
          aria-disabled={!canPrev}
        >
          Anterior
        </Button>

        <Button
          variant="secondary"
          className="h-10 px-4 w-auto"
          onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
          disabled={!canNext}
          aria-disabled={!canNext}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}