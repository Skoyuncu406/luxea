import {
  notFound,
} from "next/navigation";

import CheckoutContent from "@/components/checkout/CheckoutContent";
import Navbar from "@/components/layout/Navbar";

import {
  isValidLocale,
} from "@/lib/i18n/config";

import {
  getDictionary,
} from "@/lib/i18n/get-dictionary";

/*
 * =============================================================
 * TYPES
 * =============================================================
 */

type CheckoutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/*
 * =============================================================
 * PAGE COPY
 * =============================================================
 */

const pageCopy = {
  tr: {
    eyebrow:
      "Sipariş Talebi",

    title:
      "Siparişinizi oluşturun.",

    description:
      "İletişim ve teslimat bilgilerinizi tamamlayın. Sipariş talebiniz tarafımıza ulaştıktan sonra ekibimiz en geç 12 saat içerisinde sizinle iletişime geçecektir.",

    note:
      "Bu aşamada online ödeme alınmamaktadır.",
  },

  en: {
    eyebrow:
      "Order Request",

    title:
      "Create your order.",

    description:
      "Complete your contact and delivery details. Once your order request reaches us, our team will contact you within 12 hours.",

    note:
      "No online payment is collected at this stage.",
  },

  ar: {
    eyebrow:
      "طلب الطلب",

    title:
      "أنشئ طلبك.",

    description:
      "أكمل معلومات الاتصال والتوصيل. بعد استلام طلبك، سيتواصل معك فريقنا خلال مدة لا تتجاوز 12 ساعة.",

    note:
      "لا يتم تحصيل أي دفعة إلكترونية في هذه المرحلة.",
  },
} as const;

/*
 * =============================================================
 * PAGE
 * =============================================================
 */

export default async function CheckoutPage({
  params,
}: CheckoutPageProps) {
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

  const dictionary =
    await getDictionary(
      locale
    );

  const content =
    pageCopy[locale];

  return (
    <main
      className="
        min-h-screen
        bg-background
        text-foreground
      "
    >
      <Navbar
        locale={locale}
        dictionary={
          dictionary
        }
      />

      <section
        className="
          pt-[120px]
          sm:pt-[128px]
          lg:pt-[88px]
        "
      >
        <div
          className="
            container-premium
            py-12
            sm:py-14
            lg:py-16
          "
        >
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div
            className="
              mx-auto
              flex
              max-w-[900px]
              flex-col
              items-center
              text-center
            "
          >
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-accent
                sm:text-[11px]
              "
            >
              {content.eyebrow}
            </p>

            <h1
              className="
                mt-4
                text-balance
                font-heading
                text-[44px]
                leading-[0.95]
                text-foreground
                sm:text-6xl
                lg:text-7xl
                xl:text-[78px]
              "
            >
              {content.title}
            </h1>

            <p
              className="
                mx-auto
                mt-6
                max-w-[720px]
                text-center
                text-sm
                leading-7
                text-foreground-soft
                sm:text-base
                sm:leading-8
              "
            >
              {content.description}
            </p>

            {/* ONLINE PAYMENT NOTE */}

            <div
              className="
                mt-6
                inline-flex
                items-center
                justify-center
                border-y
                border-accent/25
                px-5
                py-3
              "
            >
              <p
                className="
                  text-center
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.17em]
                  text-accent
                  sm:text-[10px]
                "
              >
                {content.note}
              </p>
            </div>
          </div>

          {/* =================================================
              ORDER REQUEST FORM
          ================================================= */}

          <CheckoutContent
            locale={locale}
            dictionary={
              dictionary.checkoutPage
            }
          />
        </div>
      </section>
    </main>
  );
}