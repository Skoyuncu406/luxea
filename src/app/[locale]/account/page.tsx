import {
  notFound,
} from "next/navigation";

import AccountDashboard from "@/components/account/AccountDashboard";

import {
  isValidLocale,
} from "@/lib/i18n/config";

type AccountPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const dictionary = {
  tr: {
    eyebrow:
      "LUXEA Hesabım",

    title:
      "Hesabınızı yönetin.",

    description:
      "Siparişlerinize, kayıtlı adreslerinize, favorilerinize ve profil bilgilerinize tek bir yerden erişin.",

    profile:
      "Profil",

    profileDescription:
      "Kişisel bilgilerinizi görüntüleyin ve yönetin.",

    orders:
      "Siparişlerim",

    ordersDescription:
      "Geçmiş ve mevcut siparişlerinizi takip edin.",

    addresses:
      "Adreslerim",

    addressesDescription:
      "Teslimat adreslerinizi kaydedin ve yönetin.",

    favorites:
      "Favorilerim",

    favoritesDescription:
      "Kaydettiğiniz LUXEA parçalarına yeniden ulaşın.",

    email:
      "E-posta",

    phone:
      "Telefon",

    logout:
      "Çıkış Yap",

    loggingOut:
      "Çıkış Yapılıyor",

    loading:
      "Hesabınız yükleniyor",
  },

  en: {
    eyebrow:
      "My LUXEA Account",

    title:
      "Manage your account.",

    description:
      "Access your orders, saved addresses, favourites and profile information from one place.",

    profile:
      "Profile",

    profileDescription:
      "View and manage your personal information.",

    orders:
      "My Orders",

    ordersDescription:
      "Track your current and previous orders.",

    addresses:
      "My Addresses",

    addressesDescription:
      "Save and manage your delivery addresses.",

    favorites:
      "My Favourites",

    favoritesDescription:
      "Return to the LUXEA pieces you have saved.",

    email:
      "Email",

    phone:
      "Phone",

    logout:
      "Sign Out",

    loggingOut:
      "Signing Out",

    loading:
      "Loading your account",
  },

  ar: {
    eyebrow:
      "حسابي في LUXEA",

    title:
      "إدارة حسابك.",

    description:
      "يمكنك الوصول إلى طلباتك وعناوينك المحفوظة ومفضلاتك ومعلومات ملفك الشخصي من مكان واحد.",

    profile:
      "الملف الشخصي",

    profileDescription:
      "عرض وإدارة معلوماتك الشخصية.",

    orders:
      "طلباتي",

    ordersDescription:
      "تتبع طلباتك الحالية والسابقة.",

    addresses:
      "عناويني",

    addressesDescription:
      "حفظ وإدارة عناوين التوصيل الخاصة بك.",

    favorites:
      "المفضلة",

    favoritesDescription:
      "العودة إلى قطع LUXEA التي قمت بحفظها.",

    email:
      "البريد الإلكتروني",

    phone:
      "الهاتف",

    logout:
      "تسجيل الخروج",

    loggingOut:
      "جارٍ تسجيل الخروج",

    loading:
      "جارٍ تحميل حسابك",
  },
} as const;

export default async function AccountPage({
  params,
}: AccountPageProps) {
  const {
    locale,
  } = await params;

  if (
    !isValidLocale(
      locale
    )
  ) {
    notFound();
  }

  return (
    <AccountDashboard
      locale={locale}
      dictionary={
        dictionary[
          locale
        ]
      }
    />
  );
}