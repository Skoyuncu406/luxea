import { notFound } from "next/navigation";

import AdminDashboardContent from "@/components/admin/AdminDashboardContent";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminDashboardPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
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
          dictionary.adminDashboardPage.title
        }
        description={
          dictionary.adminDashboardPage
            .description
        }
      />

      <div className="mt-10 sm:mt-12">
        <AdminDashboardContent
          locale={locale}
          dictionary={
            dictionary.adminDashboardPage
          }
        />
      </div>
    </>
  );
}