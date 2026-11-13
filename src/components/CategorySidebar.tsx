import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import type { TFunction } from "i18next";
import type { Category } from "../types/api";
import { translateCategoryName } from "../utils/categoryLabel";

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryIds: number[];
  onToggleCategory: (id: number) => void;
  onClearCategories: () => void;
  t: TFunction;

  // Fiyat filtresi props
  minPrice: string;
  maxPrice: string;
  priceValidationError: string | null;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onApplyPriceFilter: (e: FormEvent<HTMLFormElement>) => void;
  onClearPriceFilter: () => void;
  isPriceFilterActive: boolean;
  searching: boolean;
}

export default function CategorySidebar({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  onClearCategories,
  t,
  minPrice,
  maxPrice,
  priceValidationError,
  onMinPriceChange,
  onMaxPriceChange,
  onApplyPriceFilter,
  onClearPriceFilter,
  isPriceFilterActive,
  searching,
}: CategorySidebarProps) {
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories;
    const q = categorySearchQuery.trim().toLowerCase();
    return categories.filter((category) => {
      const translated = translateCategoryName(category.name, t).toLowerCase();
      const raw = category.name.toLowerCase();
      return translated.includes(q) || raw.includes(q);
    });
  }, [categories, categorySearchQuery, t]);

  const hasSelectedCategories = selectedCategoryIds.length > 0;

  return (
    <aside className="w-full space-y-6" aria-label={t("productsPage.filtersTitle")}>
      {/* Kategori Filtresi Kartı */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-white">
              {t("productsPage.categoriesTitle")}
            </h2>
            {hasSelectedCategories && (
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">
                {selectedCategoryIds.length}
              </span>
            )}
          </div>

          {hasSelectedCategories && (
            <button
              type="button"
              onClick={onClearCategories}
              className="text-xs font-medium text-slate-400 transition hover:text-blue-400"
            >
              {t("productsPage.clearAllCategories")}
            </button>
          )}
        </div>

        {/* Kategori Arama Kutusu (Kategori sayısı fazlaysa) */}
        {categories.length > 5 && (
          <div className="relative mb-3">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              placeholder={t("productsPage.searchCategoriesPlaceholder")}
              aria-label={t("productsPage.searchCategoriesPlaceholder")}
              className="w-full rounded-lg border border-white/10 bg-slate-950/50 py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        )}

        {/* Kategori Listesi (Checkboxlar) */}
        <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {/* Tüm Kategoriler Seçeneği */}
          <button
            type="button"
            onClick={onClearCategories}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
              !hasSelectedCategories
                ? "border-blue-500/40 bg-blue-500/15 text-blue-300 shadow-sm"
                : "border-transparent text-slate-300 hover:bg-white/5"
            }`}
          >
            <span>{t("productsPage.allCategories")}</span>
            {!hasSelectedCategories && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            )}
          </button>

          {filteredCategories.map((category) => {
            const isSelected = selectedCategoryIds.includes(category.id);
            const translatedName = translateCategoryName(category.name, t);

            return (
              <label
                key={category.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition select-none ${
                  isSelected
                    ? "border-blue-500/40 bg-blue-500/15 text-blue-300 shadow-sm"
                    : "border-transparent text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleCategory(category.id)}
                    className="h-4 w-4 rounded border-white/20 bg-slate-950/60 text-blue-600 accent-blue-600 outline-none transition focus:ring-2 focus:ring-blue-500/30"
                  />
                  <span>{translatedName}</span>
                </div>

                {isSelected && (
                  <svg
                    className="h-3.5 w-3.5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </label>
            );
          })}

          {filteredCategories.length === 0 && (
            <p className="py-2 text-center text-xs text-slate-500">
              {t("productsPage.noResults")}
            </p>
          )}
        </div>
      </div>

      {/* Fiyat Aralığı Kartı */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-white">
            {t("productsPage.priceFilterLabel")}
          </h2>
          {isPriceFilterActive && (
            <button
              type="button"
              onClick={onClearPriceFilter}
              className="text-xs font-medium text-slate-400 transition hover:text-blue-400"
            >
              {t("productsPage.clearFilter")}
            </button>
          )}
        </div>

        <form onSubmit={onApplyPriceFilter} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="sidebar-minPrice" className="mb-1 block text-xs font-medium text-slate-400">
                {t("productsPage.minPrice")}
              </label>
              <input
                id="sidebar-minPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-2.5 py-1.5 text-xs text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="sidebar-maxPrice" className="mb-1 block text-xs font-medium text-slate-400">
                {t("productsPage.maxPrice")}
              </label>
              <input
                id="sidebar-maxPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="10000"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-2.5 py-1.5 text-xs text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {priceValidationError && (
            <p role="alert" className="text-xs text-red-400">
              {priceValidationError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={searching}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {t("productsPage.applyFilter")}
            </button>

            {isPriceFilterActive && (
              <button
                type="button"
                onClick={onClearPriceFilter}
                disabled={searching}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 focus:outline-none"
              >
                {t("productsPage.clearFilter")}
              </button>
            )}
          </div>
        </form>
      </div>
    </aside>
  );
}
