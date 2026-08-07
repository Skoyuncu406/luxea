import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminPanelLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminPanelLayout({
  children,
  params,
}: AdminPanelLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary =
    await getDictionary(locale);

  return (
    <AdminShell
      locale={locale}
      dictionary={dictionary}
      navigationDictionary={
        dictionary.adminNavigation
      }
    >
      {children}
    </AdminShell>
  );
}