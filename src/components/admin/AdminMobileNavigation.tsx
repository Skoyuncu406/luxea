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

type AdminMobileNavigationProps = {
  locale: Locale;
  dictionary: AdminNavigationDictionary;
};

export default function AdminMobileNavigation({
  locale,
  dictionary,
}: AdminMobileNavigationProps) {
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
    <div
      className={[
        "sticky z-[400] lg:hidden",
        "top-[120px] sm:top-[128px]",
        "border-y border-border",
        "bg-[#E5E0D7]/96",
        "shadow-[0_12px_35px_rgba(36,35,32,0.08)]",
        "backdrop-blur-xl",
      ].join(" ")}
    >
      <div className="container-premium py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
                  "inline-flex min-h-11 shrink-0",
                  "items-center justify-center gap-2.5",
                  "border px-4",
                  "text-[8px] font-semibold uppercase",
                  "tracking-[0.13em]",
                  "transition-all duration-300",
                  item.isActive
                    ? "border-accent bg-accent !text-white"
                    : "border-border bg-surface/65 text-foreground",
                ].join(" ")}
              >
                <Icon
                  size={14}
                  strokeWidth={1.4}
                />

                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="shrink-0">
            <AdminLogoutButton
              locale={locale}
              label={dictionary.logout}
              loadingLabel={
                dictionary.loggingOut
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}