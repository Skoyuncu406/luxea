import {
  notFound,
} from "next/navigation";

import ProfileContent from "@/components/account/ProfileContent";

import {
  isValidLocale,
} from "@/lib/i18n/config";

type ProfilePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const dictionary = {
  tr: {
    eyebrow:
      "LUXEA Hesabım",

    title:
      "Profil bilgileriniz.",

    description:
      "Kişisel bilgilerinizi görüntüleyin ve hesabınızı güncel tutun.",

    firstName:
      "Ad",

    lastName:
      "Soyad",

    email:
      "E-posta",

    phone:
      "Telefon",

    firstNamePlaceholder:
      "Adınızı girin",

    lastNamePlaceholder:
      "Soyadınızı girin",

    phonePlaceholder:
      "Telefon numaranızı girin",

    emailNote:
      "E-posta adresiniz hesabınızın güvenliği için bu alandan değiştirilemez.",

    save:
      "Değişiklikleri Kaydet",

    saving:
      "Kaydediliyor",

    success:
      "Profil bilgileriniz başarıyla güncellendi.",

    requiredFields:
      "Ad ve soyad alanları zorunludur.",

    loadError:
      "Profil bilgileriniz yüklenemedi.",

    back:
      "Hesabıma Dön",

    secureTitle:
      "Hesap Güvenliği",

    secureDescription:
      "Profil değişiklikleri yalnızca aktif kullanıcı oturumunuz üzerinden gerçekleştirilebilir.",
  },

  en: {
    eyebrow:
      "My LUXEA Account",

    title:
      "Your profile information.",

    description:
      "View your personal information and keep your account details up to date.",

    firstName:
      "First Name",

    lastName:
      "Last Name",

    email:
      "Email",

    phone:
      "Phone",

    firstNamePlaceholder:
      "Enter your first name",

    lastNamePlaceholder:
      "Enter your last name",

    phonePlaceholder:
      "Enter your phone number",

    emailNote:
      "For account security, your email address cannot be changed from this section.",

    save:
      "Save Changes",

    saving:
      "Saving",

    success:
      "Your profile information has been updated successfully.",

    requiredFields:
      "First name and last name are required.",

    loadError:
      "Your profile information could not be loaded.",

    back:
      "Back to My Account",

    secureTitle:
      "Account Security",

    secureDescription:
      "Profile changes can only be made through your active user session.",
  },

  ar: {
    eyebrow:
      "حسابي في LUXEA",

    title:
      "معلومات ملفك الشخصي.",

    description:
      "عرض معلوماتك الشخصية والحفاظ على تحديث بيانات حسابك.",

    firstName:
      "الاسم",

    lastName:
      "اسم العائلة",

    email:
      "البريد الإلكتروني",

    phone:
      "الهاتف",

    firstNamePlaceholder:
      "أدخل اسمك",

    lastNamePlaceholder:
      "أدخل اسم العائلة",

    phonePlaceholder:
      "أدخل رقم هاتفك",

    emailNote:
      "لحماية حسابك، لا يمكن تغيير عنوان البريد الإلكتروني من هذا القسم.",

    save:
      "حفظ التغييرات",

    saving:
      "جارٍ الحفظ",

    success:
      "تم تحديث معلومات ملفك الشخصي بنجاح.",

    requiredFields:
      "الاسم واسم العائلة مطلوبان.",

    loadError:
      "تعذر تحميل معلومات ملفك الشخصي.",

    back:
      "العودة إلى حسابي",

    secureTitle:
      "أمان الحساب",

    secureDescription:
      "لا يمكن إجراء تغييرات الملف الشخصي إلا من خلال جلسة المستخدم النشطة.",
  },
} as const;

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
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
    <ProfileContent
      locale={locale}
      dictionary={
        dictionary[
          locale
        ]
      }
    />
  );
}