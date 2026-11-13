import CategorySidebar from "../components/CategorySidebar";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import MobileFilterDrawer from "../components/MobileFilterDrawer";
import ActiveFilterBadges from "../components/ActiveFilterBadges";
import ProductStatusMessage from "../components/ProductStatusMessage";
import { useProducts } from "../hooks/useProducts";

function Products() {
  const {
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
  } = useProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Başlık ve Toplam Ürün Sayacı */}
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

      {/* Arama Çubuğu & Mobil Filtre Açma Butonu */}
      <div className="mb-8 flex items-center gap-3">
        <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-3">
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
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none backdrop-blur-xl transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("productsPage.searchButton")}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:bg-white/10 lg:hidden"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>{t("productsPage.filterToggleMobile")}</span>
          {(selectedCategoryIds.length > 0 || priceRange) && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {selectedCategoryIds.length + (priceRange ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Ana Gövde: Sol Sidebar + Sağ Ürün Listesi */}
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        {/* Masaüstü Sol Sidebar */}
        <div className="hidden lg:sticky lg:top-24 lg:block lg:w-64 xl:w-72 lg:shrink-0">
          <CategorySidebar
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={handleToggleCategory}
            onClearCategories={handleClearCategories}
            t={t}
            minPrice={minPrice}
            maxPrice={maxPrice}
            priceValidationError={priceValidationError}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onApplyPriceFilter={handleApplyPriceFilter}
            onClearPriceFilter={handleClearPriceFilter}
            isPriceFilterActive={Boolean(priceRange || minPrice || maxPrice)}
            searching={searching}
          />
        </div>

        {/* Mobil Filtre Çekmecesi (Drawer) */}
        <MobileFilterDrawer
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          title={t("productsPage.filtersTitle")}
        >
          <CategorySidebar
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={handleToggleCategory}
            onClearCategories={handleClearCategories}
            t={t}
            minPrice={minPrice}
            maxPrice={maxPrice}
            priceValidationError={priceValidationError}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onApplyPriceFilter={(e) => {
              handleApplyPriceFilter(e);
              setMobileFiltersOpen(false);
            }}
            onClearPriceFilter={handleClearPriceFilter}
            isPriceFilterActive={Boolean(priceRange || minPrice || maxPrice)}
            searching={searching}
          />
        </MobileFilterDrawer>

        {/* Sağ Ana Bölüm */}
        <div className="w-full flex-1 min-w-0">
          {/* Aktif Filtre Rozetleri (Badges) */}
          <ActiveFilterBadges
            selectedCategories={selectedCategories}
            priceRange={priceRange}
            currency={activeCurrency}
            language={i18n.language}
            t={t}
            onRemoveCategory={handleToggleCategory}
            onClearPrice={handleClearPriceFilter}
            onClearAll={handleClearAllFilters}
          />

          {/* Durum & Hata Mesajları */}
          <ProductStatusMessage
            searching={searching}
            activeCategories={activeCategories}
            priceRange={priceRange}
            currency={activeCurrency}
            language={i18n.language}
            error={error}
            t={t}
          />

          {/* Ürün Listesi Grid & Yükleme / Boş Durumları */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    t={t}
                    language={i18n.language}
                  />
                ))}
              </ul>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                loading={loading}
                onPageChange={setPage}
                t={t}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
