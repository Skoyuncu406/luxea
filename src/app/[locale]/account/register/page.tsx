import {
  notFound,
} from "next/navigation";

import RegisterContent from "@/components/account/RegisterContent";

import {
  isValidLocale,
} from "@/lib/i18n/config";

type RegisterPageProps = {
  params:
    Promise<{
      locale: string;
    }>;
};

const dictionary = {
  tr: {
    eyebrow:
      "LUXEA Hesabı",

    title:
      "Hesabınızı oluşturun.",

    description:
      "Sipariş geçmişinizi, adreslerinizi ve favorilerinizi tek bir LUXEA hesabı üzerinden yönetin.",

    firstName:
      "Ad",

    lastName:
      "Soyad",

    email:
      "E-posta",

    phone:
      "Telefon",

    password:
      "Şifre",

    confirmPassword:
      "Şifre Tekrar",

    firstNamePlaceholder:
      "Adınız",

    lastNamePlaceholder:
      "Soyadınız",

    emailPlaceholder:
      "ornek@eposta.com",

    phonePlaceholder:
      "+49 ...",

    passwordPlaceholder:
      "En az 8 karakter",

    confirmPasswordPlaceholder:
      "Şifrenizi tekrar girin",

    submit:
      "Hesap Oluştur",

    submitting:
      "Hesap Oluşturuluyor",

    alreadyAccount:
      "Zaten hesabınız var mı?",

    login:
      "Giriş Yap",

    requiredFields:
      "Ad, soyad, e-posta ve şifre alanları zorunludur.",

    passwordLength:
      "Şifre en az 8 karakter olmalıdır.",

    passwordMismatch:
      "Şifreler birbiriyle eşleşmiyor.",
  },

  en: {
    eyebrow:
      "LUXEA Account",

    title:
      "Create your account.",

    description:
      "Manage your order history, addresses and favourites through one LUXEA account.",

    firstName:
      "First Name",

    lastName:
      "Last Name",

    email:
      "Email",

    phone:
      "Phone",

    password:
      "Password",

    confirmPassword:
      "Confirm Password",

    firstNamePlaceholder:
      "Your first name",

    lastNamePlaceholder:
      "Your last name",

    emailPlaceholder:
      "example@email.com",

    phonePlaceholder:
      "+49 ...",

    passwordPlaceholder:
      "At least 8 characters",

    confirmPasswordPlaceholder:
      "Enter your password again",

    submit:
      "Create Account",

    submitting:
      "Creating Account",

    alreadyAccount:
      "Already have an account?",

    login:
      "Sign In",

    requiredFields:
      "First name, last name, email and password are required.",

    passwordLength:
      "Password must be at least 8 characters.",

    passwordMismatch:
      "Passwords do not match.",
  },

  ar: {
    eyebrow:
      "حساب LUXEA",

    title:
      "أنشئ حسابك.",

    description:
      "أدر سجل طلباتك وعناوينك ومفضلاتك من خلال حساب LUXEA واحد.",

    firstName:
      "الاسم",

    lastName:
      "اسم العائلة",

    email:
      "البريد الإلكتروني",

    phone:
      "الهاتف",

    password:
      "كلمة المرور",

    confirmPassword:
      "تأكيد كلمة المرور",

    firstNamePlaceholder:
      "اسمك",

    lastNamePlaceholder:
      "اسم العائلة",

    emailPlaceholder:
      "example@email.com",

    phonePlaceholder:
      "+49 ...",

    passwordPlaceholder:
      "8 أحرف على الأقل",

    confirmPasswordPlaceholder:
      "أدخل كلمة المرور مرة أخرى",

    submit:
      "إنشاء الحساب",

    submitting:
      "جارٍ إنشاء الحساب",

    alreadyAccount:
      "لديك حساب بالفعل؟",

    login:
      "تسجيل الدخول",

    requiredFields:
      "الاسم واسم العائلة والبريد الإلكتروني وكلمة المرور مطلوبة.",

    passwordLength:
      "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",

    passwordMismatch:
      "كلمتا المرور غير متطابقتين.",
  },
} as const;

export default async function RegisterPage({
  params,
}: RegisterPageProps) {
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
    <RegisterContent
      locale={
        locale
      }
      dictionary={
        dictionary[
          locale
        ]
      }
    />
  );
}