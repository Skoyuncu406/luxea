"use client";

import {
  useState,
  type ComponentType,
  type FormEvent,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useUser } from "@/contexts/UserContext";
import type { Locale } from "@/lib/i18n/config";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type RegisterDictionary = {
  eyebrow: string;
  title: string;
  description: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;

  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  passwordPlaceholder: string;
  confirmPasswordPlaceholder: string;

  submit: string;
  submitting: string;

  alreadyAccount: string;
  login: string;

  requiredFields: string;
  passwordLength: string;
  passwordMismatch: string;
};

type RegisterContentProps = {
  locale: Locale;
  dictionary: RegisterDictionary;
};

type FieldIcon = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function RegisterContent({
  locale,
  dictionary,
}: RegisterContentProps) {
  const router = useRouter();

  const {
    register,
    isLoading,
    error,
    clearError,
  } = useUser();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [formError, setFormError] =
    useState("");

  /*
   * ==========================================================
   * ERROR RESET
   * ==========================================================
   */

  function resetErrors() {
    setFormError("");
    clearError();
  }

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    resetErrors();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setFormError(
        dictionary.requiredFields
      );

      return;
    }

    if (password.length < 8) {
      setFormError(
        dictionary.passwordLength
      );

      return;
    }

    if (
      password !== confirmPassword
    ) {
      setFormError(
        dictionary.passwordMismatch
      );

      return;
    }

    try {
      await register({
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      router.push(
        `/${locale}/account`
      );

      router.refresh();
    } catch {
      /*
       * API hatası UserContext
       * üzerinden gösteriliyor.
       */
    }
  }

  const visibleError =
    formError || error;

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
        py-7
        text-foreground
        sm:px-6
        sm:py-8
        lg:px-8
        lg:py-9
      "
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

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

      {/* =====================================================
          PAGE
      ===================================================== */}

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
        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="
            mx-auto
            flex
            w-full
            max-w-[650px]
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
              text-[8px]
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
              mt-3
              w-full
              text-center
              font-heading
              text-4xl
              leading-[0.95]
              text-foreground
              sm:text-5xl
              lg:text-[50px]
            "
          >
            {dictionary.title}
          </h1>

          <p
            className="
              mx-auto
              mt-3
              w-full
              max-w-[540px]
              text-center
              text-xs
              leading-6
              text-foreground-soft
              sm:text-sm
            "
          >
            {dictionary.description}
          </p>
        </header>

        {/* ===================================================
            REGISTER PANEL
        =================================================== */}

        <section
          className="
            mx-auto
            mt-6
            w-full
            max-w-[900px]
          "
        >
          <div
            className="
              w-full
              border
              border-border
              bg-surface/40
              px-5
              py-6
              shadow-[0_24px_70px_rgba(36,35,32,0.06)]
              backdrop-blur-[2px]
              sm:px-8
              sm:py-7
              lg:px-10
            "
          >
            <form
              onSubmit={handleSubmit}
              className="w-full"
            >
              {/* =============================================
                  ERROR
              ============================================= */}

              {visibleError && (
                <div
                  role="alert"
                  className="
                    mb-5
                    border
                    border-danger/25
                    bg-danger/[0.04]
                    px-4
                    py-2.5
                  "
                >
                  <p
                    className="
                      text-center
                      text-xs
                      leading-5
                      text-danger
                    "
                  >
                    {visibleError}
                  </p>
                </div>
              )}

              {/* =============================================
                  NAME
              ============================================= */}

              <div
                className="
                  grid
                  gap-4
                  sm:grid-cols-2
                  sm:gap-6
                "
              >
                <TextField
                  label={
                    dictionary.firstName
                  }
                  value={firstName}
                  placeholder={
                    dictionary.firstNamePlaceholder
                  }
                  icon={UserRound}
                  autoComplete="given-name"
                  onChange={(value) => {
                    setFirstName(value);
                    resetErrors();
                  }}
                />

                <TextField
                  label={
                    dictionary.lastName
                  }
                  value={lastName}
                  placeholder={
                    dictionary.lastNamePlaceholder
                  }
                  icon={UserRound}
                  autoComplete="family-name"
                  onChange={(value) => {
                    setLastName(value);
                    resetErrors();
                  }}
                />
              </div>

              {/* =============================================
                  CONTACT
              ============================================= */}

              <div
                className="
                  mt-4
                  grid
                  gap-4
                  sm:grid-cols-2
                  sm:gap-6
                "
              >
                <TextField
                  label={
                    dictionary.email
                  }
                  value={email}
                  placeholder={
                    dictionary.emailPlaceholder
                  }
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  onChange={(value) => {
                    setEmail(value);
                    resetErrors();
                  }}
                />

                <TextField
                  label={
                    dictionary.phone
                  }
                  value={phone}
                  placeholder={
                    dictionary.phonePlaceholder
                  }
                  icon={Phone}
                  type="tel"
                  autoComplete="tel"
                  onChange={(value) => {
                    setPhone(value);
                    resetErrors();
                  }}
                />
              </div>

              {/* =============================================
                  PASSWORD
              ============================================= */}

              <div
                className="
                  mt-4
                  grid
                  gap-4
                  sm:grid-cols-2
                  sm:gap-6
                "
              >
                <PasswordField
                  label={
                    dictionary.password
                  }
                  value={password}
                  placeholder={
                    dictionary.passwordPlaceholder
                  }
                  showPassword={
                    showPassword
                  }
                  autoComplete="new-password"
                  onToggle={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  onChange={(value) => {
                    setPassword(value);
                    resetErrors();
                  }}
                />

                <PasswordField
                  label={
                    dictionary.confirmPassword
                  }
                  value={
                    confirmPassword
                  }
                  placeholder={
                    dictionary.confirmPasswordPlaceholder
                  }
                  showPassword={
                    showConfirmPassword
                  }
                  autoComplete="new-password"
                  onToggle={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }
                  onChange={(value) => {
                    setConfirmPassword(
                      value
                    );

                    resetErrors();
                  }}
                />
              </div>

              {/* =============================================
                  SECURITY
              ============================================= */}

              <div
                className="
                  mx-auto
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2.5
                  border-y
                  border-border
                  py-3.5
                "
              >
                <ShieldCheck
                  size={15}
                  strokeWidth={1.2}
                  className="
                    shrink-0
                    text-accent
                  "
                />

                <p
                  className="
                    max-w-[520px]
                    text-center
                    text-[9px]
                    leading-5
                    text-muted
                  "
                >
                  {getSecurityText(
                    locale
                  )}
                </p>
              </div>

              {/* =============================================
                  SUBMIT
              ============================================= */}

              <div
                className="
                  mx-auto
                  mt-5
                  w-full
                  max-w-[520px]
                "
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className={[
                    "group flex",
                    "min-h-[50px] w-full",
                    "items-center justify-center",
                    "gap-3 border px-5",
                    "text-[9px] font-semibold",
                    "uppercase tracking-[0.18em]",
                    "transition-all duration-300",

                    isLoading
                      ? "cursor-wait border-accent/40 bg-accent/70 text-white"
                      : "border-foreground bg-foreground text-white hover:border-accent hover:bg-accent",
                  ].join(" ")}
                >
                  {isLoading ? (
                    <LoaderCircle
                      size={15}
                      strokeWidth={1.4}
                      className="animate-spin"
                    />
                  ) : (
                    <ArrowRight
                      size={14}
                      strokeWidth={1.3}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                        rtl:rotate-180
                        rtl:group-hover:-translate-x-1
                      "
                    />
                  )}

                  <span>
                    {isLoading
                      ? dictionary.submitting
                      : dictionary.submit}
                  </span>
                </button>
              </div>

              {/* =============================================
                  LOGIN
              ============================================= */}

              <div
                className="
                  mx-auto
                  mt-5
                  max-w-[520px]
                  border-t
                  border-border
                  pt-4
                  text-center
                "
              >
                <p
                  className="
                    w-full
                    text-center
                    text-[10px]
                    leading-5
                    text-foreground-soft
                  "
                >
                  {
                    dictionary.alreadyAccount
                  }
                </p>

                <Link
                  href={`/${locale}/account/login`}
                  className="
                    group
                    mt-1.5
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    text-[8px]
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
                    {dictionary.login}
                  </span>

                  <ArrowRight
                    size={12}
                    strokeWidth={1.3}
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
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * TEXT FIELD
 * ============================================================
 */

type TextFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: FieldIcon;

  type?: string;
  autoComplete?: string;

  onChange: (
    value: string
  ) => void;
};

function TextField({
  label,
  value,
  placeholder,
  icon: Icon,
  type = "text",
  autoComplete,
  onChange,
}: TextFieldProps) {
  return (
    <label
      className="
        block
        w-full
      "
    >
      <span
        className="
          mb-2
          block
          text-[8px]
          font-semibold
          uppercase
          tracking-[0.14em]
          text-foreground-soft
        "
      >
        {label}
      </span>

      <div
        className="
          group
          relative
        "
      >
        <Icon
          size={15}
          strokeWidth={1.3}
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
          type={type}
          value={value}
          placeholder={
            placeholder
          }
          autoComplete={
            autoComplete
          }
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="
            h-[48px]
            w-full
            border
            border-border
            !bg-background
            ps-11
            pe-4
            text-xs
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
    </label>
  );
}

/*
 * ============================================================
 * PASSWORD FIELD
 * ============================================================
 */

type PasswordFieldProps = {
  label: string;
  value: string;
  placeholder: string;

  showPassword: boolean;

  autoComplete?: string;

  onToggle: () => void;

  onChange: (
    value: string
  ) => void;
};

function PasswordField({
  label,
  value,
  placeholder,
  showPassword,
  autoComplete,
  onToggle,
  onChange,
}: PasswordFieldProps) {
  return (
    <label
      className="
        block
        w-full
      "
    >
      <span
        className="
          mb-2
          block
          text-[8px]
          font-semibold
          uppercase
          tracking-[0.14em]
          text-foreground-soft
        "
      >
        {label}
      </span>

      <div
        className="
          group
          relative
        "
      >
        <LockKeyhole
          size={15}
          strokeWidth={1.3}
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
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={value}
          placeholder={
            placeholder
          }
          autoComplete={
            autoComplete
          }
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="
            h-[48px]
            w-full
            border
            border-border
            !bg-background
            ps-11
            pe-12
            text-xs
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
          onClick={onToggle}
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
            h-[48px]
            w-11
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
              size={15}
              strokeWidth={1.3}
            />
          ) : (
            <Eye
              size={15}
              strokeWidth={1.3}
            />
          )}
        </button>
      </div>
    </label>
  );
}

/*
 * ============================================================
 * SECURITY TEXT
 * ============================================================
 */

function getSecurityText(
  locale: Locale
) {
  if (locale === "en") {
    return "Your account is protected with secure sessions and encrypted password storage.";
  }

  if (locale === "ar") {
    return "تتم حماية حسابك باستخدام جلسات آمنة وتخزين مشفر لكلمة المرور.";
  }

  return "Hesap bilgileriniz güvenli oturum ve şifrelenmiş parola sistemiyle korunur.";
}