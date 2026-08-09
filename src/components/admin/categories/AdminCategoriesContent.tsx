"use client";

import {
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Check,
  Edit3,
  Loader2,
  Plus,
  Search,
  Tags,
  Trash2,
  X,
} from "lucide-react";

import {
  useCategories,
} from "@/contexts/CategoryContext";

import {
  useProducts,
} from "@/contexts/ProductContext";

import type {
  Locale,
} from "@/lib/i18n/config";

import type {
  Category,
} from "@/types/category";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type AdminCategoriesDictionary = {
  addCategory: string;
  searchPlaceholder: string;

  categoriesFound: string;
  clearSearch: string;

  category: string;
  slug: string;
  order: string;
  products: string;
  status: string;
  actions: string;

  active: string;
  inactive: string;

  edit: string;
  delete: string;

  noCategories: string;
  noCategoriesDescription: string;

  deleteTitle: string;
  deleteDescription: string;

  deleteBlockedTitle: string;
  deleteBlockedDescription: string;

  cancel: string;
  confirmDelete: string;
  deactivateInstead: string;

  loading: string;
};

type AdminCategoriesContentProps = {
  locale: Locale;

  dictionary:
    AdminCategoriesDictionary;
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function AdminCategoriesContent({
  locale,
  dictionary,
}: AdminCategoriesContentProps) {
  const {
    categories,

    isLoaded:
      categoriesLoaded,

    deleteCategory,

    toggleCategoryActive,
  } = useCategories();

  const {
    products,

    isLoaded:
      productsLoaded,
  } = useProducts();

  /*
   * ==========================================================
   * STATE
   * ==========================================================
   */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    categoryToDelete,
    setCategoryToDelete,
  ] =
    useState<Category | null>(
      null
    );

  const [
    processingCategoryId,
    setProcessingCategoryId,
  ] =
    useState<string | null>(
      null
    );

  const [
    deleteError,
    setDeleteError,
  ] =
    useState<string | null>(
      null
    );

  const isLoaded =
    categoriesLoaded &&
    productsLoaded;

  /*
   * ==========================================================
   * FILTER
   * ==========================================================
   */

  const filteredCategories =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLocaleLowerCase(
            locale
          );

      return [...categories]
        .filter(
          (category) => {
            if (
              !normalizedSearch
            ) {
              return true;
            }

            const name =
              category.name[
                locale
              ].toLocaleLowerCase(
                locale
              );

            const slug =
              category.slug.toLocaleLowerCase(
                locale
              );

            return (
              name.includes(
                normalizedSearch
              ) ||
              slug.includes(
                normalizedSearch
              )
            );
          }
        )
        .sort(
          (a, b) =>
            a.order - b.order
        );
    }, [
      categories,
      locale,
      searchQuery,
    ]);

  /*
   * ==========================================================
   * PRODUCT COUNT
   * ==========================================================
   */

  function getCategoryProductCount(
    categoryId: string
  ) {
    return products.filter(
      (product) =>
        product.categoryId ===
        categoryId
    ).length;
  }

  /*
   * ==========================================================
   * ACTIVE / INACTIVE
   * ==========================================================
   */

  async function handleToggleActive(
    categoryId: string
  ) {
    if (
      processingCategoryId
    ) {
      return;
    }

    setDeleteError(null);

    setProcessingCategoryId(
      categoryId
    );

    try {
      await toggleCategoryActive(
        categoryId
      );
    } catch (error) {
      console.error(
        "Kategori durumu değiştirilemedi:",
        error
      );

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Kategori durumu değiştirilemedi."
      );
    } finally {
      setProcessingCategoryId(
        null
      );
    }
  }

  /*
   * ==========================================================
   * DELETE
   * ==========================================================
   */

  async function confirmDelete() {
    if (
      !categoryToDelete ||
      processingCategoryId
    ) {
      return;
    }

    const productCount =
      getCategoryProductCount(
        categoryToDelete.id
      );

    /*
     * UI seviyesinde ilk kontrol.
     *
     * API tarafında da aynı kontrol var.
     */
    if (productCount > 0) {
      return;
    }

    setDeleteError(null);

    setProcessingCategoryId(
      categoryToDelete.id
    );

    try {
      /*
       * Database cevabını mutlaka
       * bekliyoruz.
       */
      await deleteCategory(
        categoryToDelete.id
      );

      /*
       * Modal yalnızca PostgreSQL
       * silme işlemi başarılı olursa
       * kapanır.
       */
      setCategoryToDelete(
        null
      );
    } catch (error) {
      console.error(
        "Kategori silinemedi:",
        error
      );

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Kategori silinemedi."
      );
    } finally {
      setProcessingCategoryId(
        null
      );
    }
  }

  /*
   * ==========================================================
   * DEACTIVATE INSTEAD
   * ==========================================================
   */

  async function deactivateCategory() {
    if (
      !categoryToDelete ||
      processingCategoryId
    ) {
      return;
    }

    /*
     * Zaten pasifse tekrar API
     * çağrısı yapmaya gerek yok.
     */
    if (
      !categoryToDelete.isActive
    ) {
      setCategoryToDelete(
        null
      );

      return;
    }

    setDeleteError(null);

    setProcessingCategoryId(
      categoryToDelete.id
    );

    try {
      await toggleCategoryActive(
        categoryToDelete.id
      );

      setCategoryToDelete(
        null
      );
    } catch (error) {
      console.error(
        "Kategori pasif hale getirilemedi:",
        error
      );

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Kategori pasif hale getirilemedi."
      );
    } finally {
      setProcessingCategoryId(
        null
      );
    }
  }

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (!isLoaded) {
    return (
      <div className="flex min-h-[420px] w-full items-center justify-center border-y border-border px-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          {dictionary.loading}
        </p>
      </div>
    );
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <>
      <div className="w-full min-w-0">
        {/* Üst aksiyon */}

        <div className="flex w-full justify-end">
          <Link
            href={`/${locale}/admin/categories/new`}
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
            <Plus
              size={16}
              strokeWidth={1.4}
            />

            <span>
              {
                dictionary.addCategory
              }
            </span>
          </Link>
        </div>

        {/* Global işlem hatası */}

        {deleteError &&
          !categoryToDelete && (
            <div className="mt-6 border border-danger/30 bg-danger/10 px-5 py-4">
              <p className="text-xs leading-6 text-danger">
                {deleteError}
              </p>
            </div>
          )}

        {/* Arama */}

        <section className="mt-6 border-y border-border py-5">
          <div className="group relative max-w-[620px]">
            <Search
              size={17}
              strokeWidth={1.4}
              className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-muted transition-colors duration-300 group-focus-within:text-accent"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(
                event
              ) =>
                setSearchQuery(
                  event.target
                    .value
                )
              }
              placeholder={
                dictionary.searchPlaceholder
              }
              aria-label={
                dictionary.searchPlaceholder
              }
              className="h-14 w-full border border-border bg-surface/55 ps-14 pe-14 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 hover:border-border-strong focus:border-accent"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery(
                    ""
                  )
                }
                aria-label={
                  dictionary.clearSearch
                }
                className="absolute end-0 top-0 flex h-14 w-14 items-center justify-center text-muted transition-colors hover:text-accent"
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
        </section>

        {/* Sonuç */}

        <div className="flex min-h-[76px] items-center justify-between border-b border-border">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
            {
              filteredCategories.length
            }{" "}
            {
              dictionary.categoriesFound
            }
          </p>

          {searchQuery && (
            <button
              type="button"
              onClick={() =>
                setSearchQuery("")
              }
              className="text-[9px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:text-accent"
            >
              {
                dictionary.clearSearch
              }
            </button>
          )}
        </div>

        {filteredCategories.length >
        0 ? (
          <>
            {/* Masaüstü */}

            <div className="hidden xl:block">
              <div className="grid min-h-16 grid-cols-[92px_minmax(220px,1.3fr)_minmax(130px,0.7fr)_80px_90px_130px_150px] items-center gap-4 border-b border-border px-3 text-[8px] font-semibold uppercase tracking-[0.16em] text-muted">
                <span />

                <span>
                  {
                    dictionary.category
                  }
                </span>

                <span>
                  {
                    dictionary.slug
                  }
                </span>

                <span>
                  {
                    dictionary.order
                  }
                </span>

                <span>
                  {
                    dictionary.products
                  }
                </span>

                <span>
                  {
                    dictionary.status
                  }
                </span>

                <span className="text-end">
                  {
                    dictionary.actions
                  }
                </span>
              </div>

              <div className="divide-y divide-border border-b border-border">
                {filteredCategories.map(
                  (
                    category
                  ) => {
                    const isProcessing =
                      processingCategoryId ===
                      category.id;

                    return (
                      <DesktopCategoryRow
                        key={
                          category.id
                        }
                        category={
                          category
                        }
                        locale={
                          locale
                        }
                        dictionary={
                          dictionary
                        }
                        productCount={getCategoryProductCount(
                          category.id
                        )}
                        isProcessing={
                          isProcessing
                        }
                        onToggleActive={() =>
                          void handleToggleActive(
                            category.id
                          )
                        }
                        onDelete={() => {
                          setDeleteError(
                            null
                          );

                          setCategoryToDelete(
                            category
                          );
                        }}
                      />
                    );
                  }
                )}
              </div>
            </div>

            {/* Mobil / tablet */}

            <div className="grid gap-5 pt-6 xl:hidden">
              {filteredCategories.map(
                (
                  category
                ) => {
                  const isProcessing =
                    processingCategoryId ===
                    category.id;

                  return (
                    <MobileCategoryCard
                      key={
                        category.id
                      }
                      category={
                        category
                      }
                      locale={
                        locale
                      }
                      dictionary={
                        dictionary
                      }
                      productCount={getCategoryProductCount(
                        category.id
                      )}
                      isProcessing={
                        isProcessing
                      }
                      onToggleActive={() =>
                        void handleToggleActive(
                          category.id
                        )
                      }
                      onDelete={() => {
                        setDeleteError(
                          null
                        );

                        setCategoryToDelete(
                          category
                        );
                      }}
                    />
                  );
                }
              )}
            </div>
          </>
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center border-b border-border px-5 py-12 text-center">
            <span className="flex h-20 w-20 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
              <Tags
                size={31}
                strokeWidth={
                  1.15
                }
              />
            </span>

            <h2 className="mt-7 font-heading text-4xl leading-none text-foreground sm:text-5xl">
              {
                dictionary.noCategories
              }
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-foreground-soft">
              {
                dictionary.noCategoriesDescription
              }
            </p>
          </div>
        )}
      </div>

      {categoryToDelete && (
        <DeleteCategoryModal
          category={
            categoryToDelete
          }
          locale={locale}
          dictionary={
            dictionary
          }
          productCount={getCategoryProductCount(
            categoryToDelete.id
          )}
          isProcessing={
            processingCategoryId ===
            categoryToDelete.id
          }
          error={
            deleteError
          }
          onCancel={() => {
            if (
              processingCategoryId
            ) {
              return;
            }

            setDeleteError(
              null
            );

            setCategoryToDelete(
              null
            );
          }}
          onConfirm={() =>
            void confirmDelete()
          }
          onDeactivate={() =>
            void deactivateCategory()
          }
        />
      )}
    </>
  );
}

/*
 * ============================================================
 * ROW TYPES
 * ============================================================
 */

type CategoryRowProps = {
  category: Category;

  locale: Locale;

  dictionary:
    AdminCategoriesDictionary;

  productCount: number;

  isProcessing: boolean;

  onToggleActive: () => void;

  onDelete: () => void;
};

/*
 * ============================================================
 * DESKTOP ROW
 * ============================================================
 */

function DesktopCategoryRow({
  category,
  locale,
  dictionary,
  productCount,
  isProcessing,
  onToggleActive,
  onDelete,
}: CategoryRowProps) {
  return (
    <article className="grid min-h-[126px] grid-cols-[92px_minmax(220px,1.3fr)_minmax(130px,0.7fr)_80px_90px_130px_150px] items-center gap-4 px-3 py-5 transition-colors duration-300 hover:bg-surface/35">
      <div className="relative h-[92px] w-[74px] overflow-hidden bg-surface">
        <Image
          src={category.image}
          alt={
            category.name[
              locale
            ]
          }
          fill
          sizes="74px"
          className="object-cover object-center"
        />
      </div>

      <div className="min-w-0">
        <h2 className="break-words font-heading text-[24px] leading-none text-foreground">
          {
            category.name[
              locale
            ]
          }
        </h2>

        <p className="mt-3 line-clamp-2 text-xs leading-5 text-foreground-soft">
          {
            category.eyebrow[
              locale
            ]
          }
        </p>
      </div>

      <p
        dir="ltr"
        className="truncate text-[9px] text-muted"
      >
        /{category.slug}
      </p>

      <p className="font-heading text-xl text-foreground">
        {category.order}
      </p>

      <p className="font-heading text-xl text-foreground">
        {productCount}
      </p>

      <button
        type="button"
        onClick={
          onToggleActive
        }
        disabled={
          isProcessing
        }
        className={[
          "inline-flex min-h-10 items-center",
          "justify-center gap-2 border px-3",
          "text-[7px] font-semibold uppercase",
          "tracking-[0.1em]",
          "transition-all duration-300",

          isProcessing
            ? "cursor-wait opacity-60"
            : "",

          category.isActive
            ? "border-accent bg-accent text-white"
            : "border-border text-muted hover:border-accent hover:text-accent",
        ].join(" ")}
      >
        {isProcessing ? (
          <Loader2
            size={11}
            strokeWidth={
              1.5
            }
            className="animate-spin"
          />
        ) : (
          category.isActive && (
            <Check
              size={10}
              strokeWidth={
                1.6
              }
            />
          )
        )}

        {category.isActive
          ? dictionary.active
          : dictionary.inactive}
      </button>

      <div className="flex justify-end gap-2">
        <Link
          href={`/${locale}/admin/categories/${category.id}/edit`}
          aria-label={`${dictionary.edit}: ${category.name[locale]}`}
          title={
            dictionary.edit
          }
          className={[
            "inline-flex h-10 w-10",
            "items-center justify-center",
            "border border-border",
            "text-foreground",
            "transition-colors",
            "hover:border-accent",
            "hover:bg-accent",
            "hover:text-white",

            isProcessing
              ? "pointer-events-none opacity-40"
              : "",
          ].join(" ")}
        >
          <Edit3
            size={14}
            strokeWidth={1.4}
          />
        </Link>

        <button
          type="button"
          onClick={onDelete}
          disabled={
            isProcessing
          }
          aria-label={`${dictionary.delete}: ${category.name[locale]}`}
          title={
            dictionary.delete
          }
          className="inline-flex h-10 w-10 items-center justify-center border border-border text-foreground transition-colors hover:border-danger hover:bg-danger hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2
            size={14}
            strokeWidth={1.4}
          />
        </button>
      </div>
    </article>
  );
}

/*
 * ============================================================
 * MOBILE CARD
 * ============================================================
 */

function MobileCategoryCard({
  category,
  locale,
  dictionary,
  productCount,
  isProcessing,
  onToggleActive,
  onDelete,
}: CategoryRowProps) {
  return (
    <article className="border border-border bg-surface/35 p-4 sm:p-5">
      <div className="grid grid-cols-[86px_minmax(0,1fr)] gap-4">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
          <Image
            src={
              category.image
            }
            alt={
              category.name[
                locale
              ]
            }
            fill
            sizes="86px"
            className="object-cover object-center"
          />
        </div>

        <div className="min-w-0">
          <h2 className="font-heading text-2xl leading-none text-foreground">
            {
              category.name[
                locale
              ]
            }
          </h2>

          <p className="mt-3 text-xs leading-5 text-foreground-soft">
            {
              category.eyebrow[
                locale
              ]
            }
          </p>

          <p
            dir="ltr"
            className="mt-3 truncate text-[8px] text-muted"
          >
            /{category.slug}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-5 text-center">
        <div>
          <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-muted">
            {
              dictionary.order
            }
          </p>

          <p className="mt-2 font-heading text-xl text-foreground">
            {
              category.order
            }
          </p>
        </div>

        <div>
          <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-muted">
            {
              dictionary.products
            }
          </p>

          <p className="mt-2 font-heading text-xl text-foreground">
            {productCount}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={
            onToggleActive
          }
          disabled={
            isProcessing
          }
          className={[
            "inline-flex min-h-10",
            "items-center justify-center gap-2",
            "border px-4",
            "text-[7px] font-semibold uppercase",
            "tracking-[0.1em]",

            isProcessing
              ? "cursor-wait opacity-60"
              : "",

            category.isActive
              ? "border-accent bg-accent text-white"
              : "border-border text-muted",
          ].join(" ")}
        >
          {isProcessing ? (
            <Loader2
              size={11}
              strokeWidth={
                1.5
              }
              className="animate-spin"
            />
          ) : (
            category.isActive && (
              <Check
                size={10}
                strokeWidth={
                  1.6
                }
              />
            )
          )}

          {category.isActive
            ? dictionary.active
            : dictionary.inactive}
        </button>

        <Link
          href={`/${locale}/admin/categories/${category.id}/edit`}
          className={[
            "inline-flex h-10 w-10",
            "items-center justify-center",
            "border border-border",
            "text-foreground",

            isProcessing
              ? "pointer-events-none opacity-40"
              : "",
          ].join(" ")}
        >
          <Edit3
            size={14}
            strokeWidth={1.4}
          />
        </Link>

        <button
          type="button"
          onClick={onDelete}
          disabled={
            isProcessing
          }
          className="inline-flex h-10 w-10 items-center justify-center border border-border text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2
            size={14}
            strokeWidth={1.4}
          />
        </button>
      </div>
    </article>
  );
}

/*
 * ============================================================
 * DELETE MODAL TYPES
 * ============================================================
 */

type DeleteCategoryModalProps = {
  category: Category;

  locale: Locale;

  dictionary:
    AdminCategoriesDictionary;

  productCount: number;

  isProcessing: boolean;

  error: string | null;

  onCancel: () => void;

  onConfirm: () => void;

  onDeactivate: () => void;
};

/*
 * ============================================================
 * DELETE MODAL
 * ============================================================
 */

function DeleteCategoryModal({
  category,
  locale,
  dictionary,
  productCount,
  isProcessing,
  error,
  onCancel,
  onConfirm,
  onDeactivate,
}: DeleteCategoryModalProps) {
  const deleteIsBlocked =
    productCount > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#242320]/60 px-5 py-10 backdrop-blur-sm"
    >
      <div className="w-full max-w-[540px] border border-border bg-[#EEEAE3] p-6 shadow-[0_35px_100px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <span
            className={[
              "flex h-14 w-14",
              "items-center justify-center border",

              deleteIsBlocked
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-danger/30 bg-danger/10 text-danger",
            ].join(" ")}
          >
            {isProcessing ? (
              <Loader2
                size={22}
                strokeWidth={
                  1.3
                }
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={22}
                strokeWidth={
                  1.3
                }
              />
            )}
          </span>

          <button
            type="button"
            onClick={onCancel}
            disabled={
              isProcessing
            }
            aria-label={
              dictionary.cancel
            }
            className="flex h-10 w-10 items-center justify-center border border-border text-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X
              size={15}
              strokeWidth={1.4}
            />
          </button>
        </div>

        <h2 className="mt-7 font-heading text-4xl leading-none text-foreground">
          {deleteIsBlocked
            ? dictionary.deleteBlockedTitle
            : dictionary.deleteTitle}
        </h2>

        <p className="mt-5 text-sm leading-7 text-foreground-soft">
          {deleteIsBlocked
            ? dictionary.deleteBlockedDescription
            : dictionary.deleteDescription}
        </p>

        <div className="mt-6 grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 border-y border-border py-5">
          <div className="relative h-20 w-16 overflow-hidden bg-surface">
            <Image
              src={
                category.image
              }
              alt={
                category.name[
                  locale
                ]
              }
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="font-heading text-2xl leading-none text-foreground">
              {
                category.name[
                  locale
                ]
              }
            </p>

            <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-muted">
              {
                dictionary.products
              }
              : {productCount}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-5 border border-danger/30 bg-danger/10 px-4 py-3">
            <p className="text-xs leading-6 text-danger">
              {error}
            </p>
          </div>
        )}

        {deleteIsBlocked ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={
                isProcessing
              }
              className="min-h-13 border border-foreground px-6 text-[9px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {
                dictionary.cancel
              }
            </button>

            <button
              type="button"
              onClick={
                onDeactivate
              }
              disabled={
                isProcessing
              }
              className="inline-flex min-h-13 items-center justify-center gap-2 border border-accent bg-accent px-6 text-[9px] font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-wait disabled:opacity-60"
            >
              {isProcessing && (
                <Loader2
                  size={13}
                  strokeWidth={
                    1.5
                  }
                  className="animate-spin"
                />
              )}

              {
                dictionary.deactivateInstead
              }
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={
                isProcessing
              }
              className="min-h-13 border border-foreground px-6 text-[9px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
              disabled={
                isProcessing
              }
              className="inline-flex min-h-13 items-center justify-center gap-2 border border-danger bg-danger px-6 text-[9px] font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-wait disabled:opacity-60"
            >
              {isProcessing && (
                <Loader2
                  size={13}
                  strokeWidth={
                    1.5
                  }
                  className="animate-spin"
                />
              )}

              {
                dictionary.confirmDelete
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}