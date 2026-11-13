import type { TFunction } from "i18next";

interface PaginationProps {
  currentPage: number; 
  totalPages: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  t: TFunction;
}

export default function Pagination({
  currentPage,
  totalPages,
  loading,
  onPageChange,
  t,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-3"
      aria-label="Pagination Navigation"
    >
      <button
        type="button"
        disabled={currentPage <= 0 || loading}
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("productsPage.previousPage")}
      </button>

      <span className="text-sm font-medium text-slate-400">
        {t("productsPage.pageInfo", { current: currentPage + 1, total: totalPages })}
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages - 1 || loading}
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("productsPage.nextPage")}
      </button>
    </nav>
  );
}
