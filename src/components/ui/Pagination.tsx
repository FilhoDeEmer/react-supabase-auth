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
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const rangeText =
    totalItems != null && pageSize != null
      ? (() => {
          const start = (page - 1) * pageSize + 1;
          const end = Math.min(page * pageSize, totalItems);
          return `${start}-${end} de ${totalItems}`;
        })()
      : null;
  return (
    <div className={`mt-6 flex fex-col gap-2 sm: flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="text-sm text-zinc-400">
      {rangeText ? (
        <span>{rangeText}</span>
      ) : (
        <span>Página {page} de {totalPages}</span>
      )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="h-10 px-4 w-auto"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!canPrev}
        >
          Anterior
        </Button>

        <Button
          variant="secondary"
          className="h-10 px-4 w-auto"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={!canNext}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
