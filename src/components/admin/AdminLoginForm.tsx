"use client";

import {
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import type { Locale } from "@/lib/i18n/config";

type AdminLoginDictionary = {
  eyebrow: string;
  title: string;
  description: string;

  email: string;
  emailPlaceholder: string;

  password: string;
  passwordPlaceholder: string;

  showPassword: string;
  hidePassword: string;

  submit: string;
  submitting: string;

  requiredFields: string;
  invalidCredentials: string;
  genericError: string;

  secureArea: string;
  secureAreaDescription: string;
};

type AdminLoginFormProps = {
  locale: Locale;
  dictionary: AdminLoginDictionary;
};

export default function AdminLoginForm({
  locale,
  dictionary,
}: AdminLoginFormProps) {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

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

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        setError(
          response.status === 401
            ? dictionary.invalidCredentials
            : data.message ||
                dictionary.genericError
        );

        setIsSubmitting(false);

        return;
      }

 router.replace(`/${locale}/admin`);

      router.refresh();
    } catch (error) {
      console.error(
        "Admin giriş isteği başarısız:",
        error
      );

      setError(dictionary.genericError);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-[1100px] overflow-hidden border border-border bg-surface/55 shadow-[0_30px_90px_rgba(36,35,32,0.10)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      {/* Sol premium bilgilendirme alanı */}
      <section className="relative hidden min-h-[640px] overflow-hidden border-e border-border bg-[#D9D3C9] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          aria-hidden="true"
          className="absolute -start-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-24 -end-20 h-80 w-80 rounded-full bg-silver/20 blur-3xl"
        />

        <div className="relative z-10">
          <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-accent">
            LUXEA ADMIN
          </p>

          <h2 className="mt-7 max-w-sm font-heading text-6xl leading-[0.92] text-foreground xl:text-7xl">
            {dictionary.secureArea}
          </h2>

          <p className="mt-7 max-w-md text-sm leading-8 text-foreground-soft">
            {
              dictionary.secureAreaDescription
            }
          </p>
        </div>

        <div className="relative z-10 border-t border-border pt-7">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-accent/35 text-accent">
              <ShieldCheck
                size={20}
                strokeWidth={1.25}
              />
            </span>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground">
                Secure Administration
              </p>

              <p className="mt-2 text-xs leading-6 text-foreground-soft">
                LUXEA · EST. 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Giriş formu */}
      <section className="flex min-h-[600px] items-center px-5 py-12 sm:px-10 lg:min-h-[640px] lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-[470px]">
          <div className="text-center lg:text-start">
            <span className="mx-auto flex h-16 w-16 items-center justify-center border border-accent/35 bg-accent/10 text-accent lg:mx-0">
              <LockKeyhole
                size={26}
                strokeWidth={1.2}
              />
            </span>

            <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.28em] text-accent">
              {dictionary.eyebrow}
            </p>

            <h1 className="mt-4 font-heading text-5xl leading-none text-foreground sm:text-6xl">
              {dictionary.title}
            </h1>

            <p className="mt-5 text-sm leading-7 text-foreground-soft">
              {dictionary.description}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-9 space-y-5"
          >
            {/* E-posta */}
            <label className="block">
              <span className="mb-3 block text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
                {dictionary.email}
              </span>

              <div className="group relative">
                <Mail
                  size={17}
                  strokeWidth={1.35}
                  className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-muted transition-colors duration-300 group-focus-within:text-accent"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );

                    setError("");
                  }}
                  placeholder={
                    dictionary.emailPlaceholder
                  }
                  autoComplete="email"
                  className={[
                    "h-16 w-full border border-border",
                    "bg-background/65 ps-14 pe-5",
                    "text-sm text-foreground",
                    "outline-none",
                    "transition-all duration-300",
                    "placeholder:text-muted/70",
                    "hover:border-border-strong",
                    "focus:border-accent",
                    "focus:bg-background",
                  ].join(" ")}
                />
              </div>
            </label>

            {/* Şifre */}
            <label className="block">
              <span className="mb-3 block text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
                {dictionary.password}
              </span>

              <div className="group relative">
                <LockKeyhole
                  size={17}
                  strokeWidth={1.35}
                  className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-muted transition-colors duration-300 group-focus-within:text-accent"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value
                    );

                    setError("");
                  }}
                  placeholder={
                    dictionary.passwordPlaceholder
                  }
                  autoComplete="current-password"
                  className={[
                    "h-16 w-full border border-border",
                    "bg-background/65 ps-14 pe-14",
                    "text-sm text-foreground",
                    "outline-none",
                    "transition-all duration-300",
                    "placeholder:text-muted/70",
                    "hover:border-border-strong",
                    "focus:border-accent",
                    "focus:bg-background",
                  ].join(" ")}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? dictionary.hidePassword
                      : dictionary.showPassword
                  }
                  title={
                    showPassword
                      ? dictionary.hidePassword
                      : dictionary.showPassword
                  }
                  className="absolute end-0 top-0 flex h-16 w-14 items-center justify-center text-muted transition-colors duration-300 hover:text-accent"
                >
                  {showPassword ? (
                    <EyeOff
                      size={17}
                      strokeWidth={1.35}
                    />
                  ) : (
                    <Eye
                      size={17}
                      strokeWidth={1.35}
                    />
                  )}
                </button>
              </div>
            </label>

            {/* Hata mesajı */}
            {error && (
              <div
                role="alert"
                className="border-s-2 border-danger bg-danger/10 px-5 py-4"
              >
                <p className="text-xs leading-6 text-danger">
                  {error}
                </p>
              </div>
            )}

            {/* Giriş butonu */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={[
                "group inline-flex min-h-16",
                "w-full items-center",
                "justify-center gap-3",
                "border px-8",
                "text-[10px] font-semibold",
                "uppercase tracking-[0.18em]",
                "transition-all duration-300",
                isSubmitting
                  ? "cursor-wait border-border bg-surface-strong text-muted"
                  : "border-[#242320] bg-[#242320] !text-[#F3F0EA] hover:border-accent hover:bg-accent hover:!text-white",
              ].join(" ")}
            >
              {isSubmitting ? (
                <LoaderCircle
                  size={17}
                  strokeWidth={1.4}
                  className="animate-spin"
                />
              ) : (
                <ArrowRight
                  size={17}
                  strokeWidth={1.4}
                  className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                />
              )}

              <span>
                {isSubmitting
                  ? dictionary.submitting
                  : dictionary.submit}
              </span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}