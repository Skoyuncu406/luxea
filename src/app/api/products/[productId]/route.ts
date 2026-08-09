import { NextResponse } from "next/server";

import { Currency } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type ProductRouteProps = {
  params: Promise<{
    productId: string;
  }>;
};

type UpdateProductRequestBody = {
  slug?: unknown;

  categoryId?: unknown;

  name?: {
    tr?: unknown;
    en?: unknown;
    ar?: unknown;
  };

  shortDescription?: {
    tr?: unknown;
    en?: unknown;
    ar?: unknown;
  };

  image?: unknown;

  hoverImage?: unknown;

  price?: unknown;

  currency?: unknown;

  colors?: unknown;

  order?: unknown;

  stock?: unknown;

  isActive?: unknown;

  isFeatured?: unknown;

  isNew?: unknown;
};

const SUPPORTED_CURRENCIES = [
  "EUR",
  "USD",
  "GBP",
] as const;

type SupportedCurrency =
  (typeof SUPPORTED_CURRENCIES)[number];

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function normalizeSlug(
  value: string
) {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
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

function isString(
  value: unknown
): value is string {
  return (
    typeof value ===
    "string"
  );
}

function isBoolean(
  value: unknown
): value is boolean {
  return (
    typeof value ===
    "boolean"
  );
}

function isNonNegativeInteger(
  value: unknown
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isInteger(value) &&
    value >= 0
  );
}

function isNonNegativeNumber(
  value: unknown
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function isSupportedCurrency(
  value: unknown
): value is SupportedCurrency {
  return (
    typeof value ===
      "string" &&
    SUPPORTED_CURRENCIES.includes(
      value as SupportedCurrency
    )
  );
}

function normalizeColors(
  value: unknown
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            color
          ): color is string =>
            typeof color ===
            "string"
        )
        .map((color) =>
          color.trim()
        )
        .filter(Boolean)
    )
  );
}

/*
 * ============================================================
 * PRODUCT QUERY
 * ============================================================
 */

async function getProductById(
  productId: string
) {
  return prisma.product.findUnique({
    where: {
      id: productId,
    },

    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },

      colors: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

type ProductWithRelations =
  Awaited<
    ReturnType<
      typeof getProductById
    >
  >;

/*
 * ============================================================
 * SERIALIZER
 * ============================================================
 */

function serializeProduct(
  product:
    NonNullable<ProductWithRelations>
) {
  const sortedImages =
    [...product.images].sort(
      (a, b) =>
        a.order - b.order
    );

  const primaryImage =
    sortedImages.find(
      (image) =>
        image.isPrimary
    ) ??
    sortedImages[0];

  const hoverImage =
    sortedImages.find(
      (image) =>
        !image.isPrimary
    );

  return {
    id: product.id,

    slug: product.slug,

    categoryId:
      product.categoryId,

    name: {
      tr: product.nameTr,
      en: product.nameEn,
      ar: product.nameAr,
    },

    shortDescription: {
      tr:
        product.shortDescriptionTr,

      en:
        product.shortDescriptionEn,

      ar:
        product.shortDescriptionAr,
    },

    image:
      primaryImage?.url ?? "",

    hoverImage:
      hoverImage?.url ||
      undefined,

    price:
      Number(product.price),

    currency:
      product.currency,

    colors:
      product.colors.map(
        (color) =>
          color.value
      ),

    order:
      product.order,

    stock:
      product.stock,

    isActive:
      product.isActive,

    isFeatured:
      product.isFeatured,

    isNew:
      product.isNew,
  };
}

/*
 * ============================================================
 * GET
 * ============================================================
 */

export async function GET(
  _request: Request,
  {
    params,
  }: ProductRouteProps
) {
  try {
    const {
      productId,
    } = await params;

    const product =
      await getProductById(
        productId
      );

    if (!product) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Ürün bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        product:
          serializeProduct(
            product
          ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Ürün alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Ürün alınırken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * PATCH
 * ============================================================
 */

export async function PATCH(
  request: Request,
  {
    params,
  }: ProductRouteProps
) {
  try {
    const {
      productId,
    } = await params;

    /*
     * --------------------------------------------------------
     * Mevcut ürün
     * --------------------------------------------------------
     */

    const currentProduct =
      await getProductById(
        productId
      );

    if (!currentProduct) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Ürün bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      (await request.json()) as
        UpdateProductRequestBody;

    /*
     * ========================================================
     * MEVCUT IMAGE DEĞERLERİ
     * ========================================================
     */

    const currentPrimaryImage =
      currentProduct.images.find(
        (image) =>
          image.isPrimary
      ) ??
      currentProduct.images[0];

    const currentHoverImage =
      currentProduct.images.find(
        (image) =>
          !image.isPrimary
      );

    /*
     * ========================================================
     * SLUG
     * ========================================================
     */

    let slug =
      currentProduct.slug;

    if (
      isString(body.slug)
    ) {
      slug =
        normalizeSlug(
          body.slug
        );

      if (!slug) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Geçerli bir ürün slug değeri girilmelidir.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * Slug başka üründe var mı?
     */

    if (
      slug !==
      currentProduct.slug
    ) {
      const existingProduct =
        await prisma.product.findUnique({
          where: {
            slug,
          },

          select: {
            id: true,
          },
        });

      if (
        existingProduct &&
        existingProduct.id !==
          productId
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Bu ürün slug değeri zaten kullanılıyor.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /*
     * ========================================================
     * CATEGORY
     * ========================================================
     */

    let categoryId =
      currentProduct.categoryId;

    if (
      isString(
        body.categoryId
      )
    ) {
      categoryId =
        body.categoryId.trim();

      if (!categoryId) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Bir kategori seçilmelidir.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (
      categoryId !==
      currentProduct.categoryId
    ) {
      const category =
        await prisma.category.findUnique({
          where: {
            id: categoryId,
          },

          select: {
            id: true,
          },
        });

      if (!category) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seçilen kategori bulunamadı.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * ========================================================
     * NAME
     * ========================================================
     */

    let nameTr =
      currentProduct.nameTr;

    let nameEn =
      currentProduct.nameEn;

    let nameAr =
      currentProduct.nameAr;

    if (
      isString(body.name?.tr)
    ) {
      nameTr =
        body.name.tr.trim();
    }

    if (
      isString(body.name?.en)
    ) {
      nameEn =
        body.name.en.trim();
    }

    if (
      isString(body.name?.ar)
    ) {
      nameAr =
        body.name.ar.trim();
    }

    /*
     * ========================================================
     * SHORT DESCRIPTION
     * ========================================================
     */

    let shortDescriptionTr =
      currentProduct.shortDescriptionTr;

    let shortDescriptionEn =
      currentProduct.shortDescriptionEn;

    let shortDescriptionAr =
      currentProduct.shortDescriptionAr;

    if (
      isString(
        body.shortDescription?.tr
      )
    ) {
      shortDescriptionTr =
        body.shortDescription.tr.trim();
    }

    if (
      isString(
        body.shortDescription?.en
      )
    ) {
      shortDescriptionEn =
        body.shortDescription.en.trim();
    }

    if (
      isString(
        body.shortDescription?.ar
      )
    ) {
      shortDescriptionAr =
        body.shortDescription.ar.trim();
    }

    /*
     * ========================================================
     * IMAGE
     * ========================================================
     */

    let image =
      currentPrimaryImage?.url ??
      "";

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "image"
      )
    ) {
      image =
        isString(body.image)
          ? body.image.trim()
          : "";
    }

    if (!image) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Ana ürün görseli zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================================
     * HOVER IMAGE
     *
     * Alan request içinde yoksa mevcut değer korunur.
     * "" gönderilirse hover image silinir.
     * ========================================================
     */

    let hoverImage =
      currentHoverImage?.url ??
      "";

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "hoverImage"
      )
    ) {
      hoverImage =
        isString(
          body.hoverImage
        )
          ? body.hoverImage.trim()
          : "";
    }

    /*
     * ========================================================
     * PRICE
     * ========================================================
     */

    let price =
      Number(
        currentProduct.price
      );

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "price"
      )
    ) {
      if (
        !isNonNegativeNumber(
          body.price
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Geçerli bir ürün fiyatı girilmelidir.",
          },
          {
            status: 400,
          }
        );
      }

      price =
        body.price;
    }

    /*
     * ========================================================
     * CURRENCY
     * ========================================================
     */

    let currency:
      SupportedCurrency =
      currentProduct.currency;

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "currency"
      )
    ) {
      if (
        !isSupportedCurrency(
          body.currency
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Desteklenen bir para birimi seçilmelidir.",
          },
          {
            status: 400,
          }
        );
      }

      currency =
        body.currency;
    }

    /*
     * ========================================================
     * ORDER
     * ========================================================
     */

    let order =
      currentProduct.order;

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "order"
      )
    ) {
      if (
        !isNonNegativeInteger(
          body.order
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Sıralama sıfır veya pozitif bir tam sayı olmalıdır.",
          },
          {
            status: 400,
          }
        );
      }

      order =
        body.order;
    }

    /*
     * ========================================================
     * STOCK
     * ========================================================
     */

    let stock =
      currentProduct.stock;

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "stock"
      )
    ) {
      if (
        !isNonNegativeInteger(
          body.stock
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Stok sıfır veya pozitif bir tam sayı olmalıdır.",
          },
          {
            status: 400,
          }
        );
      }

      stock =
        body.stock;
    }

    /*
     * ========================================================
     * BOOLEAN FLAGS
     * ========================================================
     */

    let isActive =
      currentProduct.isActive;

    let isFeatured =
      currentProduct.isFeatured;

    let isNew =
      currentProduct.isNew;

    if (
      isBoolean(
        body.isActive
      )
    ) {
      isActive =
        body.isActive;
    }

    if (
      isBoolean(
        body.isFeatured
      )
    ) {
      isFeatured =
        body.isFeatured;
    }

    if (
      isBoolean(body.isNew)
    ) {
      isNew =
        body.isNew;
    }

    /*
     * ========================================================
     * COLORS
     *
     * colors request içinde yoksa mevcut renkler korunur.
     * [] gönderilirse tüm renkler kaldırılır.
     * ========================================================
     */

    let colors =
      currentProduct.colors.map(
        (color) =>
          color.value
      );

    const colorsWereProvided =
      Object.prototype.hasOwnProperty.call(
        body,
        "colors"
      );

    if (colorsWereProvided) {
      if (
        !Array.isArray(
          body.colors
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Ürün renkleri geçersiz.",
          },
          {
            status: 400,
          }
        );
      }

      colors =
        normalizeColors(
          body.colors
        );
    }

    /*
     * ========================================================
     * REQUIRED FIELD VALIDATION
     * ========================================================
     */

    if (
      !nameTr ||
      !nameEn ||
      !nameAr ||
      !shortDescriptionTr ||
      !shortDescriptionEn ||
      !shortDescriptionAr
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Ürün bilgileri eksik.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================================
     * TRANSACTION
     * ========================================================
     */

    await prisma.$transaction(
      async (tx) => {
        /*
         * ----------------------------------------------------
         * PRODUCT
         * ----------------------------------------------------
         */

        await tx.product.update({
          where: {
            id: productId,
          },

          data: {
            slug,

            categoryId,

            nameTr,
            nameEn,
            nameAr,

            shortDescriptionTr,
            shortDescriptionEn,
            shortDescriptionAr,

            price,

            currency:
              currency as Currency,

            order,

            stock,

            isActive,

            isFeatured,

            isNew,
          },
        });

        /*
         * ----------------------------------------------------
         * IMAGES
         *
         * Şimdilik frontend modeli:
         *
         * image      → primary
         * hoverImage → secondary
         *
         * İleride üçüncü görsel desteğinde bu yapı
         * genişletilebilir.
         * ----------------------------------------------------
         */

        await tx.productImage.deleteMany({
          where: {
            productId,
          },
        });

        await tx.productImage.create({
          data: {
            productId,

            url: image,

            order: 0,

            isPrimary:
              true,
          },
        });

        if (hoverImage) {
          await tx.productImage.create({
            data: {
              productId,

              url:
                hoverImage,

              order: 1,

              isPrimary:
                false,
            },
          });
        }

        /*
         * ----------------------------------------------------
         * COLORS
         * ----------------------------------------------------
         */

        if (colorsWereProvided) {
          await tx.productColor.deleteMany({
            where: {
              productId,
            },
          });

          if (
            colors.length > 0
          ) {
            await tx.productColor.createMany({
              data:
                colors.map(
                  (
                    color,
                    index
                  ) => ({
                    productId,

                    value:
                      color,

                    order:
                      index,
                  })
                ),
            });
          }
        }
      }
    );

    /*
     * Güncellenmiş ürünü ilişkileriyle
     * yeniden getir.
     */

    const updatedProduct =
      await getProductById(
        productId
      );

    if (!updatedProduct) {
      throw new Error(
        "Güncellenen ürün tekrar alınamadı."
      );
    }

    return NextResponse.json(
      {
        success: true,

        product:
          serializeProduct(
            updatedProduct
          ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Ürün güncellenemedi:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Ürün güncellenirken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * DELETE
 * ============================================================
 */

export async function DELETE(
  _request: Request,
  {
    params,
  }: ProductRouteProps
) {
  try {
    const {
      productId,
    } = await params;

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },

        select: {
          id: true,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Ürün bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Prisma şemamız sayesinde:
     *
     * ProductImage → Cascade
     * ProductColor → Cascade
     * OrderItem    → SetNull
     *
     * Dolayısıyla geçmiş sipariş snapshot'ları
     * korunurken ürün güvenle silinebilir.
     */

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Ürün silinemedi:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Ürün silinirken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}