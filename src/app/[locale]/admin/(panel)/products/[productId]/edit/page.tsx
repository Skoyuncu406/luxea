import { notFound } from "next/navigation";

import AdminEditProductClient from "@/components/admin/products/AdminEditProductClient";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type EditProductPageProps = {
  params: Promise<{
    locale: string;
    productId: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { locale, productId } =
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
          dictionary.adminProductFormPage
            .editTitle
        }
        description={
          dictionary.adminProductFormPage
            .editDescription
        }
      />

      <div className="mt-10 sm:mt-12">
        <AdminEditProductClient
          locale={locale}
          productId={productId}
          dictionary={
            dictionary.adminProductFormPage
          }
        />
      </div>
    </>
  );
}