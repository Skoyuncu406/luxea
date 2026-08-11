"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useUser } from "@/contexts/UserContext";
import type { Locale } from "@/lib/i18n/config";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export type LoginDictionary = {
  eyebrow: string;
  title: string;
  description: string;

  email: string;
  emailPlaceholder: string;

  password: string;
  passwordPlaceholder: string;

  submit: string;
  submitting: string;

  noAccount: string;
  register: string;

  requiredFields: string;
};

type LoginContentProps = {
  locale: Locale;
  dictionary: LoginDictionary;
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function LoginContent({
  locale,
  dictionary,
}: LoginContentProps) {
  const router = useRouter();

  const { refreshUser } = useUser();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (
      !email.trim() ||
      !password.trim()
    ) {
      setError(
        dictionary.requiredFields
      );

      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({
              email:
                email
                  .trim()
                  .toLowerCase(),

              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            getLoginError(
              locale
            )
        );
      }

      await refreshUser();

      router.push(
        `/${locale}/account`
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : getLoginError(
              locale
            )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <main
      className="
        relative
        min-h-[calc(100vh-88px)]
        overflow-hidden
        bg-background
        px-4
        py-10
        sm:px-6
        sm:py-12
        lg:px-8
        lg:py-14
      "
    >
      {/* BACKGROUND */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            left-1/2
            top-[-320px]
            h-[620px]
            w-[620px]
            -translate-x-1/2
            rounded-full
            bg-accent/[0.05]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-[-280px]
            right-[-200px]
            h-[480px]
            w-[480px]
            rounded-full
            bg-accent/[0.025]
            blur-3xl
          "
        />
      </div>

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          w-full
          max-w-[1200px]
          flex-col
          items-center
        "
      >
        {/* HEADER */}

        <header
          className="
            mx-auto
            flex
            w-full
            max-w-[600px]
            flex-col
            items-center
            justify-center
            text-center
          "
        >
          <p
            className="
              w-full
              text-center
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.3em]
              text-accent
            "
          >
            {dictionary.eyebrow}
          </p>

          <h1
            className="
              mx-auto
              mt-4
              w-full
              text-center
              font-heading
              text-4xl
              leading-[0.95]
              text-foreground
              sm:text-5xl
              lg:text-[54px]
            "
          >
            {dictionary.title}
          </h1>

          <p
            className="
              mx-auto
              mt-5
              max-w-[500px]
              text-center
              text-sm
              leading-7
              text-foreground-soft
            "
          >
            {dictionary.description}
          </p>
        </header>

        {/* LOGIN FORM WRAPPER */}

        <div
          className="
            mx-auto
            mt-9
            w-full
            max-w-[400px]
            sm:mt-10
            sm:w-[400px]
          "
        >
          {/* LOGIN PANEL */}

          <div
            className="
              w-full
              border
              border-border
              bg-surface/40
              px-5
              py-7
              shadow-[0_24px_70px_rgba(36,35,32,0.06)]
              backdrop-blur-[2px]
              sm:px-7
              sm:py-8
            "
          >
            <form
              onSubmit={
                handleSubmit
              }
              noValidate
              className="w-full"
            >
              {/* EMAIL */}

              <div>
                <label
                  htmlFor="login-email"
                  className="
                    mb-2.5
                    block
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-foreground-soft
                  "
                >
                  {dictionary.email}
                </label>

                <div className="group relative">
                  <Mail
                    size={16}
                    strokeWidth={
                      1.3
                    }
                    className="
                      pointer-events-none
                      absolute
                      start-4
                      top-1/2
                      -translate-y-1/2
                      text-muted
                      transition-colors
                      duration-300
                      group-focus-within:text-accent
                    "
                  />

                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(
                      event
                    ) => {
                      setEmail(
                        event.target
                          .value
                      );

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder={
                      dictionary.emailPlaceholder
                    }
                    className="
                      h-[52px]
                      w-full
                      border
                      border-border
                      !bg-background
                      ps-11
                      pe-4
                      text-sm
                      text-foreground
                      caret-accent
                      outline-none
                      transition-all
                      duration-300
                      placeholder:text-muted/60
                      hover:border-border-strong
                      focus:border-accent
                      focus:!bg-background
                      focus:ring-1
                      focus:ring-accent/10
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="mt-5">
                <label
                  htmlFor="login-password"
                  className="
                    mb-2.5
                    block
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-foreground-soft
                  "
                >
                  {
                    dictionary.password
                  }
                </label>

                <div className="group relative">
                  <LockKeyhole
                    size={16}
                    strokeWidth={
                      1.3
                    }
                    className="
                      pointer-events-none
                      absolute
                      start-4
                      top-1/2
                      -translate-y-1/2
                      text-muted
                      transition-colors
                      duration-300
                      group-focus-within:text-accent
                    "
                  />

                  <input
                    id="login-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={
                      password
                    }
                    onChange={(
                      event
                    ) => {
                      setPassword(
                        event.target
                          .value
                      );

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder={
                      dictionary.passwordPlaceholder
                    }
                    className="
                      h-[52px]
                      w-full
                      border
                      border-border
                      !bg-background
                      ps-11
                      pe-14
                      text-sm
                      text-foreground
                      caret-accent
                      outline-none
                      transition-all
                      duration-300
                      placeholder:text-muted/60
                      hover:border-border-strong
                      focus:border-accent
                      focus:!bg-background
                      focus:ring-1
                      focus:ring-accent/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Şifreyi gizle"
                        : "Şifreyi göster"
                    }
                    className="
                      absolute
                      end-0
                      top-0
                      flex
                      h-[52px]
                      w-12
                      items-center
                      justify-center
                      text-muted
                      transition-colors
                      duration-300
                      hover:text-accent
                    "
                  >
                    {showPassword ? (
                      <EyeOff
                        size={
                          16
                        }
                        strokeWidth={
                          1.3
                        }
                      />
                    ) : (
                      <Eye
                        size={
                          16
                        }
                        strokeWidth={
                          1.3
                        }
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div
                  role="alert"
                  className="
                    mt-5
                    border
                    border-danger/25
                    bg-danger/[0.04]
                    px-4
                    py-3
                  "
                >
                  <p
                    className="
                      text-center
                      text-xs
                      leading-6
                      text-danger
                    "
                  >
                    {error}
                  </p>
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className={[
                  "group mt-6 flex",
                  "min-h-[52px] w-full",
                  "items-center justify-center",
                  "gap-3 border px-5",
                  "text-[9px] font-semibold",
                  "uppercase tracking-[0.18em]",
                  "transition-all duration-300",

                  isSubmitting
                    ? "cursor-wait border-accent/40 bg-accent/70 text-white"
                    : "border-foreground bg-foreground text-white hover:border-accent hover:bg-accent",
                ].join(" ")}
              >
                {isSubmitting ? (
                  <LoaderCircle
                    size={15}
                    strokeWidth={
                      1.4
                    }
                    className="animate-spin"
                  />
                ) : (
                  <LockKeyhole
                    size={15}
                    strokeWidth={
                      1.4
                    }
                  />
                )}

                <span>
                  {isSubmitting
                    ? dictionary.submitting
                    : dictionary.submit}
                </span>

                {!isSubmitting && (
                  <ArrowRight
                    size={14}
                    strokeWidth={
                      1.3
                    }
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                      rtl:rotate-180
                      rtl:group-hover:-translate-x-1
                    "
                  />
                )}
              </button>
            </form>

            {/* REGISTER */}

            <div
              className="
                mt-7
                border-t
                border-border
                pt-6
                text-center
              "
            >
              <p
                className="
                  w-full
                  text-center
                  text-xs
                  leading-6
                  text-foreground-soft
                "
              >
                {
                  dictionary.noAccount
                }
              </p>

              <Link
                href={`/${locale}/account/register`}
                className="
                  group
                  mt-2
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-accent
                  transition-opacity
                  duration-300
                  hover:opacity-70
                "
              >
                <span>
                  {
                    dictionary.register
                  }
                </span>

                <ArrowRight
                  size={13}
                  strokeWidth={
                    1.3
                  }
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                    rtl:rotate-180
                    rtl:group-hover:-translate-x-1
                  "
                />
              </Link>
            </div>
          </div>

          {/* SECURITY */}

          <div
            className="
              mx-auto
              mt-5
              flex
              max-w-[350px]
              items-start
              justify-center
              gap-3
              px-3
            "
          >
            <ShieldCheck
              size={16}
              strokeWidth={1.2}
              className="
                mt-0.5
                shrink-0
                text-accent
              "
            />

            <p
              className="
                text-center
                text-[10px]
                leading-5
                text-muted
              "
            >
              {getSecurityText(
                locale
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function getLoginError(
  locale: Locale
) {
  if (locale === "en") {
    return "Login failed. Please check your email and password.";
  }

  if (locale === "ar") {
    return "تعذر تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.";
  }

  return "Giriş yapılamadı. Lütfen e-posta adresinizi ve şifrenizi kontrol edin.";
}

function getSecurityText(
  locale: Locale
) {
  if (locale === "en") {
    return "Your account session is protected with a secure HTTP-only cookie.";
  }

  if (locale === "ar") {
    return "جلسة حسابك محمية باستخدام ملف تعريف ارتباط آمن من نوع HTTP-only.";
  }

  return "Hesap oturumunuz güvenli HTTP-only cookie ile korunmaktadır.";
}