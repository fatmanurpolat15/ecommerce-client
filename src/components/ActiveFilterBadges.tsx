import type { TFunction } from "i18next";
import type { Category } from "../types/api";
import { translateCategoryName } from "../utils/categoryLabel";
import { formatProductPrice } from "./ProductCard";

interface ActiveFilterBadgesProps {
  selectedCategories: Category[];
  priceRange: { min: number; max: number } | null;
  currency: string;
  language: string;
  t: TFunction;
  onRemoveCategory: (id: number) => void;
  onClearPrice: () => void;
  onClearAll: () => void;
}

export default function ActiveFilterBadges({
  selectedCategories,
  priceRange,
  currency,
  language,
  t,
  onRemoveCategory,
  onClearPrice,
  onClearAll,
}: ActiveFilterBadgesProps) {
  const hasCategories = selectedCategories.length > 0;
  const hasPrice = priceRange !== null;

  if (!hasCategories && !hasPrice) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {t("productsPage.filtersTitle")}:
      </span>

      {selectedCategories.map((category) => (
        <span
          key={category.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300 backdrop-blur"
        >
          {translateCategoryName(category.name, t)}
          <button
            type="button"
            onClick={() => onRemoveCategory(category.id)}
            className="hover:text-white"
            aria-label={`Remove ${category.name}`}
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      {priceRange && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300 backdrop-blur">
          {priceRange.max === Number.MAX_SAFE_INTEGER
            ? t("productsPage.priceRangeMinOnly", {
                min: formatProductPrice(priceRange.min, currency, language),
              })
            : t("productsPage.priceRangeResults", {
                min: formatProductPrice(priceRange.min, currency, language),
                max: formatProductPrice(priceRange.max, currency, language),
              })}
          <button
            type="button"
            onClick={onClearPrice}
            className="hover:text-white"
            aria-label="Remove price filter"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      )}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-slate-400 underline underline-offset-2 hover:text-white"
      >
        {t("productsPage.clearAllCategories")}
      </button>
    </div>
  );
}
