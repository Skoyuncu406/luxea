"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Heart,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n/config";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

type SortOption =
  | "recommended"
  | "newest"
  | "price-low"
  | "price-high";

type ProductsCatalogDictionary = {
  searchPlaceholder: string;
  filterCategories: string;
  allCategories: string;
  productsFound: string;
  noProducts: string;
  clearFilters: string;
  newLabel: string;
  viewProduct: string;

  sortBy: string;
  sortRecommended: string;
  sortNewest: string;
  sortPriceLow: string;
  sortPriceHigh: string;

  addToFavorites: string;
  removeFromFavorites: string;
};

type ProductsCatalogProps = {
  locale: Locale;
  products: Product[];
  categories: Category[];
  dictionary: ProductsCatalogDictionary;
};

const FAVORITES_STORAGE_KEY = "luxea-favorites";

export default function ProductsCatalog({
  locale,
  products,
  categories,
  dictionary,
}: ProductsCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>("all");

  const [sortOption, setSortOption] =
    useState<SortOption>("recommended");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedFavorites = window.localStorage.getItem(
        FAVORITES_STORAGE_KEY
      );

      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);

        if (Array.isArray(parsedFavorites)) {
          setFavoriteIds(parsedFavorites);
        }
      }
    } catch {
      setFavoriteIds([]);
    } finally {
      setFavoritesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!favoritesLoaded) {
      return;
    }

    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favoriteIds)
    );
  }, [favoriteIds, favoritesLoaded]);

  const visibleCategories = useMemo(() => {
    return categories
      .filter((category) => category.isActive)
      .sort((a, b) => a.order - b.order);
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLocaleLowerCase();

    const matchingProducts = products
      .filter((product) => product.isActive)
      .filter((product) => {
        const matchesCategory =
          selectedCategoryId === "all" ||
          product.categoryId === selectedCategoryId;

        const productName =
          product.name[locale].toLocaleLowerCase();

        const productDescription =
          product.shortDescription[locale].toLocaleLowerCase();

        const matchesSearch =
          normalizedQuery.length === 0 ||
          productName.includes(normalizedQuery) ||
          productDescription.includes(normalizedQuery);

        return matchesCategory && matchesSearch;
      });

    return [...matchingProducts].sort((a, b) => {
      switch (sortOption) {
        case "newest": {
          if (a.isNew !== b.isNew) {
            return Number(b.isNew) - Number(a.isNew);
          }

          return a.order - b.order;
        }

        case "price-low":
          return a.price - b.price;

        case "price-high":
          return b.price - a.price;

        case "recommended":
        default: {
          if (a.isFeatured !== b.isFeatured) {
            return Number(b.isFeatured) - Number(a.isFeatured);
          }

          return a.order - b.order;
        }
      }
    });
  }, [
    locale,
    products,
    searchQuery,
    selectedCategoryId,
    sortOption,
  ]);

  const selectedCategory =
    selectedCategoryId === "all"
      ? null
      : visibleCategories.find(
          (category) => category.id === selectedCategoryId
        );

  const sortOptions: Array<{
    value: SortOption;
    label: string;
  }> = [
    {
      value: "recommended",
      label: dictionary.sortRecommended,
    },
    {
      value: "newest",
      label: dictionary.sortNewest,
    },
    {
      value: "price-low",
      label: dictionary.sortPriceLow,
    },
    {
      value: "price-high",
      label: dictionary.sortPriceHigh,
    },
  ];

  const selectedSort =
    sortOptions.find((option) => option.value === sortOption) ??
    sortOptions[0];

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategoryId("all");
    setSortOption("recommended");
    setIsFilterOpen(false);
    setIsSortOpen(false);
  }

  function toggleFavorite(productId: string) {
    setFavoriteIds((currentFavorites) => {
      const isFavorite = currentFavorites.includes(productId);

      if (isFavorite) {
        return currentFavorites.filter(
          (favoriteId) => favoriteId !== productId
        );
      }

      return [...currentFavorites, productId];
    });
  }

  return (
    <div className="relative w-full">
      {/* Arama, kategori ve sıralama */}
      <div className="relative z-[90] border-y border-border py-5 sm:py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px_260px]">
          {/* Arama */}
          <div className="group relative min-w-0">
            <div className="pointer-events-none absolute inset-y-0 start-0 z-10 flex w-14 items-center justify-center text-muted transition-colors duration-300 group-focus-within:text-accent">
              <Search size={18} strokeWidth={1.4} />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder={dictionary.searchPlaceholder}
              aria-label={dictionary.searchPlaceholder}
              autoComplete="off"
              className={[
                "h-14 w-full border border-border bg-surface/60",
                "ps-14 pe-14 text-sm text-foreground",
                "outline-none transition-all duration-300",
                "placeholder:text-muted/80",
                "hover:border-border-strong",
                "focus:border-accent focus:bg-surface",
                "focus:shadow-[0_12px_40px_rgba(36,35,32,0.07)]",
                "sm:h-16 sm:text-[15px]",
              ].join(" ")}
            />

            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={dictionary.clearFilters}
                className="absolute inset-y-0 end-0 z-10 flex w-14 items-center justify-center text-muted transition-colors duration-300 hover:text-accent"
              >
                <X size={16} strokeWidth={1.4} />
              </button>
            )}

            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-accent transition-transform duration-300 group-focus-within:scale-x-100" />
          </div>

          {/* Kategori filtresi */}
          <div className="relative z-[100]">
            <button
              type="button"
              onClick={() => {
                setIsFilterOpen((current) => !current);
                setIsSortOpen(false);
              }}
              aria-expanded={isFilterOpen}
              className={[
                "flex h-14 w-full items-center justify-between gap-4 border px-5",
                "text-start transition-all duration-300 sm:h-16",
                isFilterOpen
                  ? "border-accent bg-surface text-accent"
                  : "border-border bg-surface/60 text-foreground hover:border-border-strong hover:bg-surface",
              ].join(" ")}
            >
              <span className="flex min-w-0 items-center gap-4">
                <SlidersHorizontal
                  size={17}
                  strokeWidth={1.4}
                  className="shrink-0"
                />

                <span className="min-w-0">
                  <span className="block text-[8px] font-semibold uppercase tracking-[0.2em] text-muted">
                    {dictionary.filterCategories}
                  </span>

                  <span className="mt-1 block truncate font-heading text-[20px] leading-none">
                    {selectedCategory
                      ? selectedCategory.name[locale]
                      : dictionary.allCategories}
                  </span>
                </span>
              </span>

              <ChevronDown
                size={15}
                strokeWidth={1.4}
                className={[
                  "shrink-0 transition-transform duration-300",
                  isFilterOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            <div
              className={[
                "absolute inset-x-0 top-[calc(100%+10px)] z-[120]",
                "max-h-[420px] overflow-y-auto border border-border",
                "bg-[#EEEAE3] p-2 shadow-[0_24px_65px_rgba(36,35,32,0.20)]",
                "backdrop-blur-2xl transition-all duration-300",
                isFilterOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible pointer-events-none -translate-y-2 opacity-0",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryId("all");
                  setIsFilterOpen(false);
                }}
                className={[
                  "flex w-full items-center justify-between gap-4 px-4 py-3.5 text-start",
                  "transition-colors duration-300 hover:bg-background/60 hover:text-accent",
                  selectedCategoryId === "all"
                    ? "text-accent"
                    : "text-foreground",
                ].join(" ")}
              >
                <span className="font-heading text-xl leading-none">
                  {dictionary.allCategories}
                </span>

                {selectedCategoryId === "all" && (
                  <Check size={14} strokeWidth={1.5} />
                )}
              </button>

              <div className="my-1 h-px bg-border" />

              {visibleCategories.map((category) => {
                const isSelected =
                  selectedCategoryId === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setIsFilterOpen(false);
                    }}
                    className={[
                      "flex w-full items-center justify-between gap-4 px-4 py-3.5 text-start",
                      "transition-colors duration-300 hover:bg-background/60 hover:text-accent",
                      isSelected
                        ? "text-accent"
                        : "text-foreground",
                    ].join(" ")}
                  >
                    <span className="font-heading text-xl leading-none">
                      {category.name[locale]}
                    </span>

                    {isSelected && (
                      <Check size={14} strokeWidth={1.5} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sıralama */}
          <div className="relative z-[100]">
            <button
              type="button"
              onClick={() => {
                setIsSortOpen((current) => !current);
                setIsFilterOpen(false);
              }}
              aria-expanded={isSortOpen}
              className={[
                "flex h-14 w-full items-center justify-between gap-4 border px-5",
                "text-start transition-all duration-300 sm:h-16",
                isSortOpen
                  ? "border-accent bg-surface text-accent"
                  : "border-border bg-surface/60 text-foreground hover:border-border-strong hover:bg-surface",
              ].join(" ")}
            >
              <span className="min-w-0">
                <span className="block text-[8px] font-semibold uppercase tracking-[0.2em] text-muted">
                  {dictionary.sortBy}
                </span>

                <span className="mt-1 block truncate font-heading text-[20px] leading-none text-foreground">
                  {selectedSort?.label || dictionary.sortRecommended}
                </span>
              </span>

              <ChevronDown
                size={15}
                strokeWidth={1.4}
                className={[
                  "shrink-0 transition-transform duration-300",
                  isSortOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            <div
              className={[
                "absolute inset-x-0 top-[calc(100%+10px)] z-[120]",
                "border border-border bg-[#EEEAE3] p-2",
                "shadow-[0_24px_65px_rgba(36,35,32,0.20)] backdrop-blur-2xl",
                "transition-all duration-300",
                isSortOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible pointer-events-none -translate-y-2 opacity-0",
              ].join(" ")}
            >
              {sortOptions.map((option) => {
                const isSelected =
                  option.value === sortOption;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortOption(option.value);
                      setIsSortOpen(false);
                    }}
                    className={[
                      "flex w-full items-center justify-between gap-4 px-4 py-3.5 text-start",
                      "text-[10px] font-semibold uppercase tracking-[0.12em]",
                      "transition-colors duration-300 hover:bg-background/60 hover:text-accent",
                      isSelected
                        ? "text-accent"
                        : "text-foreground",
                    ].join(" ")}
                  >
                    <span>{option.label}</span>

                    {isSelected && (
                      <Check size={14} strokeWidth={1.5} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sonuç sayısı */}
      <div className="relative z-0 flex min-h-[76px] flex-wrap items-center justify-between gap-4 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {filteredProducts.length}{" "}
          {dictionary.productsFound}
        </p>

        {(searchQuery ||
          selectedCategoryId !== "all" ||
          sortOption !== "recommended") && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors duration-300 hover:text-accent"
          >
            <X size={13} strokeWidth={1.4} />
            <span>{dictionary.clearFilters}</span>
          </button>
        )}
      </div>

      {/* Ürün listesi */}
      {filteredProducts.length > 0 ? (
        <div className="relative z-0 grid grid-cols-1 gap-x-6 gap-y-16 pt-10 sm:grid-cols-2 sm:pt-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-20 xl:grid-cols-4 xl:gap-x-9">
          {filteredProducts.map((product) => {
            const isFavorite = favoriteIds.includes(product.id);

            return (
              <article
                key={product.id}
                className="group relative z-0 min-w-0"
              >
                <div className="relative z-0 aspect-[4/5] overflow-hidden bg-surface">
                  <Link
                    href={`/${locale}/products/${product.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={product.name[locale]}
                  />

                  <Image
                    src={product.image}
                    alt={product.name[locale]}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className={[
                      "object-cover transition-all duration-700 ease-out",
                      product.hoverImage
                        ? "group-hover:scale-[1.025] group-hover:opacity-0"
                        : "group-hover:scale-[1.035]",
                    ].join(" ")}
                  />

                  {product.hoverImage && (
                    <Image
                      src={product.hoverImage}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.025] group-hover:opacity-100"
                    />
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#242320]/20 via-transparent to-transparent" />

                  {product.isNew && (
                    <span className="pointer-events-none absolute start-4 top-4 z-20 border border-white/45 bg-black/10 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      {dictionary.newLabel}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    aria-label={
                      isFavorite
                        ? dictionary.removeFromFavorites
                        : dictionary.addToFavorites
                    }
                    title={
                      isFavorite
                        ? dictionary.removeFromFavorites
                        : dictionary.addToFavorites
                    }
                    className={[
                      "absolute end-4 top-4 z-30 flex h-10 w-10 items-center justify-center",
                      "border border-white/45 bg-[#E5E0D7]/88 backdrop-blur-xl",
                      "transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white",
                      isFavorite
                        ? "border-accent bg-accent text-white"
                        : "text-foreground",
                    ].join(" ")}
                  >
                    <Heart
                      size={17}
                      strokeWidth={1.4}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>

                  <span className="pointer-events-none absolute inset-x-4 bottom-4 z-20 translate-y-3 border border-white/45 bg-[#E5E0D7]/92 px-4 py-3 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-foreground opacity-0 backdrop-blur-xl transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {dictionary.viewProduct}
                  </span>
                </div>

                <Link
                  href={`/${locale}/products/${product.slug}`}
                  className="block"
                >
                  <div className="border-b border-border pb-6 pt-5">
                    <div className="flex items-start justify-between gap-5">
                      <h2 className="min-w-0 font-heading text-[27px] leading-[1.02] text-foreground transition-colors duration-300 group-hover:text-accent lg:text-[29px]">
                        {product.name[locale]}
                      </h2>

                      <p className="shrink-0 pt-1 text-[11px] font-semibold tracking-[0.07em] text-foreground">
                        {formatPrice(
                          product.price,
                          product.currency,
                          locale
                        )}
                      </p>
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-6 text-foreground-soft">
                      {product.shortDescription[locale]}
                    </p>

                    <div className="mt-5 flex items-center gap-2.5">
                      {product.colors.map((color) => (
                        <span
                          key={color}
                          aria-hidden="true"
                          className="h-3.5 w-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="relative z-0 flex min-h-[380px] flex-col items-center justify-center border-b border-border px-5 text-center">
          <p className="max-w-xl font-heading text-4xl leading-tight text-foreground sm:text-5xl">
            {dictionary.noProducts}
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-8 inline-flex min-h-12 items-center justify-center border border-[#242320] bg-transparent px-7 text-[10px] font-semibold uppercase tracking-[0.16em] !text-[#242320] transition-all duration-300 hover:bg-[#242320] hover:!text-[#F3F0EA]"
          >
            {dictionary.clearFilters}
          </button>
        </div>
      )}
    </div>
  );
}