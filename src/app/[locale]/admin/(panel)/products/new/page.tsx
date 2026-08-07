import { notFound } from "next/navigation";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminProductForm from "@/components/admin/products/AdminProductForm";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type NewProductPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function NewProductPage({
  params,
}: NewProductPageProps) {
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
          dictionary.adminProductFormPage
            .newTitle
        }
        description={
          dictionary.adminProductFormPage
            .newDescription
        }
      />

      <div className="mt-10 sm:mt-12">
        <AdminProductForm
          locale={locale}
          dictionary={
            dictionary.adminProductFormPage
          }
        />
      </div>
    </>
  );
}