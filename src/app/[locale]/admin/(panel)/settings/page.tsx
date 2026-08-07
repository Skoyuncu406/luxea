import { notFound } from "next/navigation";

import AdminComingSoon from "@/components/admin/AdminComingSoon";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminSettingsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminSettingsPage({
  params,
}: AdminSettingsPageProps) {
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
          dictionary.adminSettingsPage.title
        }
        description={
          dictionary.adminSettingsPage
            .description
        }
      />

      <div className="mt-10 sm:mt-12">
        <AdminComingSoon
          locale={locale}
          title={
            dictionary.adminSettingsPage
              .comingSoonTitle
          }
          description={
            dictionary.adminSettingsPage
              .comingSoonDescription
          }
          backLabel={
            dictionary.adminSettingsPage
              .backToDashboard
          }
        />
      </div>
    </>
  );
}