"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  PackageSearch,
  Settings,
  Tags,
} from "lucide-react";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
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

type AdminSidebarProps = {
  locale: Locale;
  dictionary: AdminNavigationDictionary;
};

export default function AdminSidebar({
  locale,
  dictionary,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      label: dictionary.dashboard,
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
      isActive: pathname === `/${locale}/admin`,
    },
    {
      label: dictionary.orders,
      href: `/${locale}/admin/orders`,
      icon: PackageSearch,
      isActive: pathname.startsWith(
        `/${locale}/admin/orders`
      ),
    },
    {
      label: dictionary.products,
      href: `/${locale}/admin/products`,
      icon: Boxes,
      isActive: pathname.startsWith(
        `/${locale}/admin/products`
      ),
    },
    {
      label: dictionary.categories,
      href: `/${locale}/admin/categories`,
      icon: Tags,
      isActive: pathname.startsWith(
        `/${locale}/admin/categories`
      ),
    },
    {
      label: dictionary.settings,
      href: `/${locale}/admin/settings`,
      icon: Settings,
      isActive: pathname.startsWith(
        `/${locale}/admin/settings`
      ),
    },
  ];

  return (
    <aside className="sticky top-[112px] hidden h-[calc(100vh-136px)] min-h-[620px] w-[270px] shrink-0 border border-border bg-surface/55 lg:flex lg:flex-col">
      {/* Marka alanı */}
      <div className="border-b border-border px-7 py-7">
        <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-accent">
          LUXEA
        </p>

        <p className="mt-2 font-heading text-3xl leading-none text-foreground">
          Administration
        </p>
      </div>

      {/* Navigasyon */}
      <nav
        aria-label="Admin navigation"
        className="flex-1 space-y-2 overflow-y-auto p-4"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                item.isActive ? "page" : undefined
              }
              className={[
                "group relative flex min-h-14",
                "items-center gap-4 border px-5",
                "text-[9px] font-semibold uppercase",
                "tracking-[0.15em]",
                "transition-all duration-300",
                item.isActive
                  ? "border-accent bg-accent !text-white"
                  : "border-transparent text-foreground hover:border-border hover:bg-background/55 hover:text-accent",
              ].join(" ")}
            >
              <Icon
                size={17}
                strokeWidth={1.35}
                className="shrink-0"
              />

              <span>{item.label}</span>

              {item.isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 end-0 w-[3px] bg-white/75"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Çıkış alanı */}
      <div className="border-t border-border p-4">
        <AdminLogoutButton
          locale={locale}
          label={dictionary.logout}
          loadingLabel={dictionary.loggingOut}
        />
      </div>
    </aside>
  );
}