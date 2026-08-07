import { notFound } from "next/navigation";

import AdminCategoriesContent from "@/components/admin/categories/AdminCategoriesContent";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminCategoriesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminCategoriesPage({
  params,
}: AdminCategoriesPageProps) {
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
          dictionary.adminCategoriesPage
            .title
        }
        description={
          dictionary.adminCategoriesPage
            .description
        }
      />

      <div className="mt-10 sm:mt-12">
        <AdminCategoriesContent
          locale={locale}
          dictionary={
            dictionary.adminCategoriesPage
          }
        />
      </div>
    </>
  );
}