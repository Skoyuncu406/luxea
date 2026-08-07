"use client";

import Link from "next/link";
import { ArrowLeft, Tags } from "lucide-react";

import AdminCategoryForm from "@/components/admin/categories/AdminCategoryForm";
import { useCategories } from "@/contexts/CategoryContext";
import type { Locale } from "@/lib/i18n/config";

type AdminCategoryFormDictionary = React.ComponentProps<
  typeof AdminCategoryForm
>["dictionary"];

type AdminEditCategoryClientProps = {
  locale: Locale;
  categoryId: string;
  dictionary: AdminCategoryFormDictionary;
};

export default function AdminEditCategoryClient({
  locale,
  categoryId,
  dictionary,
}: AdminEditCategoryClientProps) {
  const {
    isLoaded,
    findCategoryById,
  } = useCategories();

  if (!isLoaded) {
    return (
      <div className="flex min-h-[420px] items-center justify-center border-y border-border px-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          {locale === "tr"
            ? "Kategori yükleniyor"
            : locale === "ar"
              ? "جارٍ تحميل الفئة"
              : "Loading category"}
        </p>
      </div>
    );
  }

  const category =
    findCategoryById(categoryId);

  if (!category) {
    const title =
      locale === "tr"
        ? "Kategori bulunamadı."
        : locale === "ar"
          ? "لم يتم العثور على الفئة."
          : "Category not found.";

    const description =
      locale === "tr"
        ? "Düzenlemek istediğiniz kategori silinmiş veya mevcut olmayabilir."
        : locale === "ar"
          ? "قد تكون الفئة التي تريد تعديلها قد حُذفت أو لم تعد موجودة."
          : "The category you want to edit may have been deleted or may no longer exist.";

    const backLabel =
      locale === "tr"
        ? "Kategorilere Dön"
        : locale === "ar"
          ? "العودة إلى الفئات"
          : "Back to Categories";

    return (
      <div className="flex min-h-[520px] items-center justify-center border border-border bg-surface/40 px-5 py-14 text-center">
        <div className="mx-auto flex max-w-[620px] flex-col items-center">
          <span className="flex h-20 w-20 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
            <Tags
              size={31}
              strokeWidth={1.15}
            />
          </span>

          <h2 className="mt-7 font-heading text-5xl leading-none text-foreground sm:text-6xl">
            {title}
          </h2>

          <p className="mt-6 max-w-[520px] text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
            {description}
          </p>

          <Link
            href={`/${locale}/admin/categories`}
            className={[
              "group mt-9 inline-flex min-h-14",
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
            <ArrowLeft
              size={15}
              strokeWidth={1.4}
              className="rtl:rotate-180"
            />

            <span>{backLabel}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminCategoryForm
      locale={locale}
      dictionary={dictionary}
      category={category}
    />
  );
}