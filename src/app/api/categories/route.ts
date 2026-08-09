import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type CreateCategoryRequestBody = {
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

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNonNegativeInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0
  );
}

/*
 * ============================================================
 * GET
 * ============================================================
 */

export async function GET() {
  try {
    const categories =
      await prisma.category.findMany({
        orderBy: [
          {
            order: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      });

    return NextResponse.json(
      {
        success: true,

        categories: categories.map(
          (category) => ({
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
          })
        ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Kategoriler alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Kategoriler alınırken bir hata oluştu.",
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
        CreateCategoryRequestBody;

    const slug =
      isString(body.slug)
        ? normalizeSlug(body.slug)
        : "";

    const nameTr =
      isString(body.name?.tr)
        ? normalizeCategoryName(
            body.name.tr,
            "tr"
          )
        : "";

    const nameEn =
      isString(body.name?.en)
        ? normalizeCategoryName(
            body.name.en,
            "en"
          )
        : "";

    const nameAr =
      isString(body.name?.ar)
        ? normalizeCategoryName(
            body.name.ar,
            "ar"
          )
        : "";

    const eyebrowTr =
      isString(body.eyebrow?.tr)
        ? body.eyebrow.tr.trim()
        : "";

    const eyebrowEn =
      isString(body.eyebrow?.en)
        ? body.eyebrow.en.trim()
        : "";

    const eyebrowAr =
      isString(body.eyebrow?.ar)
        ? body.eyebrow.ar.trim()
        : "";

    const imageUrl =
      isString(body.image)
        ? body.image.trim()
        : "";

    const order =
      isNonNegativeInteger(
        body.order
      )
        ? body.order
        : 0;

    const isActive =
      isBoolean(body.isActive)
        ? body.isActive
        : true;

    /*
     * --------------------------------------------------------
     * VALIDATION
     * --------------------------------------------------------
     */

    if (
      !slug ||
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
     * Aynı slug daha önce kullanılmış mı?
     */
    const existingCategory =
      await prisma.category.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

    if (existingCategory) {
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

    /*
     * --------------------------------------------------------
     * CREATE
     * --------------------------------------------------------
     */

    const category =
      await prisma.category.create({
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

        category: {
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
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Kategori oluşturulamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Kategori oluşturulurken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}