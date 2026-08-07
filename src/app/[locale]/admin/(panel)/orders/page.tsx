import { notFound } from "next/navigation";

import AdminOrdersContent from "@/components/admin/AdminOrdersContent";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminOrdersPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminOrdersPage({
  params,
}: AdminOrdersPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary =
    await getDictionary(locale);

  return (
    <>
      <AdminPageHeader
        title={dictionary.adminOrdersPage.title}
        description={
          dictionary.adminOrdersPage.description
        }
      />

      <div className="mt-10 sm:mt-12">
        <AdminOrdersContent
          locale={locale}
          dictionary={
            dictionary.adminOrdersPage
          }
        />
      </div>
    </>
  );
}