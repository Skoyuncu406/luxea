"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import type { Locale } from "@/lib/i18n/config";

/* =========================================================
   CONTACT INFORMATION
========================================================= */

const PHONE_DISPLAY = "+90 545 357 78 06";
const PHONE_LINK = "+905453577806";

const EMAIL = "info@luxea.com";

const ADDRESS = {
  tr: "Adres bilgisi yakında eklenecektir.",
  en: "Address information will be added soon.",
  ar: "سيتم إضافة معلومات العنوان قريبًا.",
} as const;

const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram",
    href: "#",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "#",
  },
] as const;

/* =========================================================
   DICTIONARY
========================================================= */

const dictionary = {
  tr: {
    eyebrow: "İLETİŞİM",
    title: "LUXEA ile iletişime geçin.",
    description:
      "Ürünler, sipariş talepleri ve iş birlikleri hakkında bizimle doğrudan iletişime geçebilirsiniz.",
    address: "Adres",
    email: "E-posta",
    phone: "Telefon",
    socials: "Sosyal Medya",
    call: "Hemen Ara",
    rights: "Tüm hakları saklıdır.",
  },

  en: {
    eyebrow: "CONTACT",
    title: "Get in touch with LUXEA.",
    description:
      "Contact us directly for products, order requests and collaborations.",
    address: "Address",
    email: "Email",
    phone: "Phone",
    socials: "Social Media",
    call: "Call Now",
    rights: "All rights reserved.",
  },

  ar: {
    eyebrow: "تواصل",
    title: "تواصل مع LUXEA.",
    description:
      "يمكنكم التواصل معنا مباشرةً بخصوص المنتجات وطلبات الشراء والتعاون.",
    address: "العنوان",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    socials: "وسائل التواصل",
    call: "اتصل الآن",
    rights: "جميع الحقوق محفوظة.",
  },
} as const;

/* =========================================================
   TYPES
========================================================= */

type ContactFooterProps = {
  locale: Locale;
};

type ContactItemProps = {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ContactFooter({
  locale,
}: ContactFooterProps) {
  const content = dictionary[locale];
  const address = ADDRESS[locale];

  return (
    <footer className="relative overflow-hidden border-t border-border bg-[#242320] text-[#F3F0EA]">
      {/* PREMIUM BACKGROUND */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-40 top-0 h-[440px] w-[440px] rounded-full bg-accent/10 blur-[140px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -start-40 bottom-0 h-[340px] w-[340px] rounded-full bg-white/[0.025] blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
      />

      <div className="container-premium relative z-10">
        {/* MAIN CONTACT AREA */}

        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.08fr_1fr] lg:items-start lg:gap-20 lg:py-20">
          {/* LEFT */}

          <div className="max-w-2xl">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-accent-light sm:text-[10px]">
              {content.eyebrow}
            </p>

            <h2 className="mt-4 max-w-[620px] font-heading text-[40px] leading-[0.96] text-[#F3F0EA] sm:text-[50px] lg:text-[58px] xl:text-[64px]">
              {content.title}
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#F3F0EA]/60 sm:text-base sm:leading-8">
              {content.description}
            </p>

            {/* CALL BUTTON */}

            <a
              href={`tel:${PHONE_LINK}`}
              className="group mt-8 inline-flex min-h-13 items-center justify-center gap-4 border border-white/20 bg-[#af8b42] px-7 text-[9px] font-semibold uppercase tracking-[0.18em] !text-[#242320] shadow-[0_12px_35px_rgba(0,0,0,0.14)] transition-all duration-500 hover:-translate-y-1 hover:border-accent hover:bg-accent hover:!text-white hover:shadow-[0_18px_45px_rgba(146,115,74,0.22)]"
            >
              <Phone
                size={15}
                strokeWidth={1.4}
              />

              <span>
                {content.call}
              </span>

              <ArrowUpRight
                size={14}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              />
            </a>
          </div>

          {/* RIGHT */}

          <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            <ContactItem
              icon={MapPin}
              label={content.address}
              value={address}
            />

            <ContactItem
              icon={Mail}
              label={content.email}
              value={EMAIL}
              href={`mailto:${EMAIL}`}
            />

            <ContactItem
              icon={Phone}
              label={content.phone}
              value={PHONE_DISPLAY}
              href={`tel:${PHONE_LINK}`}
            />

            {/* SOCIAL MEDIA */}

            <div className="border-t border-white/10 pt-5">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#F3F0EA]/40">
                {content.socials}
              </p>

              <div className="mt-4 flex items-center gap-3">
                {SOCIAL_LINKS.map(
                  ({
                    id,
                    label,
                    href,
                  }) => (
                    <Link
                      key={id}
                      href={href}
                      aria-label={label}
                      title={label}
                      className="group relative flex h-11 w-11 items-center justify-center overflow-hidden border border-white/15 text-[#F3F0EA]/75 transition-all duration-500 hover:-translate-y-1 hover:border-accent hover:bg-accent hover:text-white hover:shadow-[0_12px_30px_rgba(146,115,74,0.18)]"
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 translate-y-full bg-white/[0.06] transition-transform duration-500 group-hover:translate-y-0"
                      />

                      {id ===
                      "instagram" ? (
                        <InstagramIcon />
                      ) : (
                        <LinkedInIcon />
                      )}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div className="flex min-h-[72px] flex-col items-center justify-between gap-4 border-t border-white/10 py-5 text-center sm:flex-row sm:text-start">
          <p className="font-heading text-2xl font-semibold tracking-[0.1em] text-[#F3F0EA]">
            LUXEA
          </p>

          <p className="text-[8px] uppercase tracking-[0.17em] text-[#F3F0EA]/40">
            © 2026 LUXEA
            <span className="mx-2">
              —
            </span>
            {content.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   CONTACT ITEM
========================================================= */

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: ContactItemProps) {
  const innerContent = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 text-accent-light transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
        <Icon
          size={15}
          strokeWidth={1.35}
        />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#F3F0EA]/40">
          {label}
        </p>

        <p className="mt-2 break-words text-sm leading-6 text-[#F3F0EA]/80 transition-colors duration-300 group-hover:text-white">
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="group flex items-start gap-4 border-t border-white/10 pt-5"
      >
        {innerContent}
      </a>
    );
  }

  return (
    <div className="group flex items-start gap-4 border-t border-white/10 pt-5">
      {innerContent}
    </div>
  );
}

/* =========================================================
   INSTAGRAM ICON
========================================================= */

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="relative z-10 h-[17px] w-[17px] fill-none stroke-current transition-transform duration-500 group-hover:scale-110"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.4"
        cy="6.6"
        r="0.85"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/* =========================================================
   LINKEDIN ICON
========================================================= */

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="relative z-10 h-[17px] w-[17px] fill-current transition-transform duration-500 group-hover:scale-110"
    >
      <path d="M5.337 7.433H2.19V21H5.337V7.433ZM3.765 3C2.75 3 2 3.758 2 4.75C2 5.742 2.75 6.5 3.726 6.5H3.746C4.78 6.5 5.473 5.742 5.473 4.75C5.454 3.758 4.78 3 3.765 3ZM21.81 13.225C21.81 9.117 19.616 7.208 16.69 7.208C14.328 7.208 13.272 8.508 12.678 9.422H12.639V7.433H9.492V21H12.776V14.286C12.776 12.514 13.113 10.798 15.653 10.798C18.154 10.798 18.193 13.146 18.193 14.404V21H21.477V13.894C21.477 13.659 21.673 13.441 21.81 13.225Z" />
    </svg>
  );
}