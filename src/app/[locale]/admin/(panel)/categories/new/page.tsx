import { notFound } from "next/navigation";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminCategoryForm from "@/components/admin/categories/AdminCategoryForm";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type NewCategoryPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function NewCategoryPage({
  params,
}: NewCategoryPageProps) {
  const { locale } = await params;

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
            .newTitle
        }
        description={
          dictionary.adminCategoryFormPage
            .newDescription
        }
      />

      <div className="mt-10 sm:mt-12">
        <AdminCategoryForm
          locale={locale}
          dictionary={
            dictionary.adminCategoryFormPage
          }
        />
      </div>
    </>
  );
}