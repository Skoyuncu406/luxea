import type { ReactNode } from "react";

import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";

import {
  isValidLocale,
} from "@/lib/i18n/config";

import {
  getDictionary,
} from "@/lib/i18n/get-dictionary";

type AccountLayoutProps = {
  children: ReactNode;

  params: Promise<{
    locale: string;
  }>;
};

export default async function AccountLayout({
  children,
  params,
}: AccountLayoutProps) {
  const { locale } =
    await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary =
    await getDictionary(locale);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <div className="pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        {children}
      </div>
    </div>
  );
}