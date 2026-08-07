import { notFound } from "next/navigation";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminEditCategoryClient from "@/components/admin/categories/AdminEditCategoryClient";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type EditCategoryPageProps = {
  params: Promise<{
    locale: string;
    categoryId: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { locale, categoryId } =
    await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary =
    await getDictionary(locale);

  return (
    <>
      <AdminPageHeader
        title={
          dictionary.adminCategoryFormPage
            .editTitle
        }
        description={
          dictionary.adminCategoryFormPage
            .editDescription
        }
      />

      <div className="mt-10 sm:mt-12">
        <AdminEditCategoryClient
          locale={locale}
          categoryId={categoryId}
          dictionary={
            dictionary.adminCategoryFormPage
          }
        />
      </div>
    </>
  );
}