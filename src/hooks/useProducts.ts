import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import api, { toApiError } from "../api/axiosInstance";
import type { Category, Page, Product } from "../types/api";
import {
  PAGE_SIZE,
  DEFAULT_CURRENCY,
  extractItems,
  parseCategoryIdsFromUrl,
  parsePriceRangeFromUrl,
  buildProductsRequest,
  matchCategory,
} from "../utils/productFilters";

export function useProducts() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(() => searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("max") ?? "");
  const [priceValidationError, setPriceValidationError] = useState<string | null>(null);

  // Single Source of Truth: URL parametrelerinden türetilen durumlar
  const selectedCategoryIds = useMemo(
    () => parseCategoryIdsFromUrl(searchParams),
    [searchParams],
  );

  const priceRange = useMemo(
    () => parsePriceRangeFromUrl(searchParams),
    [searchParams],
  );

  const selectedCategories = useMemo(
    () => categories.filter((c) => selectedCategoryIds.includes(c.id)),
    [categories, selectedCategoryIds],
  );

  const matchedCategory = useMemo(
    () => matchCategory(categories, searchTerm, t),
    [categories, searchTerm, t],
  );

  const activeCategories = useMemo(() => {
    if (selectedCategories.length > 0) return selectedCategories;
    if (matchedCategory) return [matchedCategory];
    return [];
  }, [selectedCategories, matchedCategory]);

  const activeCurrency = useMemo(
    () => products[0]?.currency ?? DEFAULT_CURRENCY,
    [products],
  );

  // URL'deki min/max değişimlerini form input'larına senkronize et
  useEffect(() => {
    setMinPrice(searchParams.get("min") ?? "");
    setMaxPrice(searchParams.get("max") ?? "");
  }, [searchParams]);

  // Ürün verilerini API'den çekme
  useEffect(() => {
    const controller = new AbortController();
    const req = buildProductsRequest(
      categories,
      searchTerm,
      selectedCategoryIds,
      t,
      page,
      PAGE_SIZE,
      priceRange,
    );

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
        if (axios.isCancel(caught)) return;
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
  }, [categories, searchTerm, selectedCategoryIds, page, priceRange, t]);

  // Kategorileri API'den çekme (sadece ilk yüklemede)
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
    setPriceValidationError(null);
    setPage(0);
    setSearchParams({}, { replace: true });
    setSearchTerm(query.trim());
  }

  function handleToggleCategory(id: number) {
    setSearching(true);
    setQuery("");
    setSearchTerm("");
    setPriceValidationError(null);
    setPage(0);

    const next = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((item) => item !== id)
      : [...selectedCategoryIds, id];

    const nextParams = new URLSearchParams(searchParams);
    if (next.length > 0) {
      nextParams.set("categories", next.join(","));
    } else {
      nextParams.delete("categories");
      nextParams.delete("category");
      nextParams.delete("categoryId");
    }
    setSearchParams(nextParams, { replace: true });
  }

  function handleClearCategories() {
    setSearching(true);
    setQuery("");
    setSearchTerm("");
    setPriceValidationError(null);
    setPage(0);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("categories");
    nextParams.delete("category");
    nextParams.delete("categoryId");
    setSearchParams(nextParams, { replace: true });
  }

  function handleClearAllFilters() {
    setSearching(true);
    setQuery("");
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setPriceValidationError(null);
    setPage(0);
    setSearchParams({}, { replace: true });
  }

  function handleApplyPriceFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPriceValidationError(null);

    const minTrimmed = minPrice.trim();
    const maxTrimmed = maxPrice.trim();

    const minNum = minTrimmed !== "" ? Number(minTrimmed) : null;
    const maxNum = maxTrimmed !== "" ? Number(maxTrimmed) : null;

    if (minNum !== null && (isNaN(minNum) || minNum < 0)) {
      setPriceValidationError(t("productsPage.priceInvalid"));
      return;
    }
    if (maxNum !== null && (isNaN(maxNum) || maxNum < 0)) {
      setPriceValidationError(t("productsPage.priceInvalid"));
      return;
    }
    if (minNum !== null && maxNum !== null && minNum > maxNum) {
      setPriceValidationError(t("productsPage.priceMinGreaterThanMax"));
      return;
    }

    if (minTrimmed === "" && maxTrimmed === "") {
      handleClearPriceFilter();
      return;
    }

    setSearching(true);
    setSearchTerm("");
    setQuery("");
    setPage(0);

    const nextParams = new URLSearchParams(searchParams);
    if (selectedCategoryIds.length > 0) {
      nextParams.set("categories", selectedCategoryIds.join(","));
    }
    if (minTrimmed !== "") {
      nextParams.set("min", minTrimmed);
    } else {
      nextParams.delete("min");
    }
    if (maxTrimmed !== "") {
      nextParams.set("max", maxTrimmed);
    } else {
      nextParams.delete("max");
    }
    setSearchParams(nextParams, { replace: true });
  }

  function handleClearPriceFilter() {
    setMinPrice("");
    setMaxPrice("");
    setPriceValidationError(null);
    setPage(0);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("min");
    nextParams.delete("max");
    setSearchParams(nextParams, { replace: true });
  }

  return {
    t,
    i18n,
    products,
    categories,
    query,
    setQuery,
    page,
    setPage,
    totalPages,
    totalElements,
    loading,
    searching,
    error,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    minPrice,
    maxPrice,
    priceValidationError,
    selectedCategoryIds,
    priceRange,
    selectedCategories,
    activeCategories,
    activeCurrency,
    setMinPrice,
    setMaxPrice,
    handleSubmit,
    handleToggleCategory,
    handleClearCategories,
    handleClearAllFilters,
    handleApplyPriceFilter,
    handleClearPriceFilter,
  };
}
