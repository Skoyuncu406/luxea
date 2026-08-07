import type { ReactNode } from "react";

import AdminMobileNavigation from "@/components/admin/AdminMobileNavigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Navbar from "@/components/layout/Navbar";
import type { Locale } from "@/lib/i18n/config";

type AdminNavigationDictionary = {
  dashboard: string;
  orders: string;
  products: string;
  categories: string;
  settings: string;
  logout: string;
  loggingOut: string;
};

type AdminShellProps = {
  children: ReactNode;
  locale: Locale;
  dictionary: Parameters<typeof Navbar>[0]["dictionary"];
  navigationDictionary: AdminNavigationDictionary;
};

export default function AdminShell({
  children,
  locale,
  dictionary,
  navigationDictionary,
}: AdminShellProps) {
  return (
    <main className="min-h-screen w-full overflow-x-clip bg-background text-foreground">
      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <div className="pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <AdminMobileNavigation
          locale={locale}
          dictionary={navigationDictionary}
        />

        <div className="container-premium py-6 sm:py-8 lg:py-10">
          <div className="flex w-full items-start gap-8 xl:gap-10">
            <AdminSidebar
              locale={locale}
              dictionary={navigationDictionary}
            />

            <div className="min-w-0 flex-1">
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}