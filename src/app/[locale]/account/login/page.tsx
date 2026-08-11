import type {
  Metadata,
} from "next";

import {
  notFound,
} from "next/navigation";

import LoginContent, {
  type LoginDictionary,
} from "@/components/account/LoginContent";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n/config";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type LoginPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/*
 * ============================================================
 * DICTIONARY
 * ============================================================
 */

const dictionary:
  Record<
    Locale,
    LoginDictionary
  > = {
  tr: {
    eyebrow:
      "LUXEA Hesabı",

    title:
      "Tekrar hoş geldiniz.",

    description:
      "Siparişlerinizi, adreslerinizi ve hesabınızı tek bir yerden yönetin.",

    email:
      "E-posta",

    emailPlaceholder:
      "ornek@email.com",

    password:
      "Şifre",

    passwordPlaceholder:
      "Şifrenizi girin",

    submit:
      "Giriş Yap",

    submitting:
      "Giriş Yapılıyor",

    noAccount:
      "Henüz bir hesabınız yok mu?",

    register:
      "Hesap Oluştur",

    requiredFields:
      "E-posta ve şifre alanları zorunludur.",
  },

  en: {
    eyebrow:
      "LUXEA Account",

    title:
      "Welcome back.",

    description:
      "Manage your orders, addresses and account from one place.",

    email:
      "Email",

    emailPlaceholder:
      "example@email.com",

    password:
      "Password",

    passwordPlaceholder:
      "Enter your password",

    submit:
      "Sign In",

    submitting:
      "Signing In",

    noAccount:
      "Don't have an account yet?",

    register:
      "Create Account",

    requiredFields:
      "Email and password are required.",
  },

  ar: {
    eyebrow:
      "حساب LUXEA",

    title:
      "مرحباً بعودتك.",

    description:
      "قم بإدارة طلباتك وعناوينك وحسابك من مكان واحد.",

    email:
      "البريد الإلكتروني",

    emailPlaceholder:
      "example@email.com",

    password:
      "كلمة المرور",

    passwordPlaceholder:
      "أدخل كلمة المرور",

    submit:
      "تسجيل الدخول",

    submitting:
      "جارٍ تسجيل الدخول",

    noAccount:
      "ليس لديك حساب بعد؟",

    register:
      "إنشاء حساب",

    requiredFields:
      "البريد الإلكتروني وكلمة المرور مطلوبان.",
  },
};

/*
 * ============================================================
 * METADATA
 * ============================================================
 */

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const {
    locale,
  } = await params;

  if (
    !isValidLocale(
      locale
    )
  ) {
    return {};
  }

  const content =
    dictionary[locale];

  return {
    title:
      content.title,

    description:
      content.description,

    robots: {
      index: false,
      follow: false,
    },
  };
}

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default async function LoginPage({
  params,
}: LoginPageProps) {
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
    <LoginContent
      locale={locale}
      dictionary={
        dictionary[locale]
      }
    />
  );
}