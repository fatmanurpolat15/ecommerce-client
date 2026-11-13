import type { TFunction } from "i18next";
import type { Category } from "../types/api";
import { translateCategoryName } from "../utils/categoryLabel";
import { formatProductPrice } from "./ProductCard";

interface ProductStatusMessageProps {
  searching: boolean;
  activeCategories: Category[];
  priceRange: { min: number; max: number } | null;
  currency: string;
  language: string;
  error: string | null;
  t: TFunction;
}

export default function ProductStatusMessage({
  searching,
  activeCategories,
  priceRange,
  currency,
  language,
  error,
  t,
}: ProductStatusMessageProps) {
  return (
    <div className="mb-6 min-h-6">
      {searching && (
        <p role="status" className="text-sm text-slate-400">
          {t("productsPage.searching")}
        </p>
      )}

      {activeCategories.length === 1 && priceRange && !searching && (
        <p className="text-sm text-slate-300">
          {priceRange.max === Number.MAX_SAFE_INTEGER
            ? t("productsPage.categoryAndPriceMinOnly", {
                category: translateCategoryName(activeCategories[0].name, t),
                min: formatProductPrice(priceRange.min, currency, language),
              })
            : t("productsPage.categoryAndPriceResults", {
                category: translateCategoryName(activeCategories[0].name, t),
                min: formatProductPrice(priceRange.min, currency, language),
                max: formatProductPrice(priceRange.max, currency, language),
              })}
        </p>
      )}

      {activeCategories.length > 1 && priceRange && !searching && (
        <p className="text-sm text-slate-300">
          {priceRange.max === Number.MAX_SAFE_INTEGER
            ? t("productsPage.multiCategoryAndPriceMinOnly", {
                count: activeCategories.length,
                min: formatProductPrice(priceRange.min, currency, language),
              })
            : t("productsPage.multiCategoryAndPriceResults", {
                count: activeCategories.length,
                min: formatProductPrice(priceRange.min, currency, language),
                max: formatProductPrice(priceRange.max, currency, language),
              })}
        </p>
      )}

      {activeCategories.length === 1 && !priceRange && !searching && (
        <p className="text-sm text-slate-300">
          {t("productsPage.categoryResults", {
            category: translateCategoryName(activeCategories[0].name, t),
          })}
        </p>
      )}

      {activeCategories.length > 1 && !priceRange && !searching && (
        <p className="text-sm text-slate-300">
          {t("productsPage.multiCategoryResults", {
            count: activeCategories.length,
          })}
        </p>
      )}

      {activeCategories.length === 0 && priceRange && !searching && (
        <p className="text-sm text-slate-300">
          {priceRange.max === Number.MAX_SAFE_INTEGER
            ? t("productsPage.priceRangeMinOnly", {
                min: formatProductPrice(priceRange.min, currency, language),
              })
            : t("productsPage.priceRangeResults", {
                min: formatProductPrice(priceRange.min, currency, language),
                max: formatProductPrice(priceRange.max, currency, language),
              })}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur"
        >
          {error}
        </p>
      )}
    </div>
  );
}
