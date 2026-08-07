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
  Product,
  ProductLocalizedText,
} from "@/types/product";

export type ProductCurrency =
  Product["currency"];

export type CreateProductInput = {
  slug: string;
  categoryId: string;

  name: ProductLocalizedText;
  shortDescription: ProductLocalizedText;

  image: string;
  hoverImage?: string;

  price: number;
  currency: ProductCurrency;

  colors: string[];

  order: number;
  stock: number;

  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
};

export type UpdateProductInput =
  Partial<CreateProductInput>;

export type ProductStockItem = {
  productId: string;
  quantity: number;
};

type ProductContextValue = {
  products: Product[];

  isLoaded: boolean;

  createProduct: (
    input: CreateProductInput
  ) => Product;

  updateProduct: (
    productId: string,
    input: UpdateProductInput
  ) => Product | undefined;

  deleteProduct: (
    productId: string
  ) => void;

  findProductById: (
    productId: string
  ) => Product | undefined;

  findProductBySlug: (
    slug: string
  ) => Product | undefined;

  toggleProductActive: (
    productId: string
  ) => void;

  toggleProductFeatured: (
    productId: string
  ) => void;

  toggleProductNew: (
    productId: string
  ) => void;

  decreaseProductStocks: (
    items: ProductStockItem[]
  ) => boolean;

  restoreProductStocks: (
    items: ProductStockItem[]
  ) => void;

  resetProducts: () => void;
};

type ProductProviderProps = {
  children: ReactNode;
};

const PRODUCTS_STORAGE_KEY =
  "luxea-products";

const SUPPORTED_CURRENCIES: ProductCurrency[] =
  [
    "EUR",
    "USD",
    "GBP",
  ];

const ProductContext =
  createContext<ProductContextValue | null>(
    null
  );

/*
 * =============================================================
 * PARA BİRİMİ DOĞRULAMA
 * =============================================================
 */

function isProductCurrency(
  value: unknown
): value is ProductCurrency {
  return (
    typeof value === "string" &&
    SUPPORTED_CURRENCIES.includes(
      value as ProductCurrency
    )
  );
}

/*
 * =============================================================
 * ÇOK DİLLİ METİN DOĞRULAMA
 * =============================================================
 */

function isLocalizedText(
  value: unknown
): value is ProductLocalizedText {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const localizedValue =
    value as Partial<ProductLocalizedText>;

  return (
    typeof localizedValue.tr ===
      "string" &&
    typeof localizedValue.en ===
      "string" &&
    typeof localizedValue.ar ===
      "string"
  );
}

/*
 * =============================================================
 * PRODUCT DOĞRULAMA
 * =============================================================
 */

function isValidProduct(
  value: unknown
): value is Product {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const product =
    value as Partial<Product>;

  return (
    typeof product.id ===
      "string" &&
    typeof product.slug ===
      "string" &&
    typeof product.categoryId ===
      "string" &&
    isLocalizedText(
      product.name
    ) &&
    isLocalizedText(
      product.shortDescription
    ) &&
    typeof product.image ===
      "string" &&
    (
      product.hoverImage ===
        undefined ||
      typeof product.hoverImage ===
        "string"
    ) &&
    typeof product.price ===
      "number" &&
    Number.isFinite(
      product.price
    ) &&
    product.price >= 0 &&
    isProductCurrency(
      product.currency
    ) &&
    Array.isArray(
      product.colors
    ) &&
    product.colors.every(
      (color) =>
        typeof color ===
        "string"
    ) &&
    typeof product.order ===
      "number" &&
    Number.isFinite(
      product.order
    ) &&
    typeof product.stock ===
      "number" &&
    Number.isFinite(
      product.stock
    ) &&
    product.stock >= 0 &&
    typeof product.isActive ===
      "boolean" &&
    typeof product.isFeatured ===
      "boolean" &&
    typeof product.isNew ===
      "boolean"
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
      "en-US"
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
 * PRODUCT INPUT NORMALİZASYONU
 * =============================================================
 */

function normalizeProductInput(
  input: CreateProductInput
): CreateProductInput {
  return {
    ...input,

    slug: normalizeSlug(
      input.slug
    ),

    categoryId:
      input.categoryId.trim(),

    name: {
      tr: input.name.tr.trim(),
      en: input.name.en.trim(),
      ar: input.name.ar.trim(),
    },

    shortDescription: {
      tr: input.shortDescription.tr.trim(),
      en: input.shortDescription.en.trim(),
      ar: input.shortDescription.ar.trim(),
    },

    image:
      input.image.trim(),

    hoverImage:
      input.hoverImage?.trim() ||
      undefined,

    price: Math.max(
      0,
      input.price
    ),

    colors: Array.from(
      new Set(
        input.colors
          .map((color) =>
            color.trim()
          )
          .filter(Boolean)
      )
    ),

    order: Math.max(
      0,
      Math.trunc(
        input.order
      )
    ),

    stock: Math.max(
      0,
      Math.trunc(
        input.stock
      )
    ),
  };
}

/*
 * =============================================================
 * PRODUCT ID
 * =============================================================
 */

function createProductId() {
  if (
    typeof window !==
      "undefined" &&
    window.crypto
      ?.randomUUID
  ) {
    return `product-${window.crypto.randomUUID()}`;
  }

  return `product-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/*
 * =============================================================
 * UNIQUE SLUG
 * =============================================================
 */

function createUniqueSlug(
  requestedSlug: string,
  products: Product[],
  ignoredProductId?: string
) {
  const baseSlug =
    normalizeSlug(
      requestedSlug
    ) || "product";

  const slugExists = (
    candidateSlug: string
  ) =>
    products.some(
      (product) =>
        product.id !==
          ignoredProductId &&
        product.slug ===
          candidateSlug
    );

  if (
    !slugExists(
      baseSlug
    )
  ) {
    return baseSlug;
  }

  let suffix = 2;

  while (
    slugExists(
      `${baseSlug}-${suffix}`
    )
  ) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

/*
 * =============================================================
 * STOK ITEM NORMALİZASYONU
 * =============================================================
 */

function normalizeStockItems(
  items: ProductStockItem[]
) {
  return items
    .filter(
      (item) =>
        typeof item.productId ===
          "string" &&
        item.productId.trim() !==
          "" &&
        Number.isInteger(
          item.quantity
        ) &&
        item.quantity > 0
    )
    .reduce<
      ProductStockItem[]
    >(
      (
        result,
        item
      ) => {
        const existingItem =
          result.find(
            (currentItem) =>
              currentItem.productId ===
              item.productId
          );

        if (
          existingItem
        ) {
          existingItem.quantity +=
            item.quantity;

          return result;
        }

        result.push({
          productId:
            item.productId,
          quantity:
            item.quantity,
        });

        return result;
      },
      []
    );
}

/*
 * =============================================================
 * PRODUCT PROVIDER
 * =============================================================
 */

export function ProductProvider({
  children,
}: ProductProviderProps) {
  /*
   * Demo ürün yok.
   *
   * Sistem her zaman boş ürün listesiyle başlar.
   */
  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  /*
   * =========================================================
   * LOCAL STORAGE'DAN ÜRÜNLERİ YÜKLE
   * =========================================================
   */

  useEffect(() => {
    try {
      const storedProducts =
        window.localStorage.getItem(
          PRODUCTS_STORAGE_KEY
        );

      /*
       * Hiç kayıt yoksa sistem boş kalır.
       * Demo ürün yüklenmez.
       */
      if (
        !storedProducts
      ) {
        setProducts([]);
        return;
      }

      const parsedProducts:
        unknown =
        JSON.parse(
          storedProducts
        );

      /*
       * Geçersiz veri varsa yine boş liste.
       */
      if (
        !Array.isArray(
          parsedProducts
        )
      ) {
        setProducts([]);
        return;
      }

      /*
       * Yalnızca geçerli admin ürünlerini yükle.
       */
      const validProducts =
        parsedProducts.filter(
          isValidProduct
        );

      setProducts(
        validProducts
      );
    } catch (error) {
      console.error(
        "Ürünler yüklenemedi:",
        error
      );

      setProducts([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /*
   * =========================================================
   * ÜRÜNLERİ LOCAL STORAGE'A KAYDET
   * =========================================================
   */

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(
          products
        )
      );
    } catch (error) {
      console.error(
        "Ürünler kaydedilemedi:",
        error
      );
    }
  }, [
    products,
    isLoaded,
  ]);

  /*
   * =========================================================
   * ÜRÜN OLUŞTUR
   * =========================================================
   */

  const createProduct =
    useCallback(
      (
        input: CreateProductInput
      ): Product => {
        const normalizedInput =
          normalizeProductInput(
            input
          );

        const newProduct: Product =
          {
            id: createProductId(),

            ...normalizedInput,

            slug: createUniqueSlug(
              normalizedInput.slug,
              products
            ),
          };

        setProducts(
          (
            currentProducts
          ) => [
            newProduct,
            ...currentProducts,
          ]
        );

        return newProduct;
      },
      [products]
    );

  /*
   * =========================================================
   * ÜRÜN GÜNCELLE
   * =========================================================
   */

  const updateProduct =
    useCallback(
      (
        productId: string,
        input: UpdateProductInput
      ) => {
        const currentProduct =
          products.find(
            (product) =>
              product.id ===
              productId
          );

        if (
          !currentProduct
        ) {
          return undefined;
        }

        const mergedInput:
          CreateProductInput =
          {
            slug:
              input.slug ??
              currentProduct.slug,

            categoryId:
              input.categoryId ??
              currentProduct.categoryId,

            name:
              input.name ??
              currentProduct.name,

            shortDescription:
              input.shortDescription ??
              currentProduct.shortDescription,

            image:
              input.image ??
              currentProduct.image,

            hoverImage:
              input.hoverImage ??
              currentProduct.hoverImage,

            price:
              input.price ??
              currentProduct.price,

            currency:
              input.currency ??
              currentProduct.currency,

            colors:
              input.colors ??
              currentProduct.colors,

            order:
              input.order ??
              currentProduct.order,

            stock:
              input.stock ??
              currentProduct.stock,

            isActive:
              input.isActive ??
              currentProduct.isActive,

            isFeatured:
              input.isFeatured ??
              currentProduct.isFeatured,

            isNew:
              input.isNew ??
              currentProduct.isNew,
          };

        const normalizedInput =
          normalizeProductInput(
            mergedInput
          );

        const updatedProduct:
          Product =
          {
            ...currentProduct,
            ...normalizedInput,

            slug: createUniqueSlug(
              normalizedInput.slug,
              products,
              productId
            ),
          };

        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.map(
              (product) =>
                product.id ===
                productId
                  ? updatedProduct
                  : product
            )
        );

        return updatedProduct;
      },
      [products]
    );

  /*
   * =========================================================
   * ÜRÜN SİL
   * =========================================================
   */

  const deleteProduct =
    useCallback(
      (
        productId: string
      ) => {
        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.filter(
              (product) =>
                product.id !==
                productId
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

  const findProductById =
    useCallback(
      (
        productId: string
      ) =>
        products.find(
          (product) =>
            product.id ===
            productId
        ),
      [products]
    );

  /*
   * =========================================================
   * SLUG İLE BUL
   * =========================================================
   */

  const findProductBySlug =
    useCallback(
      (
        slug: string
      ) => {
        const normalizedSlug =
          normalizeSlug(
            slug
          );

        return products.find(
          (product) =>
            product.slug ===
            normalizedSlug
        );
      },
      [products]
    );

  /*
   * =========================================================
   * AKTİF / PASİF
   * =========================================================
   */

  const toggleProductActive =
    useCallback(
      (
        productId: string
      ) => {
        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.map(
              (product) =>
                product.id ===
                productId
                  ? {
                      ...product,
                      isActive:
                        !product.isActive,
                    }
                  : product
            )
        );
      },
      []
    );

  /*
   * =========================================================
   * ÖNE ÇIKAN
   * =========================================================
   */

  const toggleProductFeatured =
    useCallback(
      (
        productId: string
      ) => {
        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.map(
              (product) =>
                product.id ===
                productId
                  ? {
                      ...product,
                      isFeatured:
                        !product.isFeatured,
                    }
                  : product
            )
        );
      },
      []
    );

  /*
   * =========================================================
   * YENİ ÜRÜN
   * =========================================================
   */

  const toggleProductNew =
    useCallback(
      (
        productId: string
      ) => {
        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.map(
              (product) =>
                product.id ===
                productId
                  ? {
                      ...product,
                      isNew:
                        !product.isNew,
                    }
                  : product
            )
        );
      },
      []
    );

  /*
   * =========================================================
   * STOK DÜŞÜR
   * =========================================================
   */

  const decreaseProductStocks =
    useCallback(
      (
        items: ProductStockItem[]
      ): boolean => {
        const normalizedItems =
          normalizeStockItems(
            items
          );

        if (
          normalizedItems.length ===
          0
        ) {
          return false;
        }

        /*
         * Önce tüm ürünlerde yeterli stok
         * bulunduğunu kontrol ediyoruz.
         */
        const hasEnoughStock =
          normalizedItems.every(
            (item) => {
              const product =
                products.find(
                  (
                    currentProduct
                  ) =>
                    currentProduct.id ===
                    item.productId
                );

              if (
                !product
              ) {
                return false;
              }

              if (
                !product.isActive
              ) {
                return false;
              }

              return (
                product.stock >=
                item.quantity
              );
            }
          );

        /*
         * Bir ürün bile yetersizse
         * hiçbir stok değişmez.
         */
        if (
          !hasEnoughStock
        ) {
          return false;
        }

        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.map(
              (product) => {
                const stockItem =
                  normalizedItems.find(
                    (item) =>
                      item.productId ===
                      product.id
                  );

                if (
                  !stockItem
                ) {
                  return product;
                }

                return {
                  ...product,

                  stock: Math.max(
                    0,
                    product.stock -
                      stockItem.quantity
                  ),
                };
              }
            )
        );

        return true;
      },
      [products]
    );

  /*
   * =========================================================
   * STOK GERİ YÜKLE
   * =========================================================
   */

  const restoreProductStocks =
    useCallback(
      (
        items: ProductStockItem[]
      ) => {
        const normalizedItems =
          normalizeStockItems(
            items
          );

        if (
          normalizedItems.length ===
          0
        ) {
          return;
        }

        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.map(
              (product) => {
                const stockItem =
                  normalizedItems.find(
                    (item) =>
                      item.productId ===
                      product.id
                  );

                if (
                  !stockItem
                ) {
                  return product;
                }

                return {
                  ...product,

                  stock:
                    product.stock +
                    stockItem.quantity,
                };
              }
            )
        );
      },
      []
    );

  /*
   * =========================================================
   * TÜM ÜRÜNLERİ TEMİZLE
   *
   * Demo ürüne dönmez.
   * =========================================================
   */

  const resetProducts =
    useCallback(() => {
      setProducts([]);
    }, []);

  /*
   * =========================================================
   * CONTEXT VALUE
   * =========================================================
   */

  const value =
    useMemo<ProductContextValue>(
      () => ({
        products,
        isLoaded,

        createProduct,
        updateProduct,
        deleteProduct,

        findProductById,
        findProductBySlug,

        toggleProductActive,
        toggleProductFeatured,
        toggleProductNew,

        decreaseProductStocks,
        restoreProductStocks,

        resetProducts,
      }),
      [
        products,
        isLoaded,

        createProduct,
        updateProduct,
        deleteProduct,

        findProductById,
        findProductBySlug,

        toggleProductActive,
        toggleProductFeatured,
        toggleProductNew,

        decreaseProductStocks,
        restoreProductStocks,

        resetProducts,
      ]
    );

  return (
    <ProductContext.Provider
      value={value}
    >
      {children}
    </ProductContext.Provider>
  );
}

/*
 * =============================================================
 * HOOK
 * =============================================================
 */

export function useProducts() {
  const context =
    useContext(
      ProductContext
    );

  if (!context) {
    throw new Error(
      "useProducts, ProductProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}