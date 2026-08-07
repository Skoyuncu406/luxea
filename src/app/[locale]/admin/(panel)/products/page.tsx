import { notFound } from "next/navigation";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminProductsContent from "@/components/admin/products/AdminProductsContent";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminProductsPage({
  params,
}: AdminProductsPageProps) {
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
          dictionary.adminProductsPage.title
        }
        description={
          dictionary.adminProductsPage
            .description
        }
      />

      <div className="mt-10 sm:mt-12">
        <AdminProductsContent
          locale={locale}
          dictionary={
            dictionary.adminProductsPage
          }
        />
      </div>
    </>
  );
}