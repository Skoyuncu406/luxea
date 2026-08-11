"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useUser,
} from "@/contexts/UserContext";

import type {
  Locale,
} from "@/lib/i18n/config";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type ProfileDictionary = {
  eyebrow: string;
  title: string;
  description: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  phonePlaceholder: string;

  emailNote: string;

  save: string;
  saving: string;
  success: string;

  requiredFields: string;
  loadError: string;

  back: string;

  secureTitle: string;
  secureDescription: string;
};

type ProfileContentProps = {
  locale: Locale;
  dictionary: ProfileDictionary;
};

type ProfileResponse = {
  success: boolean;

  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  } | null;

  message?: string;
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function ProfileContent({
  locale,
  dictionary,
}: ProfileContentProps) {
  const router =
    useRouter();

  const {
    user,
    refreshUser,
  } = useUser();

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    lastName,
    setLastName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /*
   * ==========================================================
   * LOAD PROFILE
   * ==========================================================
   */

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/account/profile",
            {
              method: "GET",
              credentials:
                "include",
              cache: "no-store",
            }
          );

        const data =
          (await response.json()) as
            ProfileResponse;

        if (
          response.status === 401
        ) {
          router.replace(
            `/${locale}/account/login`
          );

          return;
        }

        if (
          !response.ok ||
          !data.success ||
          !data.user
        ) {
          throw new Error(
            data.message ||
              dictionary.loadError
          );
        }

        if (!active) {
          return;
        }

        setFirstName(
          data.user.firstName
        );

        setLastName(
          data.user.lastName
        );

        setEmail(
          data.user.email
        );

        setPhone(
          data.user.phone || ""
        );
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : dictionary.loadError
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [
    dictionary.loadError,
    locale,
    router,
  ]);

  /*
   * ==========================================================
   * SAVE PROFILE
   * ==========================================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedFirstName =
      firstName.trim();

    const normalizedLastName =
      lastName.trim();

    const normalizedPhone =
      phone.trim();

    if (
      !normalizedFirstName ||
      !normalizedLastName
    ) {
      setError(
        dictionary.requiredFields
      );

      return;
    }

    try {
      setIsSaving(true);

      const response =
        await fetch(
          "/api/account/profile",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({
              firstName:
                normalizedFirstName,

              lastName:
                normalizedLastName,

              phone:
                normalizedPhone,
            }),
          }
        );

      const data =
        (await response.json()) as
          ProfileResponse;

      if (
        response.status === 401
      ) {
        router.replace(
          `/${locale}/account/login`
        );

        return;
      }

      if (
        !response.ok ||
        !data.success ||
        !data.user
      ) {
        throw new Error(
          data.message ||
            dictionary.loadError
        );
      }

      setFirstName(
        data.user.firstName
      );

      setLastName(
        data.user.lastName
      );

      setPhone(
        data.user.phone || ""
      );

      setEmail(
        data.user.email
      );

      /*
       * Navbar / AccountDashboard gibi
       * UserContext kullanan diğer alanları
       * da yeni bilgilerle senkronize eder.
       */

      await refreshUser();

      setSuccess(
        dictionary.success
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : dictionary.loadError
      );
    } finally {
      setIsSaving(false);
    }
  }

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (isLoading) {
    return (
      <main
        className="
          flex
          min-h-[calc(100vh-88px)]
          items-center
          justify-center
          bg-background
          px-5
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            text-center
          "
        >
          <LoaderCircle
            size={28}
            strokeWidth={1.2}
            className="
              animate-spin
              text-accent
            "
          />

          <p
            className="
              mt-5
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-muted
            "
          >
            {dictionary.eyebrow}
          </p>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * PAGE
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
        py-8
        text-foreground
        sm:px-6
        lg:px-8
        lg:py-10
      "
    >
      {/* =====================================================
          BACKGROUND DECORATION
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
            top-[-340px]
            h-[680px]
            w-[680px]
            -translate-x-1/2
            rounded-full
            bg-accent/[0.05]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-[-300px]
            right-[-220px]
            h-[520px]
            w-[520px]
            rounded-full
            bg-accent/[0.025]
            blur-3xl
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[900px]
        "
      >
        {/* ===================================================
            BACK
        =================================================== */}

        <div
          className="
            mb-7
            flex
            justify-center
          "
        >
          <Link
            href={`/${locale}/account`}
            className="
              group
              inline-flex
              items-center
              justify-center
              gap-2
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-muted
              transition-colors
              duration-300
              hover:text-accent
            "
          >
            {locale === "ar" ? (
              <ArrowRight
                size={13}
                strokeWidth={1.3}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            ) : (
              <ArrowLeft
                size={13}
                strokeWidth={1.3}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-x-1
                "
              />
            )}

            {dictionary.back}
          </Link>
        </div>

        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="
            mx-auto
            max-w-[650px]
            text-center
          "
        >
          <p
            className="
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
              mt-3
              text-center
              font-heading
              text-4xl
              leading-[0.95]
              text-foreground
              sm:text-5xl
              lg:text-[52px]
            "
          >
            {dictionary.title}
          </h1>

          <p
            className="
              mx-auto
              mt-4
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
            FORM
        =================================================== */}

        <section
          className="
            mt-8
            border
            border-border
            bg-surface/40
            px-5
            py-6
            shadow-[0_24px_70px_rgba(36,35,32,0.06)]
            backdrop-blur-[2px]
            sm:px-8
            sm:py-8
            lg:px-10
          "
        >
          <form
            onSubmit={
              handleSubmit
            }
          >
            {/* ===============================================
                MESSAGES
            =============================================== */}

            {error && (
              <div
                role="alert"
                className="
                  mb-6
                  border
                  border-danger/25
                  bg-danger/[0.04]
                  px-5
                  py-3
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
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="
                  mb-6
                  flex
                  items-center
                  justify-center
                  gap-3
                  border
                  border-success/25
                  bg-success/[0.04]
                  px-5
                  py-3
                "
              >
                <CheckCircle2
                  size={16}
                  strokeWidth={1.3}
                  className="
                    shrink-0
                    text-success
                  "
                />

                <p
                  className="
                    text-center
                    text-xs
                    leading-5
                    text-success
                  "
                >
                  {success}
                </p>
              </div>
            )}

            {/* ===============================================
                NAME
            =============================================== */}

            <div
              className="
                grid
                gap-5
                sm:grid-cols-2
                sm:gap-6
              "
            >
              <ProfileField
                label={
                  dictionary.firstName
                }
                value={
                  firstName
                }
                placeholder={
                  dictionary.firstNamePlaceholder
                }
                icon={
                  UserRound
                }
                autoComplete="given-name"
                onChange={(
                  value
                ) => {
                  setFirstName(
                    value
                  );

                  setError("");
                  setSuccess("");
                }}
              />

              <ProfileField
                label={
                  dictionary.lastName
                }
                value={
                  lastName
                }
                placeholder={
                  dictionary.lastNamePlaceholder
                }
                icon={
                  UserRound
                }
                autoComplete="family-name"
                onChange={(
                  value
                ) => {
                  setLastName(
                    value
                  );

                  setError("");
                  setSuccess("");
                }}
              />
            </div>

            {/* ===============================================
                CONTACT
            =============================================== */}

            <div
              className="
                mt-5
                grid
                gap-5
                sm:grid-cols-2
                sm:gap-6
              "
            >
              {/* EMAIL */}

              <div>
                <label
                  className="
                    block
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-foreground-soft
                  "
                >
                  {
                    dictionary.email
                  }
                </label>

                <div
                  className="
                    relative
                    mt-2
                  "
                >
                  <Mail
                    size={15}
                    strokeWidth={1.3}
                    className="
                      pointer-events-none
                      absolute
                      start-4
                      top-1/2
                      -translate-y-1/2
                      text-muted
                    "
                  />

                  <input
                    type="email"
                    value={email}
                    readOnly
                    aria-readonly="true"
                    className="
                      h-[50px]
                      w-full
                      cursor-not-allowed
                      border
                      border-border
                      bg-surface-strong/30
                      ps-11
                      pe-11
                      text-xs
                      text-muted
                      outline-none
                    "
                  />

                  <LockKeyhole
                    size={13}
                    strokeWidth={1.3}
                    className="
                      pointer-events-none
                      absolute
                      end-4
                      top-1/2
                      -translate-y-1/2
                      text-accent
                    "
                  />
                </div>

                <p
                  className="
                    mt-2
                    text-[9px]
                    leading-5
                    text-muted
                  "
                >
                  {
                    dictionary.emailNote
                  }
                </p>
              </div>

              {/* PHONE */}

              <ProfileField
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
                onChange={(
                  value
                ) => {
                  setPhone(value);

                  setError("");
                  setSuccess("");
                }}
              />
            </div>

            {/* ===============================================
                SECURITY
            =============================================== */}

            <div
              className="
                mt-7
                flex
                items-start
                justify-center
                gap-3
                border-y
                border-border
                py-4
                text-center
              "
            >
              <ShieldCheck
                size={17}
                strokeWidth={1.2}
                className="
                  mt-0.5
                  shrink-0
                  text-accent
                "
              />

              <div
                className="
                  max-w-[520px]
                "
              >
                <p
                  className="
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-foreground
                  "
                >
                  {
                    dictionary.secureTitle
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    leading-5
                    text-muted
                  "
                >
                  {
                    dictionary.secureDescription
                  }
                </p>
              </div>
            </div>

            {/* ===============================================
                SAVE
            =============================================== */}

            <div
              className="
                mx-auto
                mt-6
                w-full
                max-w-[520px]
              "
            >
              <button
                type="submit"
                disabled={
                  isSaving
                }
                className={[
                  "group flex",
                  "min-h-[50px]",
                  "w-full",
                  "items-center",
                  "justify-center",
                  "gap-3",
                  "border",
                  "px-6",
                  "text-[9px]",
                  "font-semibold",
                  "uppercase",
                  "tracking-[0.18em]",
                  "transition-all",
                  "duration-300",

                  isSaving
                    ? "cursor-wait border-accent/40 bg-accent/70 text-white"
                    : "border-foreground bg-foreground text-white hover:border-accent hover:bg-accent",
                ].join(" ")}
              >
                {isSaving ? (
                  <LoaderCircle
                    size={15}
                    strokeWidth={1.4}
                    className="
                      animate-spin
                    "
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
                  {isSaving
                    ? dictionary.saving
                    : dictionary.save}
                </span>
              </button>
            </div>

            {/* ===============================================
                ACCOUNT USER
            =============================================== */}

            {user && (
              <p
                className="
                  mt-4
                  text-center
                  text-[8px]
                  uppercase
                  tracking-[0.12em]
                  text-muted
                "
              >
                {user.email}
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * PROFILE FIELD
 * ============================================================
 */

type ProfileFieldProps = {
  label: string;

  value: string;

  placeholder: string;

  icon:
    typeof UserRound;

  type?: string;

  autoComplete?: string;

  onChange: (
    value: string
  ) => void;
};

function ProfileField({
  label,
  value,
  placeholder,
  icon: Icon,
  type = "text",
  autoComplete,
  onChange,
}: ProfileFieldProps) {
  return (
    <label
      className="
        block
        w-full
      "
    >
      <span
        className="
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
          mt-2
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
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          className="
            h-[50px]
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