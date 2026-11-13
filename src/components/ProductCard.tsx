import type { TFunction } from "i18next";
import type { Product } from "../types/api";
import { translateCategoryName } from "../utils/categoryLabel";
import { DEFAULT_CURRENCY } from "../utils/productFilters";

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

export function themeFor(categoryName: string) {
  return (
    CATEGORY_THEMES[categoryName.trim().toLocaleLowerCase("tr")] ?? FALLBACK_THEME
  );
}

export function formatProductPrice(
  price: number,
  currency: string | null | undefined,
  lang: string,
) {
  const resolvedCurrency = currency ?? DEFAULT_CURRENCY;
  return new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: resolvedCurrency,
    maximumFractionDigits: 2,
  }).format(price);
}

interface ProductCardProps {
  product: Product;
  t: TFunction;
  language: string;
}

export default function ProductCard({ product, t, language }: ProductCardProps) {
  const theme = themeFor(product.categoryName);
  const categoryLabel = translateCategoryName(product.categoryName, t);

  return (
    <li
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
            {formatProductPrice(product.price, product.currency, language)}
          </p>
        </div>
      </div>
    </li>
  );
}
