import type { TFunction } from "i18next";
import type { Category, Page } from "../types/api";
import { translateCategoryName } from "./categoryLabel";

export const PAGE_SIZE = 12;
export const DEFAULT_CURRENCY = "TRY";

export function extractItems<T>(data: T[] | Page<T>): T[] {
  return Array.isArray(data) ? data : data.content;
}

export function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("tr");
}

export function matchCategory(
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

export function parseCategoryIdsFromUrl(searchParams: URLSearchParams): number[] {
  const categoriesParam = searchParams.get("categories");
  if (categoriesParam) {
    return categoriesParam
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);
  }
  const allCategoryParams = searchParams.getAll("category");
  if (allCategoryParams.length > 0) {
    return allCategoryParams
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);
  }
  const single = searchParams.get("categoryId");
  if (single) {
    const num = Number(single.trim());
    if (!isNaN(num) && num > 0) return [num];
  }
  return [];
}

export function parsePriceRangeFromUrl(
  searchParams: URLSearchParams,
): { min: number; max: number } | null {
  const rawMin = searchParams.get("min");
  const rawMax = searchParams.get("max");

  const parsedMin = rawMin !== null && rawMin.trim() !== "" ? Number(rawMin) : null;
  const parsedMax = rawMax !== null && rawMax.trim() !== "" ? Number(rawMax) : null;

  const validMin = parsedMin !== null && !isNaN(parsedMin) && parsedMin >= 0 ? parsedMin : null;
  const validMax = parsedMax !== null && !isNaN(parsedMax) && parsedMax >= 0 ? parsedMax : null;

  if (validMin === null && validMax === null) {
    return null;
  }

  return {
    min: validMin ?? 0,
    max: validMax ?? Number.MAX_SAFE_INTEGER,
  };
}

export function buildProductsRequest(
  categories: Category[],
  term: string,
  selectedCategoryIds: number[],
  t: TFunction,
  page: number,
  size: number,
  priceRange?: { min: number; max: number } | null,
): { url: string; params: URLSearchParams } {
  const params = new URLSearchParams({ page: String(page), size: String(size) });

  const matchedCat =
    selectedCategoryIds.length === 0 ? matchCategory(categories, term, t) : undefined;
  const targetCategoryIds =
    selectedCategoryIds.length > 0
      ? selectedCategoryIds
      : matchedCat
        ? [matchedCat.id]
        : [];

  if (priceRange) {
    params.append("minPrice", String(priceRange.min));
    params.append("maxPrice", String(priceRange.max));
    targetCategoryIds.forEach((id) => params.append("categoryIds", String(id)));
    return { url: "/products/price", params };
  }

  if (targetCategoryIds.length > 0) {
    targetCategoryIds.forEach((id) => params.append("categoryIds", String(id)));
    return { url: "/products", params };
  }

  if (term) {
    params.append("keyword", term);
    return { url: "/products/search", params };
  }

  return { url: "/products", params };
}
