import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import api, { toApiError } from "../api/axiosInstance";
import { translateCategoryName } from "../utils/categoryLabel";
import type { Category, Page, Product } from "../types/api";

const PAGE_SIZE = 12;

const CATEGORY_THEMES: Record<string, { gradient: string; accent: string; glow: string }> = {
  bilgisayar: {
    gradient: "from-blue-500 via-blue-600 to-sky-700",
    accent: "text-blue-400",
    glow: "group-hover:shadow-blue-500/25",
  },
  telefon: {
    gradient: "from-sky-500 via-cyan-600 to-blue-700",
    accent: "text-cyan-400",
    glow: "group-hover:shadow-cyan-500/25",
  },
  kulaklık: {
    gradient: "from-indigo-500 via-blue-600 to-sky-700",
    accent: "text-indigo-400",
    glow: "group-hover:shadow-indigo-500/25",
  },
  klavye: {
    gradient: "from-blue-400 via-sky-500 to-cyan-600",
    accent: "text-sky-400",
    glow: "group-hover:shadow-sky-500/25",
  },
  mouse: {
    gradient: "from-sky-600 via-blue-700 to-slate-900",
    accent: "text-sky-300",
    glow: "group-hover:shadow-sky-600/25",
  },
};

const FALLBACK_THEME = {
  gradient: "from-slate-500 via-slate-600 to-slate-800",
  accent: "text-slate-300",
  glow: "group-hover:shadow-slate-500/25",
};

function themeFor(categoryName: string) {
  return (
    CATEGORY_THEMES[categoryName.trim().toLocaleLowerCase("tr")] ?? FALLBACK_THEME
  );
}

function extractItems<T>(data: T[] | Page<T>): T[] {
  return Array.isArray(data) ? data : data.content;
}

function formatProductPrice(
  price: number,
  currency: string | null | undefined,
  lang: string,
): string {
  const safeCurrency = currency && currency.trim() ? currency.trim().toUpperCase() : "TRY";
  try {
    return new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: safeCurrency,
    }).format(price);
  } catch {
    return `${price} ${safeCurrency}`;
  }
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("tr");
}

function matchCategory(
  categories: Category[],
  term: string,
  t: TFunction,
): Category | undefined {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) {
    return undefined;
  }

  const aliasesFor = (category: Category) => [
    normalize(category.name),
    normalize(translateCategoryName(category.name, t)),
  ];

  return (
    categories.find((category) => aliasesFor(category).includes(normalizedTerm)) ??
    categories.find((category) =>
      aliasesFor(category).some((alias) => alias.includes(normalizedTerm)),
    )
  );
}

function buildProductsRequest(
  categories: Category[],
  term: string,
  selectedCategoryId: number | "",
  t: TFunction,
  page: number,
  size: number,
): { url: string; params: URLSearchParams } {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const category =
    selectedCategoryId === "" ? matchCategory(categories, term, t) : undefined;

  if (selectedCategoryId !== "") {
    return { url: `/products/category/${selectedCategoryId}`, params };
  }

  if (category) {
    return { url: `/products/category/${category.id}`, params };
  }

  if (term) {
    params.append("keyword", term);
    return { url: "/products/search", params };
  }

  return { url: "/products", params };
}

function Products() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchedCategory = useMemo(
    () => matchCategory(categories, searchTerm, t),
    [categories, searchTerm, t],
  );

  useEffect(() => {
    const controller = new AbortController();
    const req = buildProductsRequest(categories, searchTerm, categoryId, t, page, PAGE_SIZE);

    api
      .get<Product[] | Page<Product>>(req.url, {
        params: req.params,
        signal: controller.signal,
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setProducts(response.data);
          setTotalPages(1);
          setTotalElements(response.data.length);
        } else {
          setProducts(response.data.content ?? []);
          setTotalPages(response.data.totalPages ?? 1);
          setTotalElements(response.data.totalElements ?? response.data.content?.length ?? 0);
        }
        setError(null);
      })
      .catch((caught: unknown) => {
        if (axios.isCancel(caught)) {
          return;
        }
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
        setError(toApiError(caught, t("productsPage.loadError")).message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setSearching(false);
        }
      });

    return () => controller.abort();
  }, [categories, searchTerm, categoryId, page, t]);

  useEffect(() => {
    const controller = new AbortController();

    api
      .get<Category[] | Page<Category>>("/categories", {
        signal: controller.signal,
      })
      .then((response) => setCategories(extractItems(response.data)))
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearching(true);
    setCategoryId("");
    setPage(0);
    setSearchTerm(query.trim());
  }

  function handleCategorySelect(value: number | "") {
    setSearching(true);
    setQuery("");
    setSearchTerm("");
    setPage(0);
    setCategoryId(value);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Başlık */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {t("productsPage.title")}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">{t("productsPage.tagline")}</p>
        </div>

        {!loading && totalElements > 0 && (
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur">
            {t("productsPage.productCount", { count: totalElements })}
          </span>
        )}
      </div>

      {/* Arama ve kategori paneli */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("productsPage.searchPlaceholder")}
              aria-label={t("productsPage.searchPlaceholder")}
              className="w-full rounded-lg border border-white/10 bg-slate-950/50 py-2.5 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="shrink-0 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("productsPage.searchButton")}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => handleCategorySelect("")}
            aria-pressed={categoryId === ""}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              categoryId === ""
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {t("productsPage.allCategories")}
          </button>

          {categories.map((category) => {
            const isActive = categoryId === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                aria-pressed={isActive}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {translateCategoryName(category.name, t)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Durum mesajları */}
      <div className="mb-6 min-h-6">
        {searching && (
          <p role="status" className="text-sm text-slate-400">
            {t("productsPage.searching")}
          </p>
        )}
        {matchedCategory && !searching && (
          <p className="text-sm text-slate-300">
            {t("productsPage.categoryResults", {
              category: translateCategoryName(matchedCategory.name, t),
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

      {/* Ürün listesi */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl"
            >
              <div className="h-36 animate-pulse bg-white/5" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
                <div className="h-5 w-1/3 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <svg
              className="h-8 w-8 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </span>
          <p className="text-sm text-slate-400">{t("productsPage.noResults")}</p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const theme = themeFor(product.categoryName);
              const categoryLabel = translateCategoryName(product.categoryName, t);

              return (
                <li
                  key={product.id}
                  className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-blue-500/40 hover:shadow-2xl ${theme.glow}`}
                >
                  <div
                    className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${theme.gradient}`}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                        <span className="relative text-4xl font-black text-white/35 transition duration-300 group-hover:scale-110">
                          {categoryLabel.charAt(0).toLocaleUpperCase("tr")}
                        </span>
                      </>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-200 backdrop-blur">
                      {categoryLabel}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="text-sm font-semibold leading-snug text-slate-100 transition group-hover:text-blue-300">
                      {product.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                      {product.description}
                    </p>

                    <div className="mt-auto pt-3">
                      <p className={`text-lg font-bold ${theme.accent}`}>
                        {formatProductPrice(product.price, product.currency, i18n.language)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("productsPage.previousPage")}
              </button>
              <span className="text-sm font-medium text-slate-400">
                {t("productsPage.pageInfo", { current: page + 1, total: totalPages })}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("productsPage.nextPage")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;
