import { NextResponse } from "next/server";

import {
  Currency,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

type CreateProductRequestBody = {
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
 * SERIALIZER
 * ============================================================
 */

type ProductWithRelations =
  Awaited<
    ReturnType<
      typeof getProductById
    >
  >;

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

export async function GET() {
  try {
    const products =
      await prisma.product.findMany({
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

        orderBy: [
          {
            order: "asc",
          },

          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json(
      {
        success: true,

        products:
          products.map(
            serializeProduct
          ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Ürünler alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Ürünler alınırken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * POST
 * ============================================================
 */

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as
        CreateProductRequestBody;

    /*
     * ========================================================
     * NORMALIZATION
     * ========================================================
     */

    const slug =
      isString(body.slug)
        ? normalizeSlug(
            body.slug
          )
        : "";

    const categoryId =
      isString(
        body.categoryId
      )
        ? body.categoryId.trim()
        : "";

    const nameTr =
      isString(body.name?.tr)
        ? body.name.tr.trim()
        : "";

    const nameEn =
      isString(body.name?.en)
        ? body.name.en.trim()
        : "";

    const nameAr =
      isString(body.name?.ar)
        ? body.name.ar.trim()
        : "";

    const shortDescriptionTr =
      isString(
        body.shortDescription?.tr
      )
        ? body.shortDescription.tr.trim()
        : "";

    const shortDescriptionEn =
      isString(
        body.shortDescription?.en
      )
        ? body.shortDescription.en.trim()
        : "";

    const shortDescriptionAr =
      isString(
        body.shortDescription?.ar
      )
        ? body.shortDescription.ar.trim()
        : "";

    const image =
      isString(body.image)
        ? body.image.trim()
        : "";

    const hoverImage =
      isString(
        body.hoverImage
      )
        ? body.hoverImage.trim()
        : "";

    const price =
      isNonNegativeNumber(
        body.price
      )
        ? body.price
        : -1;

    const currency =
      isSupportedCurrency(
        body.currency
      )
        ? body.currency
        : null;

    const colors =
      normalizeColors(
        body.colors
      );

    const order =
      isNonNegativeInteger(
        body.order
      )
        ? body.order
        : 0;

    const stock =
      isNonNegativeInteger(
        body.stock
      )
        ? body.stock
        : -1;

    const isActive =
      isBoolean(
        body.isActive
      )
        ? body.isActive
        : true;

    const isFeatured =
      isBoolean(
        body.isFeatured
      )
        ? body.isFeatured
        : false;

    const isNew =
      isBoolean(body.isNew)
        ? body.isNew
        : false;

    /*
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    if (
      !slug ||
      !categoryId ||
      !nameTr ||
      !nameEn ||
      !nameAr ||
      !shortDescriptionTr ||
      !shortDescriptionEn ||
      !shortDescriptionAr ||
      !image
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

    if (price < 0) {
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

    if (stock < 0) {
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

    if (!currency) {
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

    /*
     * ========================================================
     * CATEGORY CHECK
     * ========================================================
     */

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

    /*
     * ========================================================
     * SLUG CHECK
     * ========================================================
     */

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          slug,
        },

        select: {
          id: true,
        },
      });

    if (existingProduct) {
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

    /*
     * ========================================================
     * CREATE PRODUCT + IMAGES + COLORS
     * ========================================================
     */

    const createdProduct =
      await prisma.$transaction(
        async (tx) => {
          const product =
            await tx.product.create({
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

                stock,

                order,

                isActive,

                isFeatured,

                isNew,
              },
            });

          /*
           * --------------------------------------------------
           * IMAGES
           * --------------------------------------------------
           */

          await tx.productImage.create({
            data: {
              productId:
                product.id,

              url: image,

              order: 0,

              isPrimary:
                true,
            },
          });

          if (hoverImage) {
            await tx.productImage.create({
              data: {
                productId:
                  product.id,

                url:
                  hoverImage,

                order: 1,

                isPrimary:
                  false,
              },
            });
          }

          /*
           * --------------------------------------------------
           * COLORS
           * --------------------------------------------------
           */

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
                    productId:
                      product.id,

                    value:
                      color,

                    order:
                      index,
                  })
                ),
            });
          }

          return product;
        }
      );

    /*
     * İlişkileriyle yeniden getiriyoruz.
     */

    const product =
      await getProductById(
        createdProduct.id
      );

    if (!product) {
      throw new Error(
        "Oluşturulan ürün tekrar alınamadı."
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
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Ürün oluşturulamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Ürün oluşturulurken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}