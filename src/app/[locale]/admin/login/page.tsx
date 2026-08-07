import { notFound } from "next/navigation";

import AdminLoginForm from "@/components/admin/AdminLoginForm";
import Navbar from "@/components/layout/Navbar";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type AdminLoginPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminLoginPage({
  params,
}: AdminLoginPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const cookieStore = await cookies();

const token =
cookieStore.get("luxea-admin-session");

if (token) {
 redirect(`/${locale}/admin`);
}

  const dictionary =
    await getDictionary(locale);

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-background text-foreground">
      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <section className="pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium py-12 sm:py-16 lg:py-20">
          <AdminLoginForm
            locale={locale}
            dictionary={
              dictionary.adminLoginPage
            }
          />
        </div>
      </section>
    </main>
  );
}