import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type CategoryRouteProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

type UpdateCategoryRequestBody = {
  slug?: unknown;

  name?: {
    tr?: unknown;
    en?: unknown;
    ar?: unknown;
  };

  eyebrow?: {
    tr?: unknown;
    en?: unknown;
    ar?: unknown;
  };

  image?: unknown;

  order?: unknown;

  isActive?: unknown;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategoryName(
  value: string,
  locale: "tr" | "en" | "ar"
) {
  const trimmed = value.trim();

  if (locale === "ar") {
    return trimmed;
  }

  return trimmed.toLocaleUpperCase(
    locale === "tr"
      ? "tr-TR"
      : "en-US"
  );
}

function serializeCategory(category: {
  id: string;
  slug: string;

  nameTr: string;
  nameEn: string;
  nameAr: string;

  eyebrowTr: string;
  eyebrowEn: string;
  eyebrowAr: string;

  imageUrl: string;

  order: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: category.id,

    slug: category.slug,

    name: {
      tr: category.nameTr,
      en: category.nameEn,
      ar: category.nameAr,
    },

    eyebrow: {
      tr: category.eyebrowTr,
      en: category.eyebrowEn,
      ar: category.eyebrowAr,
    },

    image: category.imageUrl,

    order: category.order,

    isActive: category.isActive,

    createdAt:
      category.createdAt.toISOString(),

    updatedAt:
      category.updatedAt.toISOString(),
  };
}

/*
 * ============================================================
 * GET
 * ============================================================
 */

export async function GET(
  _request: Request,
  { params }: CategoryRouteProps
) {
  try {
    const { categoryId } =
      await params;

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kategori bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        category:
          serializeCategory(
            category
          ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Kategori alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Kategori alınırken bir hata oluştu.",
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
  { params }: CategoryRouteProps
) {
  try {
    const { categoryId } =
      await params;

    const currentCategory =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!currentCategory) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kategori bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      (await request.json()) as
        UpdateCategoryRequestBody;

    /*
     * ========================================================
     * SLUG
     * ========================================================
     */

    let slug =
      currentCategory.slug;

    if (
      typeof body.slug ===
      "string"
    ) {
      slug = normalizeSlug(
        body.slug
      );

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Geçerli bir kategori slug değeri girilmelidir.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * Aynı slug başka kategoride var mı?
     */
    if (
      slug !==
      currentCategory.slug
    ) {
      const existingCategory =
        await prisma.category.findUnique(
          {
            where: {
              slug,
            },

            select: {
              id: true,
            },
          }
        );

      if (
        existingCategory &&
        existingCategory.id !==
          categoryId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Bu kategori slug değeri zaten kullanılıyor.",
          },
          {
            status: 409,
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
      currentCategory.nameTr;

    let nameEn =
      currentCategory.nameEn;

    let nameAr =
      currentCategory.nameAr;

    if (
      typeof body.name?.tr ===
      "string"
    ) {
      nameTr =
        normalizeCategoryName(
          body.name.tr,
          "tr"
        );
    }

    if (
      typeof body.name?.en ===
      "string"
    ) {
      nameEn =
        normalizeCategoryName(
          body.name.en,
          "en"
        );
    }

    if (
      typeof body.name?.ar ===
      "string"
    ) {
      nameAr =
        normalizeCategoryName(
          body.name.ar,
          "ar"
        );
    }

    /*
     * ========================================================
     * EYEBROW
     * ========================================================
     */

    let eyebrowTr =
      currentCategory.eyebrowTr;

    let eyebrowEn =
      currentCategory.eyebrowEn;

    let eyebrowAr =
      currentCategory.eyebrowAr;

    if (
      typeof body.eyebrow?.tr ===
      "string"
    ) {
      eyebrowTr =
        body.eyebrow.tr.trim();
    }

    if (
      typeof body.eyebrow?.en ===
      "string"
    ) {
      eyebrowEn =
        body.eyebrow.en.trim();
    }

    if (
      typeof body.eyebrow?.ar ===
      "string"
    ) {
      eyebrowAr =
        body.eyebrow.ar.trim();
    }

    /*
     * ========================================================
     * IMAGE
     * ========================================================
     */

    let imageUrl =
      currentCategory.imageUrl;

    if (
      typeof body.image ===
      "string"
    ) {
      imageUrl =
        body.image.trim();
    }

    /*
     * ========================================================
     * ORDER
     * ========================================================
     */

    let order =
      currentCategory.order;

    if (
      typeof body.order ===
      "number"
    ) {
      if (
        !Number.isInteger(
          body.order
        ) ||
        body.order < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Kategori sıralaması sıfır veya pozitif bir tam sayı olmalıdır.",
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
     * ACTIVE
     * ========================================================
     */

    let isActive =
      currentCategory.isActive;

    if (
      typeof body.isActive ===
      "boolean"
    ) {
      isActive =
        body.isActive;
    }

    /*
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    if (
      !nameTr ||
      !nameEn ||
      !nameAr ||
      !eyebrowTr ||
      !eyebrowEn ||
      !eyebrowAr ||
      !imageUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kategori bilgileri eksik.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================================
     * UPDATE
     * ========================================================
     */

    const category =
      await prisma.category.update({
        where: {
          id: categoryId,
        },

        data: {
          slug,

          nameTr,
          nameEn,
          nameAr,

          eyebrowTr,
          eyebrowEn,
          eyebrowAr,

          imageUrl,

          order,

          isActive,
        },
      });

    return NextResponse.json(
      {
        success: true,

        category:
          serializeCategory(
            category
          ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Kategori güncellenemedi:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Kategori güncellenirken bir hata oluştu.",
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
  { params }: CategoryRouteProps
) {
  try {
    const { categoryId } =
      await params;

    /*
     * Kategoriyi bağlı ürün sayısıyla birlikte getir.
     */
    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },

        select: {
          id: true,

          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kategori bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Bağlı ürün varsa kategoriyi silmiyoruz.
     *
     * Prisma şemasında Product → Category ilişkisi
     * zaten onDelete: Restrict.
     *
     * Buradaki kontrol kullanıcıya daha anlaşılır
     * bir cevap verebilmek için.
     */
    if (
      category._count.products >
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          code:
            "CATEGORY_HAS_PRODUCTS",

          message:
            "Bu kategoriye bağlı ürünler bulunduğu için kategori silinemez.",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
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
      "Kategori silinemedi:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Kategori silinirken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}