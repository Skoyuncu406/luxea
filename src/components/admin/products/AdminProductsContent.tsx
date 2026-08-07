"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Check,
  ChevronDown,
  Edit3,
  Heart,
  PackagePlus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { useCategories } from "@/contexts/CategoryContext";
import { useProducts } from "@/contexts/ProductContext";

import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types/product";

type ProductStatusFilter =
  | "all"
  | "active"
  | "inactive";

type AdminProductsDictionary = {
  addProduct: string;
  searchPlaceholder: string;

  allCategories: string;
  allStatuses: string;
  activeProducts: string;
  inactiveProducts: string;

  productsFound: string;
  clearFilters: string;

  product: string;
  category: string;
  price: string;
  stock: string;
  order: string;
  status: string;
  actions: string;

  active: string;
  inactive: string;
  featured: string;
  newProduct: string;

  edit: string;
  delete: string;

  noProducts: string;
  noProductsDescription: string;

  deleteTitle: string;
  deleteDescription: string;
  cancel: string;
  confirmDelete: string;

  loading: string;
};

type AdminProductsContentProps = {
  locale: Locale;
  dictionary: AdminProductsDictionary;
};

export default function AdminProductsContent({
  locale,
  dictionary,
}: AdminProductsContentProps) {
  const {
    products,
    isLoaded: productsLoaded,
    deleteProduct,
    toggleProductActive,
    toggleProductFeatured,
    toggleProductNew,
  } = useProducts();

  const {
    categories,
    isLoaded: categoriesLoaded,
  } = useCategories();

  const isLoaded =
    productsLoaded &&
    categoriesLoaded;

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<ProductStatusFilter>(
      "all"
    );

  const [
    productToDelete,
    setProductToDelete,
  ] =
    useState<Product | null>(
      null
    );

  /*
   * =========================================================
   * KATEGORİLER
   *
   * Artık statik @/data/categories
   * kullanılmıyor.
   *
   * Adminin oluşturduğu güncel kategoriler
   * CategoryContext üzerinden geliyor.
   * =========================================================
   */

  const visibleCategories =
    useMemo(() => {
      return [...categories].sort(
        (a, b) =>
          a.order - b.order
      );
    }, [categories]);

  /*
   * =========================================================
   * ÜRÜN FİLTRELEME
   * =========================================================
   */

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLocaleLowerCase(
            locale
          );

      return [...products]
        .filter(
          (product) => {
            const productName =
              product.name[
                locale
              ].toLocaleLowerCase(
                locale
              );

            const productSlug =
              product.slug.toLocaleLowerCase(
                locale
              );

            const matchesSearch =
              !normalizedSearch ||
              productName.includes(
                normalizedSearch
              ) ||
              productSlug.includes(
                normalizedSearch
              );

            const matchesCategory =
              selectedCategoryId ===
                "all" ||
              product.categoryId ===
                selectedCategoryId;

            const matchesStatus =
              statusFilter ===
                "all" ||
              (statusFilter ===
                "active" &&
                product.isActive) ||
              (statusFilter ===
                "inactive" &&
                !product.isActive);

            return (
              matchesSearch &&
              matchesCategory &&
              matchesStatus
            );
          }
        )
        .sort(
          (a, b) =>
            a.order - b.order
        );
    }, [
      locale,
      products,
      searchQuery,
      selectedCategoryId,
      statusFilter,
    ]);

  const hasActiveFilters =
    searchQuery.trim().length >
      0 ||
    selectedCategoryId !==
      "all" ||
    statusFilter !== "all";

  /*
   * =========================================================
   * KATEGORİ ADI
   * =========================================================
   */

  function getCategoryName(
    categoryId: string
  ) {
    return (
      categories.find(
        (category) =>
          category.id ===
          categoryId
      )?.name[locale] ??
      categoryId
    );
  }

  /*
   * =========================================================
   * FİLTRE TEMİZLE
   * =========================================================
   */

  function clearFilters() {
    setSearchQuery("");

    setSelectedCategoryId(
      "all"
    );

    setStatusFilter(
      "all"
    );
  }

  /*
   * =========================================================
   * ÜRÜN SİL
   * =========================================================
   */

  function confirmDelete() {
    if (!productToDelete) {
      return;
    }

    deleteProduct(
      productToDelete.id
    );

    setProductToDelete(
      null
    );
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (!isLoaded) {
    return (
      <div className="flex min-h-[420px] w-full items-center justify-center border-y border-border px-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          {
            dictionary.loading
          }
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-w-0">
        {/* ===================================================
            ÜST AKSİYON
        =================================================== */}
        <div className="flex w-full justify-end">
          <Link
            href={`/${locale}/admin/products/new`}
            className={[
              "group inline-flex min-h-14",
              "items-center justify-center gap-3",
              "border border-foreground",
              "bg-foreground px-7",
              "text-[9px] font-semibold uppercase",
              "tracking-[0.16em]",
              "!text-[#F3F0EA]",
              "transition-all duration-300",
              "hover:border-accent",
              "hover:bg-accent",
              "hover:!text-white",
            ].join(" ")}
          >
            <PackagePlus
              size={16}
              strokeWidth={1.4}
            />

            <span>
              {
                dictionary.addProduct
              }
            </span>
          </Link>
        </div>

        {/* ===================================================
            ARAMA + FİLTRELER
        =================================================== */}
        <section className="relative z-20 mt-6 w-full border-y border-border py-5">
          <div className="grid w-full min-w-0 gap-4 xl:grid-cols-[minmax(260px,1fr)_240px_220px]">
            <SearchInput
              value={
                searchQuery
              }
              placeholder={
                dictionary.searchPlaceholder
              }
              clearLabel={
                dictionary.clearFilters
              }
              onChange={
                setSearchQuery
              }
            />

            <FilterSelect
              value={
                selectedCategoryId
              }
              ariaLabel={
                dictionary.category
              }
              onChange={
                setSelectedCategoryId
              }
            >
              <option value="all">
                {
                  dictionary.allCategories
                }
              </option>

              {visibleCategories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name[
                        locale
                      ]
                    }
                  </option>
                )
              )}
            </FilterSelect>

            <FilterSelect
              value={
                statusFilter
              }
              ariaLabel={
                dictionary.status
              }
              onChange={(
                value
              ) =>
                setStatusFilter(
                  value as ProductStatusFilter
                )
              }
            >
              <option value="all">
                {
                  dictionary.allStatuses
                }
              </option>

              <option value="active">
                {
                  dictionary.activeProducts
                }
              </option>

              <option value="inactive">
                {
                  dictionary.inactiveProducts
                }
              </option>
            </FilterSelect>
          </div>
        </section>

        {/* ===================================================
            SONUÇ
        =================================================== */}
        <div className="flex min-h-[76px] w-full flex-wrap items-center justify-between gap-4 border-b border-border">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
            {
              filteredProducts.length
            }{" "}
            {
              dictionary.productsFound
            }
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors duration-300 hover:text-accent"
            >
              <X
                size={13}
                strokeWidth={
                  1.4
                }
              />

              <span>
                {
                  dictionary.clearFilters
                }
              </span>
            </button>
          )}
        </div>

        {/* ===================================================
            ÜRÜNLER
        =================================================== */}
        {filteredProducts.length >
        0 ? (
          <>
            {/* ===============================================
                MASAÜSTÜ
            =============================================== */}
            <div className="hidden w-full min-w-0 xl:block">
              <div
                className={[
                  "grid min-h-16 w-full",
                  "grid-cols-[76px_minmax(220px,1.3fr)_110px_90px_68px_minmax(220px,250px)]",
                  "items-center gap-4",
                  "border-b border-border",
                  "px-3",
                  "text-[8px] font-semibold",
                  "uppercase tracking-[0.16em]",
                  "text-muted",
                ].join(" ")}
              >
                <span />

                <span>
                  {
                    dictionary.product
                  }
                </span>

                <span>
                  {
                    dictionary.category
                  }
                </span>

                <span>
                  {
                    dictionary.price
                  }
                </span>

                <span>
                  {
                    dictionary.stock
                  }
                </span>

                <span className="text-end">
                  {
                    dictionary.actions
                  }
                </span>
              </div>

              <div className="divide-y divide-border border-b border-border">
                {filteredProducts.map(
                  (product) => (
                    <DesktopProductRow
                      key={
                        product.id
                      }
                      locale={
                        locale
                      }
                      product={
                        product
                      }
                      dictionary={
                        dictionary
                      }
                      categoryName={getCategoryName(
                        product.categoryId
                      )}
                      onToggleActive={() =>
                        toggleProductActive(
                          product.id
                        )
                      }
                      onToggleFeatured={() =>
                        toggleProductFeatured(
                          product.id
                        )
                      }
                      onToggleNew={() =>
                        toggleProductNew(
                          product.id
                        )
                      }
                      onDelete={() =>
                        setProductToDelete(
                          product
                        )
                      }
                    />
                  )
                )}
              </div>
            </div>

            {/* ===============================================
                MOBİL + TABLET
            =============================================== */}
            <div className="grid w-full gap-5 pt-6 xl:hidden">
              {filteredProducts.map(
                (product) => (
                  <MobileProductCard
                    key={
                      product.id
                    }
                    locale={
                      locale
                    }
                    product={
                      product
                    }
                    dictionary={
                      dictionary
                    }
                    categoryName={getCategoryName(
                      product.categoryId
                    )}
                    onToggleActive={() =>
                      toggleProductActive(
                        product.id
                      )
                    }
                    onToggleFeatured={() =>
                      toggleProductFeatured(
                        product.id
                      )
                    }
                    onToggleNew={() =>
                      toggleProductNew(
                        product.id
                      )
                    }
                    onDelete={() =>
                      setProductToDelete(
                        product
                      )
                    }
                  />
                )
              )}
            </div>
          </>
        ) : (
          <ProductsEmptyState
            dictionary={
              dictionary
            }
            showClearButton={
              hasActiveFilters
            }
            onClear={
              clearFilters
            }
          />
        )}
      </div>

      {/* =====================================================
          SİLME MODALI
      ===================================================== */}
      {productToDelete && (
        <DeleteProductModal
          product={
            productToDelete
          }
          locale={
            locale
          }
          dictionary={
            dictionary
          }
          onCancel={() =>
            setProductToDelete(
              null
            )
          }
          onConfirm={
            confirmDelete
          }
        />
      )}
    </>
  );
}

/*
 * =============================================================
 * PRODUCT ITEM PROPS
 * =============================================================
 */

type ProductItemProps = {
  locale: Locale;

  product: Product;

  dictionary:
    AdminProductsDictionary;

  categoryName: string;

  onToggleActive:
    () => void;

  onToggleFeatured:
    () => void;

  onToggleNew:
    () => void;

  onDelete:
    () => void;
};

/*
 * =============================================================
 * DESKTOP PRODUCT ROW
 * =============================================================
 */

function DesktopProductRow({
  locale,
  product,
  dictionary,
  categoryName,
  onToggleActive,
  onToggleFeatured,
  onToggleNew,
  onDelete,
}: ProductItemProps) {
  return (
    <article
      className={[
        "grid min-h-[142px] w-full",

        "grid-cols-[76px_minmax(220px,1.3fr)_110px_90px_68px_minmax(220px,250px)]",

        "items-center gap-4",

        "px-3 py-5",

        "transition-colors duration-300",

        "hover:bg-surface/35",
      ].join(" ")}
    >
      {/* Görsel */}
      <div className="relative h-[100px] w-[76px] overflow-hidden bg-surface">
        <Image
          src={
            product.image
          }
          alt={
            product.name[
              locale
            ]
          }
          fill
          sizes="76px"
          className="object-cover object-center"
        />
      </div>

      {/* Kimlik */}
      <ProductIdentity
        product={
          product
        }
        locale={
          locale
        }
        dictionary={
          dictionary
        }
      />

      {/* Kategori */}
      <p className="min-w-0 break-words font-heading text-lg leading-tight text-foreground">
        {categoryName}
      </p>

      {/* Fiyat */}
      <p className="whitespace-nowrap font-heading text-xl leading-none text-foreground">
        {formatPrice(
          product.price,
          product.currency,
          locale
        )}
      </p>

      {/* Stok */}
      <div>
        <p className="font-heading text-xl leading-none text-foreground">
          {
            product.stock
          }
        </p>

        <p className="mt-2 whitespace-nowrap text-[6px] font-semibold uppercase tracking-[0.08em] text-muted">
          {
            dictionary.order
          }
          :{" "}
          {
            product.order
          }
        </p>
      </div>

      {/* Aksiyon */}
      <DesktopProductActions
        locale={
          locale
        }
        product={
          product
        }
        dictionary={
          dictionary
        }
        onToggleActive={
          onToggleActive
        }
        onToggleFeatured={
          onToggleFeatured
        }
        onToggleNew={
          onToggleNew
        }
        onDelete={
          onDelete
        }
      />
    </article>
  );
}

/*
 * =============================================================
 * DESKTOP PRODUCT ACTIONS
 * =============================================================
 */

function DesktopProductActions({
  locale,
  product,
  dictionary,
  onToggleActive,
  onToggleFeatured,
  onToggleNew,
  onDelete,
}: Omit<
  ProductItemProps,
  "categoryName"
>) {
  return (
    <div className="flex min-w-0 flex-col items-end gap-2">
      <div className="flex w-full justify-end gap-2">
        <CompactToggleButton
          active={
            product.isActive
          }
          label={
            product.isActive
              ? dictionary.active
              : dictionary.inactive
          }
          onClick={
            onToggleActive
          }
        />

        <CompactToggleButton
          active={
            product.isFeatured
          }
          label={
            dictionary.featured
          }
          onClick={
            onToggleFeatured
          }
        />
      </div>

      <div className="flex w-full justify-end gap-2">
        <CompactToggleButton
          active={
            product.isNew
          }
          label={
            dictionary.newProduct
          }
          onClick={
            onToggleNew
          }
        />

        <Link
          href={`/${locale}/admin/products/${product.id}/edit`}
          aria-label={`${dictionary.edit}: ${product.name[locale]}`}
          title={
            dictionary.edit
          }
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-border text-foreground transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
        >
          <Edit3
            size={14}
            strokeWidth={
              1.4
            }
          />
        </Link>

        <button
          type="button"
          onClick={
            onDelete
          }
          aria-label={`${dictionary.delete}: ${product.name[locale]}`}
          title={
            dictionary.delete
          }
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-border text-foreground transition-all duration-300 hover:border-danger hover:bg-danger hover:text-white"
        >
          <Trash2
            size={14}
            strokeWidth={
              1.4
            }
          />
        </button>
      </div>
    </div>
  );
}

/*
 * =============================================================
 * MOBILE PRODUCT CARD
 * =============================================================
 */

function MobileProductCard({
  locale,
  product,
  dictionary,
  categoryName,
  onToggleActive,
  onToggleFeatured,
  onToggleNew,
  onDelete,
}: ProductItemProps) {
  return (
    <article className="w-full min-w-0 border border-border bg-surface/35 p-4 sm:p-5">
      <div className="grid min-w-0 grid-cols-[76px_minmax(0,1fr)] gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
          <Image
            src={
              product.image
            }
            alt={
              product.name[
                locale
              ]
            }
            fill
            sizes="96px"
            className="object-cover object-center"
          />
        </div>

        <ProductIdentity
          product={
            product
          }
          locale={
            locale
          }
          dictionary={
            dictionary
          }
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-y border-border py-5">
        <MobileMetaItem
          label={
            dictionary.category
          }
          value={
            categoryName
          }
        />

        <MobileMetaItem
          label={
            dictionary.price
          }
          value={formatPrice(
            product.price,
            product.currency,
            locale
          )}
        />

        <MobileMetaItem
          label={
            dictionary.stock
          }
          value={`${product.stock}`}
          secondary={`${dictionary.order}: ${product.order}`}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <CompactToggleButton
          active={
            product.isActive
          }
          label={
            product.isActive
              ? dictionary.active
              : dictionary.inactive
          }
          onClick={
            onToggleActive
          }
        />

        <CompactToggleButton
          active={
            product.isFeatured
          }
          label={
            dictionary.featured
          }
          onClick={
            onToggleFeatured
          }
        />

        <CompactToggleButton
          active={
            product.isNew
          }
          label={
            dictionary.newProduct
          }
          onClick={
            onToggleNew
          }
        />

        <Link
          href={`/${locale}/admin/products/${product.id}/edit`}
          aria-label={`${dictionary.edit}: ${product.name[locale]}`}
          title={
            dictionary.edit
          }
          className="inline-flex h-10 w-10 items-center justify-center border border-border text-foreground transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
        >
          <Edit3
            size={14}
            strokeWidth={
              1.4
            }
          />
        </Link>

        <button
          type="button"
          onClick={
            onDelete
          }
          aria-label={`${dictionary.delete}: ${product.name[locale]}`}
          title={
            dictionary.delete
          }
          className="inline-flex h-10 w-10 items-center justify-center border border-border text-foreground transition-all duration-300 hover:border-danger hover:bg-danger hover:text-white"
        >
          <Trash2
            size={14}
            strokeWidth={
              1.4
            }
          />
        </button>
      </div>
    </article>
  );
}

/*
 * =============================================================
 * PRODUCT IDENTITY
 * =============================================================
 */

type ProductIdentityProps = {
  product: Product;

  locale: Locale;

  dictionary:
    AdminProductsDictionary;
};

function ProductIdentity({
  product,
  locale,
  dictionary,
}: ProductIdentityProps) {
  return (
    <div className="min-w-0">
      <h2 className="break-words font-heading text-[23px] leading-[1.04] text-foreground">
        {
          product.name[
            locale
          ]
        }
      </h2>

      <p
        dir="ltr"
        className="mt-2 truncate text-[8px] tracking-[0.03em] text-muted"
      >
        /{product.slug}
      </p>

      <p className="mt-3 line-clamp-2 text-xs leading-5 text-foreground-soft">
        {
          product
            .shortDescription[
            locale
          ]
        }
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge
          active={
            product.isActive
          }
          activeLabel={
            dictionary.active
          }
          inactiveLabel={
            dictionary.inactive
          }
        />

        {product.isFeatured && (
          <FeatureBadge
            type="featured"
            label={
              dictionary.featured
            }
          />
        )}

        {product.isNew && (
          <FeatureBadge
            type="new"
            label={
              dictionary.newProduct
            }
          />
        )}
      </div>
    </div>
  );
}

/*
 * =============================================================
 * SEARCH INPUT
 * =============================================================
 */

type SearchInputProps = {
  value: string;

  placeholder: string;

  clearLabel: string;

  onChange: (
    value: string
  ) => void;
};

function SearchInput({
  value,
  placeholder,
  clearLabel,
  onChange,
}: SearchInputProps) {
  return (
    <div className="group relative min-w-0">
      <Search
        size={17}
        strokeWidth={1.4}
        className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent"
      />

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        aria-label={
          placeholder
        }
        className="h-14 w-full min-w-0 border border-border bg-surface/55 ps-14 pe-14 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 hover:border-border-strong focus:border-accent"
      />

      {value && (
        <button
          type="button"
          onClick={() =>
            onChange("")
          }
          aria-label={
            clearLabel
          }
          className="absolute end-0 top-0 flex h-14 w-14 items-center justify-center text-muted hover:text-accent"
        >
          <X
            size={15}
            strokeWidth={
              1.4
            }
          />
        </button>
      )}
    </div>
  );
}

/*
 * =============================================================
 * FILTER SELECT
 * =============================================================
 */

type FilterSelectProps = {
  value: string;

  ariaLabel: string;

  onChange: (
    value: string
  ) => void;

  children: ReactNode;
};

function FilterSelect({
  value,
  ariaLabel,
  onChange,
  children,
}: FilterSelectProps) {
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        aria-label={
          ariaLabel
        }
        className="h-14 w-full min-w-0 appearance-none border border-border bg-surface/55 px-5 pe-12 text-sm text-foreground outline-none transition-colors hover:border-border-strong focus:border-accent"
      >
        {children}
      </select>

      <ChevronDown
        size={15}
        strokeWidth={1.4}
        className="pointer-events-none absolute end-5 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

/*
 * =============================================================
 * COMPACT TOGGLE BUTTON
 * =============================================================
 */

type CompactToggleButtonProps = {
  active: boolean;

  label: string;

  onClick:
    () => void;
};

function CompactToggleButton({
  active,
  label,
  onClick,
}: CompactToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "inline-flex min-h-10 shrink-0",

        "items-center justify-center gap-1.5",

        "border px-3",

        "text-[7px] font-semibold uppercase",

        "tracking-[0.07em]",

        "transition-all duration-300",

        active
          ? "border-accent bg-accent text-white"
          : "border-border text-muted hover:border-accent hover:text-accent",
      ].join(" ")}
    >
      {active && (
        <Check
          size={9}
          strokeWidth={
            1.7
          }
        />
      )}

      {label}
    </button>
  );
}

/*
 * =============================================================
 * STATUS BADGE
 * =============================================================
 */

type StatusBadgeProps = {
  active: boolean;

  activeLabel: string;

  inactiveLabel: string;
};

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex min-h-7 items-center gap-2",

        "border px-3",

        "text-[7px] font-semibold uppercase",

        "tracking-[0.1em]",

        active
          ? "border-success/30 bg-success/10 text-success"
          : "border-danger/30 bg-danger/10 text-danger",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",

          active
            ? "bg-success"
            : "bg-danger",
        ].join(" ")}
      />

      {active
        ? activeLabel
        : inactiveLabel}
    </span>
  );
}

/*
 * =============================================================
 * FEATURE BADGE
 * =============================================================
 */

type FeatureBadgeProps = {
  type:
    | "featured"
    | "new";

  label: string;
};

function FeatureBadge({
  type,
  label,
}: FeatureBadgeProps) {
  const isFeatured =
    type === "featured";

  return (
    <span
      className={[
        "inline-flex min-h-7 items-center gap-2",

        "border px-3",

        "text-[7px] font-semibold uppercase",

        "tracking-[0.1em]",

        isFeatured
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-success/30 bg-success/10 text-success",
      ].join(" ")}
    >
      {isFeatured ? (
        <Heart
          size={9}
          fill="currentColor"
        />
      ) : (
        <Sparkles
          size={9}
        />
      )}

      {label}
    </span>
  );
}

/*
 * =============================================================
 * MOBILE META
 * =============================================================
 */

type MobileMetaItemProps = {
  label: string;

  value: string;

  secondary?: string;
};

function MobileMetaItem({
  label,
  value,
  secondary,
}: MobileMetaItemProps) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>

      <p className="mt-2 break-words font-heading text-lg leading-tight text-foreground">
        {value}
      </p>

      {secondary && (
        <p className="mt-2 text-[7px] uppercase tracking-[0.08em] text-muted">
          {secondary}
        </p>
      )}
    </div>
  );
}

/*
 * =============================================================
 * EMPTY STATE
 * =============================================================
 */

type ProductsEmptyStateProps = {
  dictionary:
    AdminProductsDictionary;

  showClearButton: boolean;

  onClear:
    () => void;
};

function ProductsEmptyState({
  dictionary,
  showClearButton,
  onClear,
}: ProductsEmptyStateProps) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center border-b border-border px-5 py-12 text-center">
      <PackagePlus
        size={34}
        strokeWidth={1.1}
        className="text-accent"
      />

      <h2 className="mt-7 font-heading text-4xl text-foreground">
        {
          dictionary.noProducts
        }
      </h2>

      <p className="mt-5 max-w-xl text-sm leading-7 text-foreground-soft">
        {
          dictionary.noProductsDescription
        }
      </p>

      {showClearButton && (
        <button
          type="button"
          onClick={
            onClear
          }
          className="mt-8 min-h-12 border border-foreground px-7 text-[9px] font-semibold uppercase tracking-[0.14em] text-foreground hover:bg-foreground hover:text-white"
        >
          {
            dictionary.clearFilters
          }
        </button>
      )}
    </div>
  );
}

/*
 * =============================================================
 * DELETE MODAL
 * =============================================================
 */

type DeleteProductModalProps = {
  product: Product;

  locale: Locale;

  dictionary:
    AdminProductsDictionary;

  onCancel:
    () => void;

  onConfirm:
    () => void;
};

function DeleteProductModal({
  product,
  locale,
  dictionary,
  onCancel,
  onConfirm,
}: DeleteProductModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#242320]/60 px-5 py-10 backdrop-blur-sm"
    >
      <div className="w-full max-w-[520px] border border-border bg-[#EEEAE3] p-6 shadow-[0_35px_100px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <span className="flex h-14 w-14 items-center justify-center border border-danger/30 bg-danger/10 text-danger">
            <Trash2
              size={22}
              strokeWidth={
                1.3
              }
            />
          </span>

          <button
            type="button"
            onClick={
              onCancel
            }
            aria-label={
              dictionary.cancel
            }
            className="flex h-10 w-10 items-center justify-center border border-border text-muted"
          >
            <X
              size={15}
              strokeWidth={
                1.4
              }
            />
          </button>
        </div>

        <h2 className="mt-7 font-heading text-4xl leading-none text-foreground">
          {
            dictionary.deleteTitle
          }
        </h2>

        <p className="mt-5 text-sm leading-7 text-foreground-soft">
          {
            dictionary.deleteDescription
          }
        </p>

        <div className="mt-6 grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 border-y border-border py-5">
          <div className="relative h-20 w-16 overflow-hidden bg-surface">
            <Image
              src={
                product.image
              }
              alt={
                product.name[
                  locale
                ]
              }
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="font-heading text-2xl text-foreground">
              {
                product.name[
                  locale
                ]
              }
            </p>

            <p
              dir="ltr"
              className="mt-2 truncate text-[9px] text-muted"
            >
              /{product.slug}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={
              onCancel
            }
            className="min-h-13 border border-foreground px-6 text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-white"
          >
            {
              dictionary.cancel
            }
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            className="min-h-13 border border-danger bg-danger px-6 text-[9px] font-semibold uppercase tracking-[0.15em] text-white"
          >
            {
              dictionary.confirmDelete
            }
          </button>
        </div>
      </div>
    </div>
  );
}