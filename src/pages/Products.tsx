import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import api, { toApiError } from "../api/axiosInstance";
import { translateCategoryName } from "../utils/categoryLabel";
import type { Category, Page, Product } from "../types/api";

const PAGE_SIZE = 50;
const CATEGORY_PAGE_SIZE = 100;

const CATEGORY_THEMES: Record<string, { gradient: string; accent: string; glow: string }> = {
  bilgisayar: {
    gradient: "from-blue-500 via-blue-600 to-sky-700",
    accent: "text-blue-600",
    glow: "group-hover:shadow-blue-500/25",
  },
  telefon: {
    gradient: "from-sky-500 via-cyan-600 to-blue-700",
    accent: "text-cyan-600",
    glow: "group-hover:shadow-cyan-500/25",
  },
  kulaklık: {
    gradient: "from-indigo-500 via-blue-600 to-sky-700",
    accent: "text-indigo-600",
    glow: "group-hover:shadow-indigo-500/25",
  },
  klavye: {
    gradient: "from-blue-400 via-sky-500 to-cyan-600",
    accent: "text-sky-600",
    glow: "group-hover:shadow-sky-500/25",
  },
  mouse: {
    gradient: "from-sky-600 via-blue-700 to-slate-900",
    accent: "text-blue-700",
    glow: "group-hover:shadow-sky-600/25",
  },
};

const FALLBACK_THEME = {
  gradient: "from-slate-500 via-slate-600 to-slate-800",
  accent: "text-slate-700",
  glow: "group-hover:shadow-slate-500/25",
};

function themeFor(categoryName: string) {
  return (
    CATEGORY_THEMES[categoryName.trim().toLocaleLowerCase("tr")] ?? FALLBACK_THEME
  );
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("tr");
}

function extractItems<T>(data: T[] | Page<T>): T[] {
  return Array.isArray(data) ? data : data.content;
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
): { url: string; params: URLSearchParams } {
  const params = new URLSearchParams({ page: "0", size: String(PAGE_SIZE) });
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
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchedCategory = useMemo(
    () => matchCategory(categories, searchTerm, t),
    [categories, searchTerm, t],
  );

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === "tr" ? "tr-TR" : "en-US", {
        style: "currency",
        currency: "TRY",
      }),
    [i18n.language],
  );

  const request = useMemo(
    () => buildProductsRequest(categories, searchTerm, categoryId, t),
    [categories, searchTerm, categoryId, t],
  );

  useEffect(() => {
    const controller = new AbortController();

    api
      .get<Product[] | Page<Product>>(request.url, {
        params: request.params,
        signal: controller.signal,
      })
      .then((response) => {
        setProducts(extractItems(response.data));
        setError(null);
      })
      .catch((caught: unknown) => {
        if (axios.isCancel(caught)) {
          return;
        }
        setProducts([]);
        setError(toApiError(caught, t("productsPage.loadError")).message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setSearching(false);
        }
      });

    return () => controller.abort();
  }, [request, t]);

  useEffect(() => {
    const controller = new AbortController();

    api
      .get<Category[] | Page<Category>>("/categories", {
        params: { page: 0, size: CATEGORY_PAGE_SIZE },
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
    setSearchTerm(query.trim());
  }

  function handleCategorySelect(value: number | "") {
    setSearching(true);
    setQuery("");
    setSearchTerm("");
    setCategoryId(value);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Arka plan - login ile aynı dil */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(37,99,235,0.18),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-aurora absolute left-[4%] top-[6%] h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-blue-400/60 via-sky-300/45 to-transparent blur-3xl" />
        <div
          className="animate-aurora absolute right-[6%] top-[28%] h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-indigo-400/55 via-sky-300/45 to-transparent blur-3xl"
          style={{ animationDelay: "-8s", animationDuration: "25s" }}
        />
        <div
          className="animate-aurora absolute bottom-[4%] left-[28%] h-[26rem] w-[26rem] rounded-full bg-gradient-to-t from-sky-400/50 via-blue-300/40 to-transparent blur-3xl"
          style={{ animationDelay: "-14s", animationDuration: "29s" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-float-slow absolute left-[12%] top-[22%] h-64 w-64 rounded-full bg-blue-300/45 blur-3xl" />
        <div className="animate-float-slower absolute right-[14%] bottom-[16%] h-72 w-72 rounded-full bg-sky-300/45 blur-3xl" />
      </div>
      <div className="animate-drift pointer-events-none absolute inset-x-0 top-0 h-[130%] opacity-40" aria-hidden="true">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.20) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.20) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10">
        {/* Başlık */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {t("productsPage.title")}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">{t("productsPage.tagline")}</p>
          </div>

          {!loading && products.length > 0 && (
            <span className="rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur">
              {t("productsPage.productCount", { count: products.length })}
            </span>
          )}
        </div>

        {/* Arama ve kategori paneli */}
        <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                className="w-full rounded-lg border border-slate-300 bg-white/90 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200/60 pt-4">
            <button
              type="button"
              onClick={() => handleCategorySelect("")}
              aria-pressed={categoryId === ""}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                categoryId === ""
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
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
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
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
            <p role="status" className="text-sm text-slate-500">
              {t("productsPage.searching")}
            </p>
          )}
          {matchedCategory && !searching && (
            <p className="text-sm text-slate-600">
              {t("productsPage.categoryResults", {
                category: translateCategoryName(matchedCategory.name, t),
              })}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 backdrop-blur"
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
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-xl"
              >
                <div className="h-36 animate-pulse bg-slate-200/60" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200/60" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200/60" />
                  <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200/60" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl">
              <svg
                className="h-8 w-8 text-slate-400"
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
            <p className="text-sm text-slate-500">{t("productsPage.noResults")}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const theme = themeFor(product.categoryName);
              const categoryLabel = translateCategoryName(product.categoryName, t);

              return (
                <li
                  key={product.id}
                  className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-lg shadow-blue-900/5 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-2xl ${theme.glow}`}
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

                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 backdrop-blur">
                      {categoryLabel}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="text-sm font-semibold leading-snug text-slate-900 transition group-hover:text-blue-700">
                      {product.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {product.description}
                    </p>

                    <div className="mt-auto pt-3">
                      <p className={`text-lg font-bold ${theme.accent}`}>
                        {formatter.format(product.price)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Products;