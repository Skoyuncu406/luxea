"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  Category,
  LocalizedText,
} from "@/types/category";

/*
 * =============================================================
 * TYPES
 * =============================================================
 */

export type CreateCategoryInput = {
  slug: string;

  name: LocalizedText;
  eyebrow: LocalizedText;

  image: string;

  order: number;

  isActive: boolean;
};

export type UpdateCategoryInput =
  Partial<CreateCategoryInput>;

type CategoryContextValue = {
  categories: Category[];

  isLoaded: boolean;

  createCategory: (
    input: CreateCategoryInput
  ) => Promise<Category>;

  updateCategory: (
    categoryId: string,
    input: UpdateCategoryInput
  ) => Promise<Category | undefined>;

  deleteCategory: (
    categoryId: string
  ) => Promise<void>;

  toggleCategoryActive: (
    categoryId: string
  ) => Promise<void>;

  findCategoryById: (
    categoryId: string
  ) => Category | undefined;

  findCategoryBySlug: (
    slug: string
  ) => Category | undefined;

  refreshCategories: () => Promise<void>;

  resetCategories: () => Promise<void>;
};

type CategoryProviderProps = {
  children: ReactNode;
};

type CategoriesApiResponse = {
  success: boolean;

  categories?: Category[];

  message?: string;
};

type CategoryApiResponse = {
  success: boolean;

  category?: Category;

  message?: string;

  code?: string;
};

/*
 * =============================================================
 * CONTEXT
 * =============================================================
 */

const CategoryContext =
  createContext<CategoryContextValue | null>(
    null
  );

/*
 * =============================================================
 * SLUG NORMALİZASYONU
 * =============================================================
 */

function normalizeSlug(
  value: string
) {
  return value
    .trim()
    .toLocaleLowerCase(
      "tr-TR"
    )
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

/*
 * =============================================================
 * RESPONSE OKUMA
 * =============================================================
 */

async function readJsonResponse<T>(
  response: Response
): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(
      "Sunucudan geçersiz bir cevap alındı."
    );
  }
}

/*
 * =============================================================
 * CATEGORY PROVIDER
 * =============================================================
 */

export function CategoryProvider({
  children,
}: CategoryProviderProps) {
  /*
   * Artık demo kategori veya localStorage kullanılmıyor.
   *
   * Tek gerçek veri kaynağı:
   *
   * Neon PostgreSQL
   *       ↓
   * Prisma
   *       ↓
   * /api/categories
   *       ↓
   * CategoryContext
   */

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  /*
   * =========================================================
   * KATEGORİLERİ DATABASE'DEN GETİR
   * =========================================================
   */

  const refreshCategories =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              "/api/categories",
              {
                method: "GET",

                cache: "no-store",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await readJsonResponse<CategoriesApiResponse>(
              response
            );

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                "Kategoriler alınamadı."
            );
          }

          const receivedCategories =
            Array.isArray(
              data.categories
            )
              ? data.categories
              : [];

          setCategories(
            receivedCategories
          );
        } catch (error) {
          console.error(
            "Kategoriler database'den yüklenemedi:",
            error
          );

          setCategories([]);

          throw error;
        }
      },
      []
    );

  /*
   * =========================================================
   * İLK YÜKLEME
   * =========================================================
   */

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const response =
          await fetch(
            "/api/categories",
            {
              method: "GET",

              cache: "no-store",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await readJsonResponse<CategoriesApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Kategoriler alınamadı."
          );
        }

        if (!isMounted) {
          return;
        }

        setCategories(
          Array.isArray(
            data.categories
          )
            ? data.categories
            : []
        );
      } catch (error) {
        console.error(
          "Kategoriler yüklenemedi:",
          error
        );

        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * =========================================================
   * KATEGORİ OLUŞTUR
   * =========================================================
   */

  const createCategory =
    useCallback(
      async (
        input: CreateCategoryInput
      ): Promise<Category> => {
        const response =
          await fetch(
            "/api/categories",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify(
                input
              ),
            }
          );

        const data =
          await readJsonResponse<CategoryApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success ||
          !data.category
        ) {
          throw new Error(
            data.message ||
              "Kategori oluşturulamadı."
          );
        }

        const newCategory =
          data.category;

        /*
         * Database başarılı olduktan sonra
         * client state güncellenir.
         */

        setCategories(
          (
            currentCategories
          ) =>
            [
              ...currentCategories,
              newCategory,
            ].sort(
              (a, b) =>
                a.order -
                b.order
            )
        );

        return newCategory;
      },
      []
    );

  /*
   * =========================================================
   * KATEGORİ GÜNCELLE
   * =========================================================
   */

  const updateCategory =
    useCallback(
      async (
        categoryId: string,
        input: UpdateCategoryInput
      ): Promise<
        Category | undefined
      > => {
        const currentCategory =
          categories.find(
            (category) =>
              category.id ===
              categoryId
          );

        if (!currentCategory) {
          return undefined;
        }

        const response =
          await fetch(
            `/api/categories/${encodeURIComponent(
              categoryId
            )}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify(
                input
              ),
            }
          );

        const data =
          await readJsonResponse<CategoryApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success ||
          !data.category
        ) {
          throw new Error(
            data.message ||
              "Kategori güncellenemedi."
          );
        }

        const updatedCategory =
          data.category;

        setCategories(
          (
            currentCategories
          ) =>
            currentCategories
              .map(
                (category) =>
                  category.id ===
                  categoryId
                    ? updatedCategory
                    : category
              )
              .sort(
                (a, b) =>
                  a.order -
                  b.order
              )
        );

        return updatedCategory;
      },
      [categories]
    );

  /*
   * =========================================================
   * KATEGORİ SİL
   * =========================================================
   */

  const deleteCategory =
    useCallback(
      async (
        categoryId: string
      ): Promise<void> => {
        const response =
          await fetch(
            `/api/categories/${encodeURIComponent(
              categoryId
            )}`,
            {
              method: "DELETE",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await readJsonResponse<CategoryApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Kategori silinemedi."
          );
        }

        /*
         * Database silme başarılı olduktan
         * sonra state'ten çıkar.
         */

        setCategories(
          (
            currentCategories
          ) =>
            currentCategories.filter(
              (category) =>
                category.id !==
                categoryId
            )
        );
      },
      []
    );

  /*
   * =========================================================
   * AKTİF / PASİF
   * =========================================================
   */

  const toggleCategoryActive =
    useCallback(
      async (
        categoryId: string
      ): Promise<void> => {
        const currentCategory =
          categories.find(
            (category) =>
              category.id ===
              categoryId
          );

        if (!currentCategory) {
          throw new Error(
            "Kategori bulunamadı."
          );
        }

        const response =
          await fetch(
            `/api/categories/${encodeURIComponent(
              categoryId
            )}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body: JSON.stringify({
                isActive:
                  !currentCategory.isActive,
              }),
            }
          );

        const data =
          await readJsonResponse<CategoryApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success ||
          !data.category
        ) {
          throw new Error(
            data.message ||
              "Kategori durumu değiştirilemedi."
          );
        }

        const updatedCategory =
          data.category;

        setCategories(
          (
            currentCategories
          ) =>
            currentCategories.map(
              (category) =>
                category.id ===
                categoryId
                  ? updatedCategory
                  : category
            )
        );
      },
      [categories]
    );

  /*
   * =========================================================
   * ID İLE BUL
   * =========================================================
   */

  const findCategoryById =
    useCallback(
      (
        categoryId: string
      ) =>
        categories.find(
          (category) =>
            category.id ===
            categoryId
        ),
      [categories]
    );

  /*
   * =========================================================
   * SLUG İLE BUL
   * =========================================================
   */

  const findCategoryBySlug =
    useCallback(
      (
        slug: string
      ) => {
        const normalizedSlug =
          normalizeSlug(
            slug
          );

        return categories.find(
          (category) =>
            category.slug ===
            normalizedSlug
        );
      },
      [categories]
    );

  /*
   * =========================================================
   * TÜM KATEGORİLERİ TEMİZLE
   * =========================================================
   *
   * Eski sistemde bu yalnızca localStorage/state temizliyordu.
   *
   * Database sisteminde reset işleminin yanlışlıkla bütün
   * production kategorilerini silmesini istemiyoruz.
   *
   * Bu nedenle resetCategories yalnızca mevcut state'i
   * database'den tekrar senkronize eder.
   * =========================================================
   */

  const resetCategories =
    useCallback(
      async (): Promise<void> => {
        await refreshCategories();
      },
      [refreshCategories]
    );

  /*
   * =========================================================
   * CONTEXT VALUE
   * =========================================================
   */

  const value =
    useMemo<CategoryContextValue>(
      () => ({
        categories,

        isLoaded,

        createCategory,

        updateCategory,

        deleteCategory,

        toggleCategoryActive,

        findCategoryById,

        findCategoryBySlug,

        refreshCategories,

        resetCategories,
      }),
      [
        categories,

        isLoaded,

        createCategory,

        updateCategory,

        deleteCategory,

        toggleCategoryActive,

        findCategoryById,

        findCategoryBySlug,

        refreshCategories,

        resetCategories,
      ]
    );

  return (
    <CategoryContext.Provider
      value={value}
    >
      {children}
    </CategoryContext.Provider>
  );
}

/*
 * =============================================================
 * HOOK
 * =============================================================
 */

export function useCategories() {
  const context =
    useContext(
      CategoryContext
    );

  if (!context) {
    throw new Error(
      "useCategories, CategoryProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}