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
  ) => Category;

  updateCategory: (
    categoryId: string,
    input: UpdateCategoryInput
  ) => Category | undefined;

  deleteCategory: (
    categoryId: string
  ) => void;

  toggleCategoryActive: (
    categoryId: string
  ) => void;

  findCategoryById: (
    categoryId: string
  ) => Category | undefined;

  findCategoryBySlug: (
    slug: string
  ) => Category | undefined;

  resetCategories: () => void;
};

type CategoryProviderProps = {
  children: ReactNode;
};

const CATEGORIES_STORAGE_KEY =
  "luxea-categories";

const CategoryContext =
  createContext<CategoryContextValue | null>(
    null
  );

/*
 * =============================================================
 * KATEGORİ ADI NORMALİZASYONU
 *
 * TR / EN tamamen büyük harfe çevrilir.
 * Arapçada büyük-küçük harf olmadığı için değişmez.
 * =============================================================
 */

function normalizeCategoryName(
  value: string,
  locale: "tr" | "en" | "ar"
) {
  const trimmed =
    value.trim();

  if (
    locale === "ar"
  ) {
    return trimmed;
  }

  return trimmed.toLocaleUpperCase(
    locale === "tr"
      ? "tr-TR"
      : "en-US"
  );
}

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
 * CATEGORY ID
 * =============================================================
 */

function createCategoryId() {
  if (
    typeof window !==
      "undefined" &&
    window.crypto
      ?.randomUUID
  ) {
    return `category-${window.crypto.randomUUID()}`;
  }

  return `category-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/*
 * =============================================================
 * LOCALIZED TEXT DOĞRULAMA
 * =============================================================
 */

function isLocalizedText(
  value: unknown
): value is LocalizedText {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const text =
    value as Partial<LocalizedText>;

  return (
    typeof text.tr ===
      "string" &&
    typeof text.en ===
      "string" &&
    typeof text.ar ===
      "string"
  );
}

/*
 * =============================================================
 * CATEGORY DOĞRULAMA
 * =============================================================
 */

function isValidCategory(
  value: unknown
): value is Category {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const category =
    value as Partial<Category>;

  return (
    typeof category.id ===
      "string" &&
    typeof category.slug ===
      "string" &&
    isLocalizedText(
      category.name
    ) &&
    isLocalizedText(
      category.eyebrow
    ) &&
    typeof category.image ===
      "string" &&
    typeof category.order ===
      "number" &&
    Number.isFinite(
      category.order
    ) &&
    typeof category.isActive ===
      "boolean"
  );
}

/*
 * =============================================================
 * CATEGORY INPUT NORMALİZASYONU
 * =============================================================
 */

function normalizeCategoryInput(
  input: CreateCategoryInput
): CreateCategoryInput {
  return {
    slug: normalizeSlug(
      input.slug
    ),

    /*
     * Admin küçük/büyük harf fark etmeksizin
     * yazabilir.
     *
     * Kaydedildiğinde TR ve EN tamamen
     * büyük harfe dönüştürülür.
     */
    name: {
      tr: normalizeCategoryName(
        input.name.tr,
        "tr"
      ),

      en: normalizeCategoryName(
        input.name.en,
        "en"
      ),

      ar: normalizeCategoryName(
        input.name.ar,
        "ar"
      ),
    },

    eyebrow: {
      tr: input.eyebrow.tr.trim(),
      en: input.eyebrow.en.trim(),
      ar: input.eyebrow.ar.trim(),
    },

    image:
      input.image.trim(),

    order: Math.max(
      0,
      Math.trunc(
        input.order
      )
    ),

    isActive:
      input.isActive,
  };
}

/*
 * =============================================================
 * UNIQUE SLUG
 * =============================================================
 */

function createUniqueSlug(
  requestedSlug: string,
  categories: Category[],
  ignoredCategoryId?: string
) {
  const baseSlug =
    normalizeSlug(
      requestedSlug
    ) || "category";

  const exists = (
    candidate: string
  ) =>
    categories.some(
      (category) =>
        category.id !==
          ignoredCategoryId &&
        category.slug ===
          candidate
    );

  if (
    !exists(
      baseSlug
    )
  ) {
    return baseSlug;
  }

  let suffix = 2;

  while (
    exists(
      `${baseSlug}-${suffix}`
    )
  ) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
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
   * Demo kategori yok.
   *
   * Sistem sıfır kategori ile başlar.
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
   * LOCAL STORAGE'DAN KATEGORİLERİ YÜKLE
   * =========================================================
   */

  useEffect(() => {
    try {
      const storedCategories =
        window.localStorage.getItem(
          CATEGORIES_STORAGE_KEY
        );

      /*
       * Veri yoksa kategori listesi boş kalır.
       * Demo kategori yüklenmez.
       */
      if (
        !storedCategories
      ) {
        setCategories([]);
        return;
      }

      const parsed:
        unknown =
        JSON.parse(
          storedCategories
        );

      if (
        !Array.isArray(
          parsed
        )
      ) {
        setCategories([]);
        return;
      }

      /*
       * Yalnızca geçerli admin kategorilerini yükle.
       */
      const validCategories =
        parsed.filter(
          isValidCategory
        );

      /*
       * Mevcut eski kayıtlar varsa kategori
       * isimlerini de normalleştiriyoruz.
       */
      const normalizedCategories =
        validCategories.map(
          (category) => ({
            ...category,

            name: {
              tr: normalizeCategoryName(
                category.name.tr,
                "tr"
              ),

              en: normalizeCategoryName(
                category.name.en,
                "en"
              ),

              ar: normalizeCategoryName(
                category.name.ar,
                "ar"
              ),
            },
          })
        );

      setCategories(
        normalizedCategories
      );
    } catch (error) {
      console.error(
        "Kategoriler yüklenemedi:",
        error
      );

      setCategories([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /*
   * =========================================================
   * KATEGORİLERİ LOCAL STORAGE'A KAYDET
   * =========================================================
   */

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        CATEGORIES_STORAGE_KEY,
        JSON.stringify(
          categories
        )
      );
    } catch (error) {
      console.error(
        "Kategoriler kaydedilemedi:",
        error
      );
    }
  }, [
    categories,
    isLoaded,
  ]);

  /*
   * =========================================================
   * KATEGORİ OLUŞTUR
   * =========================================================
   */

  const createCategory =
    useCallback(
      (
        input: CreateCategoryInput
      ): Category => {
        const normalized =
          normalizeCategoryInput(
            input
          );

        const newCategory:
          Category =
          {
            id: createCategoryId(),

            ...normalized,

            slug: createUniqueSlug(
              normalized.slug,
              categories
            ),
          };

        setCategories(
          (
            currentCategories
          ) => [
            ...currentCategories,
            newCategory,
          ]
        );

        return newCategory;
      },
      [categories]
    );

  /*
   * =========================================================
   * KATEGORİ GÜNCELLE
   * =========================================================
   */

  const updateCategory =
    useCallback(
      (
        categoryId: string,
        input: UpdateCategoryInput
      ) => {
        const currentCategory =
          categories.find(
            (category) =>
              category.id ===
              categoryId
          );

        if (
          !currentCategory
        ) {
          return undefined;
        }

        const mergedInput:
          CreateCategoryInput =
          {
            slug:
              input.slug ??
              currentCategory.slug,

            name:
              input.name ??
              currentCategory.name,

            eyebrow:
              input.eyebrow ??
              currentCategory.eyebrow,

            image:
              input.image ??
              currentCategory.image,

            order:
              input.order ??
              currentCategory.order,

            isActive:
              input.isActive ??
              currentCategory.isActive,
          };

        const normalized =
          normalizeCategoryInput(
            mergedInput
          );

        const updatedCategory:
          Category =
          {
            ...currentCategory,
            ...normalized,

            slug: createUniqueSlug(
              normalized.slug,
              categories,
              categoryId
            ),
          };

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
      (
        categoryId: string
      ) => {
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
      (
        categoryId: string
      ) => {
        setCategories(
          (
            currentCategories
          ) =>
            currentCategories.map(
              (category) =>
                category.id ===
                categoryId
                  ? {
                      ...category,

                      isActive:
                        !category.isActive,
                    }
                  : category
            )
        );
      },
      []
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
   *
   * Demo kategoriye dönmez.
   * =========================================================
   */

  const resetCategories =
    useCallback(() => {
      setCategories([]);
    }, []);

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