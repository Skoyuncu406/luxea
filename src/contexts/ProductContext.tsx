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

/*
 * =============================================================
 * TYPES
 * =============================================================
 */

export type ProductCurrency =
  Product["currency"];

export type CreateProductInput = {
  slug: string;
  categoryId: string;

  name: ProductLocalizedText;
  shortDescription: ProductLocalizedText;

  image: string;
  hoverImage?: string;

  /*
   * Ürün detay galerisinde gösterilecek
   * sınırsız sayıdaki ilave görseller.
   *
   * Ana görsel ve hover görseli
   * bu dizinin içinde tutulmaz.
   */
  additionalImages: string[];

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
  ) => Promise<Product>;

  updateProduct: (
    productId: string,
    input: UpdateProductInput
  ) => Promise<Product | undefined>;

  deleteProduct: (
    productId: string
  ) => Promise<void>;

  findProductById: (
    productId: string
  ) => Product | undefined;

  findProductBySlug: (
    slug: string
  ) => Product | undefined;

  toggleProductActive: (
    productId: string
  ) => Promise<void>;

  toggleProductFeatured: (
    productId: string
  ) => Promise<void>;

  toggleProductNew: (
    productId: string
  ) => Promise<void>;

  decreaseProductStocks: (
    items: ProductStockItem[]
  ) => boolean;

  restoreProductStocks: (
    items: ProductStockItem[]
  ) => void;

  refreshProducts: () => Promise<void>;

  resetProducts: () => Promise<void>;
};

type ProductProviderProps = {
  children: ReactNode;
};

type ProductsApiResponse = {
  success: boolean;
  products?: Product[];
  message?: string;
};

type ProductApiResponse = {
  success: boolean;
  product?: Product;
  message?: string;
};

/*
 * =============================================================
 * CONTEXT
 * =============================================================
 */

const ProductContext =
  createContext<ProductContextValue | null>(
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
 * STOCK NORMALIZATION
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
    .reduce<ProductStockItem[]>(
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

        if (existingItem) {
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
 * RESPONSE
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
 * PROVIDER
 * =============================================================
 */

export function ProductProvider({
  children,
}: ProductProviderProps) {
  /*
   * Artık demo ürün ve localStorage yok.
   *
   * Veri kaynağı:
   *
   * Neon PostgreSQL
   *       ↓
   * Prisma
   *       ↓
   * /api/products
   *       ↓
   * ProductContext
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
   * ÜRÜNLERİ YENİDEN GETİR
   * =========================================================
   */

  const refreshProducts =
    useCallback(
      async () => {
        const response =
          await fetch(
            "/api/products",
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
          await readJsonResponse<ProductsApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Ürünler alınamadı."
          );
        }

        setProducts(
          Array.isArray(
            data.products
          )
            ? data.products
            : []
        );
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

    async function loadProducts() {
      try {
        const response =
          await fetch(
            "/api/products",
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
          await readJsonResponse<ProductsApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Ürünler alınamadı."
          );
        }

        if (!isMounted) {
          return;
        }

        setProducts(
          Array.isArray(
            data.products
          )
            ? data.products
            : []
        );
      } catch (error) {
        console.error(
          "Ürünler database'den yüklenemedi:",
          error
        );

        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * =========================================================
   * ÜRÜN OLUŞTUR
   * =========================================================
   */

  const createProduct =
    useCallback(
      async (
        input: CreateProductInput
      ): Promise<Product> => {
        const response =
          await fetch(
            "/api/products",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify(
                  input
                ),
            }
          );

        const data =
          await readJsonResponse<ProductApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success ||
          !data.product
        ) {
          throw new Error(
            data.message ||
              "Ürün oluşturulamadı."
          );
        }

        const newProduct =
          data.product;

        setProducts(
          (
            currentProducts
          ) =>
            [
              newProduct,
              ...currentProducts,
            ].sort(
              (a, b) =>
                a.order -
                b.order
            )
        );

        return newProduct;
      },
      []
    );

  /*
   * =========================================================
   * ÜRÜN GÜNCELLE
   * =========================================================
   */

  const updateProduct =
    useCallback(
      async (
        productId: string,
        input: UpdateProductInput
      ): Promise<
        Product | undefined
      > => {
        const currentProduct =
          products.find(
            (product) =>
              product.id ===
              productId
          );

        if (!currentProduct) {
          return undefined;
        }

        const response =
          await fetch(
            `/api/products/${encodeURIComponent(
              productId
            )}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify(
                  input
                ),
            }
          );

        const data =
          await readJsonResponse<ProductApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success ||
          !data.product
        ) {
          throw new Error(
            data.message ||
              "Ürün güncellenemedi."
          );
        }

        const updatedProduct =
          data.product;

        setProducts(
          (
            currentProducts
          ) =>
            currentProducts
              .map(
                (product) =>
                  product.id ===
                  productId
                    ? updatedProduct
                    : product
              )
              .sort(
                (a, b) =>
                  a.order -
                  b.order
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
      async (
        productId: string
      ): Promise<void> => {
        const response =
          await fetch(
            `/api/products/${encodeURIComponent(
              productId
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
          await readJsonResponse<ProductApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Ürün silinemedi."
          );
        }

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
   * ACTIVE
   * =========================================================
   */

  const toggleProductActive =
    useCallback(
      async (
        productId: string
      ): Promise<void> => {
        const product =
          products.find(
            (item) =>
              item.id ===
              productId
          );

        if (!product) {
          throw new Error(
            "Ürün bulunamadı."
          );
        }

        const response =
          await fetch(
            `/api/products/${encodeURIComponent(
              productId
            )}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  isActive:
                    !product.isActive,
                }),
            }
          );

        const data =
          await readJsonResponse<ProductApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success ||
          !data.product
        ) {
          throw new Error(
            data.message ||
              "Ürün durumu değiştirilemedi."
          );
        }

        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.map(
              (item) =>
                item.id ===
                productId
                  ? data.product!
                  : item
            )
        );
      },
      [products]
    );

  /*
   * =========================================================
   * FEATURED
   * =========================================================
   */

  const toggleProductFeatured =
    useCallback(
      async (
        productId: string
      ): Promise<void> => {
        const product =
          products.find(
            (item) =>
              item.id ===
              productId
          );

        if (!product) {
          throw new Error(
            "Ürün bulunamadı."
          );
        }

        const response =
          await fetch(
            `/api/products/${encodeURIComponent(
              productId
            )}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  isFeatured:
                    !product.isFeatured,
                }),
            }
          );

        const data =
          await readJsonResponse<ProductApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success ||
          !data.product
        ) {
          throw new Error(
            data.message ||
              "Öne çıkan ürün durumu değiştirilemedi."
          );
        }

        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.map(
              (item) =>
                item.id ===
                productId
                  ? data.product!
                  : item
            )
        );
      },
      [products]
    );

  /*
   * =========================================================
   * NEW
   * =========================================================
   */

  const toggleProductNew =
    useCallback(
      async (
        productId: string
      ): Promise<void> => {
        const product =
          products.find(
            (item) =>
              item.id ===
              productId
          );

        if (!product) {
          throw new Error(
            "Ürün bulunamadı."
          );
        }

        const response =
          await fetch(
            `/api/products/${encodeURIComponent(
              productId
            )}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  isNew:
                    !product.isNew,
                }),
            }
          );

        const data =
          await readJsonResponse<ProductApiResponse>(
            response
          );

        if (
          !response.ok ||
          !data.success ||
          !data.product
        ) {
          throw new Error(
            data.message ||
              "Yeni ürün durumu değiştirilemedi."
          );
        }

        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.map(
              (item) =>
                item.id ===
                productId
                  ? data.product!
                  : item
            )
        );
      },
      [products]
    );

  /*
   * =========================================================
   * STOK DÜŞÜR
   *
   * ŞİMDİLİK CLIENT STATE ÜZERİNDE.
   *
   * Sipariş sistemini PostgreSQL'e taşıdığımız aşamada
   * bu fonksiyon gerçek transaction sistemine geçecek.
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

              if (!product) {
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

        if (!hasEnoughStock) {
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

                if (!stockItem) {
                  return product;
                }

                return {
                  ...product,

                  stock:
                    Math.max(
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
   *
   * ŞİMDİLİK CLIENT STATE ÜZERİNDE.
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

                if (!stockItem) {
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
   * RESET
   *
   * Database'i silmez.
   * Sadece yeniden senkronize eder.
   * =========================================================
   */

  const resetProducts =
    useCallback(
      async (): Promise<void> => {
        await refreshProducts();
      },
      [refreshProducts]
    );

  /*
   * =========================================================
   * VALUE
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

        refreshProducts,

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

        refreshProducts,

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