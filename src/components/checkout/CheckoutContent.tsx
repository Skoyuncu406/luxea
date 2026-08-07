"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  CreditCard,
  LockKeyhole,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useProducts } from "@/contexts/ProductContext";
import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types/product";

type CheckoutDictionary = {
  completeOrder: string;
  creatingOrder: string;

  contactTitle: string;
  shippingTitle: string;
  orderSummary: string;

  email: string;
  firstName: string;
  lastName: string;
  country: string;
  selectCountry: string;
  address: string;
  addressLineTwo: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;

  subtotal: string;
  shipping: string;
  shippingCalculated: string;
  total: string;

  quantity: string;
  color: string;

  securePayment: string;
  securePaymentDescription: string;
  continueToPayment: string;
  backToCart: string;

  requiredField: string;
  invalidEmail: string;
  countryRequired: string;
  turkeyUnavailable: string;
  emptyCart: string;
};

type CheckoutContentProps = {
  locale: Locale;
  dictionary: CheckoutDictionary;
};

type CheckoutFormState = {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  addressLineTwo: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
};

type FormErrors = Partial<
  Record<keyof CheckoutFormState, string>
>;

const COUNTRIES = [
  {
    code: "DE",
    tr: "Almanya",
    en: "Germany",
    ar: "ألمانيا",
  },
  {
    code: "FR",
    tr: "Fransa",
    en: "France",
    ar: "فرنسا",
  },
  {
    code: "NL",
    tr: "Hollanda",
    en: "Netherlands",
    ar: "هولندا",
  },
  {
    code: "BE",
    tr: "Belçika",
    en: "Belgium",
    ar: "بلجيكا",
  },
  {
    code: "AT",
    tr: "Avusturya",
    en: "Austria",
    ar: "النمسا",
  },
  {
    code: "CH",
    tr: "İsviçre",
    en: "Switzerland",
    ar: "سويسرا",
  },
  {
    code: "IT",
    tr: "İtalya",
    en: "Italy",
    ar: "إيطاليا",
  },
  {
    code: "ES",
    tr: "İspanya",
    en: "Spain",
    ar: "إسبانيا",
  },
  {
    code: "GB",
    tr: "Birleşik Krallık",
    en: "United Kingdom",
    ar: "المملكة المتحدة",
  },
  {
    code: "US",
    tr: "Amerika Birleşik Devletleri",
    en: "United States",
    ar: "الولايات المتحدة",
  },
  {
    code: "CA",
    tr: "Kanada",
    en: "Canada",
    ar: "كندا",
  },
  {
    code: "AE",
    tr: "Birleşik Arap Emirlikleri",
    en: "United Arab Emirates",
    ar: "الإمارات العربية المتحدة",
  },
  {
    code: "SA",
    tr: "Suudi Arabistan",
    en: "Saudi Arabia",
    ar: "المملكة العربية السعودية",
  },
  {
    code: "QA",
    tr: "Katar",
    en: "Qatar",
    ar: "قطر",
  },
  {
    code: "KW",
    tr: "Kuveyt",
    en: "Kuwait",
    ar: "الكويت",
  },
] as const;

const initialFormState: CheckoutFormState = {
  email: "",
  firstName: "",
  lastName: "",
  country: "",
  address: "",
  addressLineTwo: "",
  city: "",
  state: "",
  postalCode: "",
  phone: "",
};

export default function CheckoutContent({
  locale,
  dictionary,
}: CheckoutContentProps) {
  const router = useRouter();

  /*
   * ============================================================
   * CART
   * ============================================================
   */
  const {
    cartItems,
    isLoaded: isCartLoaded,
    clearCart,
  } = useCart();

  /*
   * ============================================================
   * PRODUCTS
   *
   * Ürünler artık statik olarak prop üzerinden gelmiyor.
   * ProductContext kullanıldığı için admin panelinden eklenen
   * yeni ürünler de checkout tarafından görülebilir.
   * ============================================================
   */
  const {
    products,
    isLoaded: areProductsLoaded,
    decreaseProductStocks,
    restoreProductStocks,
  } = useProducts();

  /*
   * ============================================================
   * ORDERS
   * ============================================================
   */
  const {
    createOrder,
    isLoaded: areOrdersLoaded,
  } = useOrders();

  /*
   * ============================================================
   * FORM STATE
   * ============================================================
   */
  const [form, setForm] =
    useState<CheckoutFormState>(initialFormState);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /*
   * Sepet, ürünler ve sipariş sistemi tamamen yüklenmeden
   * checkout içeriğini göstermiyoruz.
   */
  const isLoaded =
    isCartLoaded &&
    areProductsLoaded &&
    areOrdersLoaded;

  /*
   * ============================================================
   * SEPET ÜRÜNLERİNİ GÜNCEL PRODUCT CONTEXT İLE EŞLEŞTİR
   * ============================================================
   */
  const resolvedCartItems = useMemo(() => {
    return cartItems
      .map((cartItem) => {
        const product = products.find(
          (currentProduct) =>
            currentProduct.id ===
              cartItem.productId &&
            currentProduct.isActive
        );

        if (!product) {
          return null;
        }

        return {
          cartItem,
          product,
        };
      })
      .filter(
        (
          item
        ): item is {
          cartItem: (typeof cartItems)[number];
          product: Product;
        } => item !== null
      );
  }, [cartItems, products]);

  /*
   * ============================================================
   * ARA TOPLAM
   * ============================================================
   */
  const subtotal = useMemo(() => {
    return resolvedCartItems.reduce(
      (total, { cartItem, product }) =>
        total +
        product.price * cartItem.quantity,
      0
    );
  }, [resolvedCartItems]);

  /*
   * Şimdilik sepetin ilk ürününün para birimi kullanılıyor.
   */
  const currency =
    resolvedCartItems[0]?.product.currency ??
    "USD";

  /*
   * ============================================================
   * FORM ALANI GÜNCELLEME
   * ============================================================
   */
  function updateField(
    field: keyof CheckoutFormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  /*
   * ============================================================
   * FORM DOĞRULAMA
   * ============================================================
   */
  function validateForm() {
    const nextErrors: FormErrors = {};

    const requiredFields: Array<
      keyof CheckoutFormState
    > = [
      "email",
      "firstName",
      "lastName",
      "country",
      "address",
      "city",
      "postalCode",
      "phone",
    ];

    requiredFields.forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] =
          field === "country"
            ? dictionary.countryRequired
            : dictionary.requiredField;
      }
    });

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      form.email.trim() &&
      !emailPattern.test(form.email.trim())
    ) {
      nextErrors.email =
        dictionary.invalidEmail;
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

  /*
   * ============================================================
   * SİPARİŞ OLUŞTUR
   * ============================================================
   */
  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formIsValid = validateForm();

    if (!formIsValid) {
      return;
    }

    if (resolvedCartItems.length === 0) {
      return;
    }

    /*
     * Sipariş oluşturulmadan hemen önce stokları tekrar kontrol et.
     */
    const hasInvalidStock =
      resolvedCartItems.some(
        ({ cartItem, product }) =>
          product.stock < cartItem.quantity
      );

    if (hasInvalidStock) {
      return;
    }

    setIsSubmitting(true);

    /*
     * Stok düşürme işlemi başarılı olduktan sonra sipariş
     * oluşturulurken hata oluşursa stokları geri yüklemek için
     * bu bilgiyi tutuyoruz.
     */
    let stocksDecreased = false;

    try {
      /*
       * ========================================================
       * STOKLARI DÜŞÜR
       * ========================================================
       */
      decreaseProductStocks(
        resolvedCartItems.map(
          ({ cartItem, product }) => ({
            productId: product.id,
            quantity: cartItem.quantity,
          })
        )
      );

      stocksDecreased = true;

      /*
       * ========================================================
       * ORDER ITEMS
       * ========================================================
       */
      const orderItems =
        resolvedCartItems.map(
          ({ cartItem, product }) => ({
            id: cartItem.id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.image,
            color: cartItem.color,
            quantity: cartItem.quantity,
            unitPrice: product.price,
            currency: product.currency,
          })
        );

      /*
       * ========================================================
       * SİPARİŞİ OLUŞTUR
       * ========================================================
       */
      const order = createOrder({
        customer: {
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
        },

        shippingAddress: {
          country: form.country,
          address: form.address.trim(),
          addressLineTwo:
            form.addressLineTwo.trim() ||
            undefined,
          city: form.city.trim(),
          state:
            form.state.trim() || undefined,
          postalCode:
            form.postalCode.trim(),
        },

        items: orderItems,

        subtotal,

        shippingCost: 0,

        currency,
      });

      /*
       * ========================================================
       * SEPETİ TEMİZLE
       * ========================================================
       */
      clearCart();

      /*
       * ========================================================
       * SİPARİŞ TAMAMLANDI SAYFASINA GİT
       * ========================================================
       */
      router.push(
        `/${locale}/order-complete/${encodeURIComponent(
          order.trackingCode
        )}`
      );
    } catch (error) {
      console.error(
        "Sipariş oluşturulamadı:",
        error
      );

      /*
       * Sipariş oluşturulamadıysa düşürülen stokları geri yükle.
       */
      if (stocksDecreased) {
        try {
          restoreProductStocks(
            resolvedCartItems.map(
              ({ cartItem, product }) => ({
                productId: product.id,
                quantity: cartItem.quantity,
              })
            )
          );
        } catch (restoreError) {
          console.error(
            "Ürün stokları geri yüklenemedi:",
            restoreError
          );
        }
      }

      setIsSubmitting(false);
    }
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (!isLoaded) {
    return (
      <div className="mt-12 grid animate-pulse gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-5">
          <div className="h-16 bg-surface-strong/40" />
          <div className="h-16 bg-surface-strong/40" />
          <div className="h-16 bg-surface-strong/40" />
          <div className="h-16 bg-surface-strong/40" />
        </div>

        <div className="h-[520px] bg-surface-strong/40" />
      </div>
    );
  }

  /*
   * ============================================================
   * BOŞ SEPET
   * ============================================================
   */
  if (resolvedCartItems.length === 0) {
    return (
      <div className="mt-12 flex min-h-[480px] flex-col items-center justify-center border-y border-border px-5 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface/50">
          <ShoppingBag
            size={29}
            strokeWidth={1.1}
            className="text-accent"
          />
        </span>

        <h2 className="mt-8 max-w-xl font-heading text-4xl leading-none text-foreground sm:text-5xl">
          {dictionary.emptyCart}
        </h2>

        <Link
          href={`/${locale}/products`}
          className={[
            "mt-9 inline-flex min-h-14",
            "items-center justify-center",
            "border border-foreground",
            "bg-foreground px-8",
            "text-[10px] font-semibold uppercase",
            "tracking-[0.17em] !text-[#F3F0EA]",
            "transition-all duration-300",
            "hover:border-accent hover:bg-accent",
            "hover:!text-white",
          ].join(" ")}
        >
          {dictionary.backToCart}
        </Link>
      </div>
    );
  }

  /*
   * ============================================================
   * CHECKOUT
   * ============================================================
   */
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={[
        "mt-12 grid gap-12",
        "lg:grid-cols-[minmax(0,1fr)_400px]",
        "lg:gap-16",
        "xl:grid-cols-[minmax(0,1fr)_440px]",
      ].join(" ")}
    >
      {/* ======================================================
          SOL TARAF
      ====================================================== */}
      <div className="min-w-0">

        {/* İletişim */}
        <section>
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <span className="flex h-8 w-8 items-center justify-center border border-accent text-[10px] font-semibold text-accent">
              01
            </span>

            <h2 className="font-heading text-3xl leading-none text-foreground sm:text-4xl">
              {dictionary.contactTitle}
            </h2>
          </div>

          <div className="mt-6">
            <CheckoutInput
              type="email"
              value={form.email}
              label={dictionary.email}
              error={errors.email}
              autoComplete="email"
              onChange={(value) =>
                updateField("email", value)
              }
            />
          </div>
        </section>

        {/* ====================================================
            TESLİMAT
        ==================================================== */}
        <section className="mt-12">
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <span className="flex h-8 w-8 items-center justify-center border border-accent text-[10px] font-semibold text-accent">
              02
            </span>

            <h2 className="font-heading text-3xl leading-none text-foreground sm:text-4xl">
              {dictionary.shippingTitle}
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <CheckoutInput
              value={form.firstName}
              label={dictionary.firstName}
              error={errors.firstName}
              autoComplete="given-name"
              onChange={(value) =>
                updateField(
                  "firstName",
                  value
                )
              }
            />

            <CheckoutInput
              value={form.lastName}
              label={dictionary.lastName}
              error={errors.lastName}
              autoComplete="family-name"
              onChange={(value) =>
                updateField(
                  "lastName",
                  value
                )
              }
            />

            {/* Ülke */}
            <div className="relative sm:col-span-2">
              <select
                value={form.country}
                onChange={(event) =>
                  updateField(
                    "country",
                    event.target.value
                  )
                }
                aria-label={dictionary.country}
                className={[
                  "h-16 w-full appearance-none",
                  "border bg-surface/55",
                  "px-5 pe-12 pt-5",
                  "text-sm text-foreground",
                  "outline-none transition-all duration-300",
                  "focus:border-accent focus:bg-surface",
                  errors.country
                    ? "border-danger"
                    : "border-border hover:border-border-strong",
                ].join(" ")}
              >
                <option value="">
                  {dictionary.selectCountry}
                </option>

                {COUNTRIES.map(
                  (country) => (
                    <option
                      key={country.code}
                      value={country.code}
                    >
                      {country[locale]}
                    </option>
                  )
                )}
              </select>

              <span className="pointer-events-none absolute start-5 top-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
                {dictionary.country}
              </span>

              <ChevronDown
                size={15}
                strokeWidth={1.4}
                className="pointer-events-none absolute end-5 top-1/2 -translate-y-1/2 text-muted"
              />

              {errors.country && (
                <p className="mt-2 text-[10px] text-danger">
                  {errors.country}
                </p>
              )}
            </div>

            {/* Adres */}
            <div className="sm:col-span-2">
              <CheckoutInput
                value={form.address}
                label={dictionary.address}
                error={errors.address}
                autoComplete="address-line1"
                onChange={(value) =>
                  updateField(
                    "address",
                    value
                  )
                }
              />
            </div>

            {/* Adres 2 */}
            <div className="sm:col-span-2">
              <CheckoutInput
                value={
                  form.addressLineTwo
                }
                label={
                  dictionary.addressLineTwo
                }
                autoComplete="address-line2"
                onChange={(value) =>
                  updateField(
                    "addressLineTwo",
                    value
                  )
                }
              />
            </div>

            {/* Şehir */}
            <CheckoutInput
              value={form.city}
              label={dictionary.city}
              error={errors.city}
              autoComplete="address-level2"
              onChange={(value) =>
                updateField("city", value)
              }
            />

            {/* Eyalet */}
            <CheckoutInput
              value={form.state}
              label={dictionary.state}
              error={errors.state}
              autoComplete="address-level1"
              onChange={(value) =>
                updateField("state", value)
              }
            />

            {/* Posta kodu */}
            <CheckoutInput
              value={form.postalCode}
              label={dictionary.postalCode}
              error={errors.postalCode}
              autoComplete="postal-code"
              onChange={(value) =>
                updateField(
                  "postalCode",
                  value
                )
              }
            />

            {/* Telefon */}
            <CheckoutInput
              type="tel"
              value={form.phone}
              label={dictionary.phone}
              error={errors.phone}
              autoComplete="tel"
              onChange={(value) =>
                updateField("phone", value)
              }
            />
          </div>

          {/* Türkiye satış uyarısı */}
          <div className="mt-5 border-s-2 border-accent bg-surface/45 px-5 py-4">
            <p className="text-xs leading-6 text-foreground-soft">
              {dictionary.turkeyUnavailable}
            </p>
          </div>
        </section>

        {/* ====================================================
            GÜVENLİ ÖDEME
        ==================================================== */}
        <div className="mt-10 flex items-start gap-4 border-y border-border py-6">
          <LockKeyhole
            size={20}
            strokeWidth={1.25}
            className="mt-0.5 shrink-0 text-accent"
          />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-foreground">
              {dictionary.securePayment}
            </p>

            <p className="mt-2 text-xs leading-6 text-foreground-soft">
              {
                dictionary.securePaymentDescription
              }
            </p>
          </div>
        </div>

        {/* ====================================================
            ALT BUTONLAR
        ==================================================== */}
        <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/${locale}/cart`}
            className={[
              "group inline-flex min-h-12",
              "items-center justify-center gap-3",
              "text-[9px] font-semibold uppercase",
              "tracking-[0.17em] text-foreground",
              "transition-colors duration-300",
              "hover:text-accent",
              "sm:justify-start",
            ].join(" ")}
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.4}
              className={[
                "transition-transform duration-300",
                "group-hover:-translate-x-1",
                "rtl:rotate-180",
                "rtl:group-hover:translate-x-1",
              ].join(" ")}
            />

            <span>
              {dictionary.backToCart}
            </span>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              "inline-flex min-h-14",
              "items-center justify-center gap-3",
              "border px-8",
              "text-[10px] font-semibold uppercase",
              "tracking-[0.17em]",
              "transition-all duration-300",
              isSubmitting
                ? "cursor-wait border-border bg-surface-strong text-muted"
                : "border-[#242320] bg-[#242320] !text-[#F3F0EA] hover:border-accent hover:bg-accent hover:!text-white",
            ].join(" ")}
          >
            <CreditCard
              size={17}
              strokeWidth={1.4}
            />

            <span>
              {isSubmitting
                ? dictionary.creatingOrder
                : dictionary.completeOrder}
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================
          SAĞ TARAF - SİPARİŞ ÖZETİ
      ====================================================== */}
      <aside className="min-w-0 lg:sticky lg:top-[116px] lg:self-start">
        <div className="border border-border bg-surface/60 p-5 sm:p-7">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-accent">
            LUXEA
          </p>

          <h2 className="mt-3 font-heading text-4xl leading-none text-foreground">
            {dictionary.orderSummary}
          </h2>

          {/* Ürünler */}
          <div className="mt-7 max-h-[390px] space-y-5 overflow-y-auto pe-2">
            {resolvedCartItems.map(
              ({ cartItem, product }) => (
                <article
                  key={cartItem.id}
                  className={[
                    "grid",
                    "grid-cols-[78px_minmax(0,1fr)]",
                    "gap-4 border-b border-border",
                    "pb-5",
                  ].join(" ")}
                >
                  {/* Görsel */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-background">
                    <Image
                      src={product.image}
                      alt={
                        product.name[locale]
                      }
                      fill
                      sizes="78px"
                      className="object-cover object-center"
                    />

                    <span className="absolute end-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[8px] font-semibold text-white">
                      {cartItem.quantity}
                    </span>
                  </div>

                  {/* Ürün bilgileri */}
                  <div className="min-w-0">
                    <h3 className="font-heading text-xl leading-none text-foreground">
                      {
                        product.name[locale]
                      }
                    </h3>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted">
                        {dictionary.color}
                      </span>

                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 rounded-full border border-black/15"
                        style={{
                          backgroundColor:
                            cartItem.color,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-[10px] font-semibold tracking-[0.05em] text-foreground">
                      {formatPrice(
                        product.price *
                          cartItem.quantity,
                        product.currency,
                        locale
                      )}
                    </p>
                  </div>
                </article>
              )
            )}
          </div>

          {/* ==================================================
              TUTARLAR
          ================================================== */}
          <div className="mt-7 space-y-4 border-y border-border py-6">
            <div className="flex items-center justify-between gap-6">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted">
                {dictionary.subtotal}
              </span>

              <span className="text-sm font-semibold text-foreground">
                {formatPrice(
                  subtotal,
                  currency,
                  locale
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted">
                {dictionary.shipping}
              </span>

              <span className="text-end text-[10px] text-muted">
                {
                  dictionary.shippingCalculated
                }
              </span>
            </div>
          </div>

          {/* Toplam */}
          <div className="flex items-end justify-between gap-6 pt-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-foreground">
              {dictionary.total}
            </span>

            <strong className="font-heading text-3xl font-medium leading-none text-foreground">
              {formatPrice(
                subtotal,
                currency,
                locale
              )}
            </strong>
          </div>
        </div>
      </aside>
    </form>
  );
}

/*
 * =============================================================
 * CHECKOUT INPUT
 * =============================================================
 */
type CheckoutInputProps = {
  value: string;
  label: string;
  error?: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  onChange: (value: string) => void;
};

function CheckoutInput({
  value,
  label,
  error,
  type = "text",
  autoComplete,
  onChange,
}: CheckoutInputProps) {
  return (
    <label className="block">
      <span className="sr-only">
        {label}
      </span>

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder=" "
          autoComplete={autoComplete}
          className={[
            "peer h-16 w-full border",
            "bg-surface/55 px-5 pt-5",
            "text-sm text-foreground",
            "outline-none transition-all duration-300",
            "hover:border-border-strong",
            "focus:border-accent focus:bg-surface",
            error
              ? "border-danger"
              : "border-border",
          ].join(" ")}
        />

        <span
          className={[
            "pointer-events-none absolute",
            "start-5 top-1/2 -translate-y-1/2",
            "text-xs text-muted",
            "transition-all duration-200",

            "peer-focus:top-3",
            "peer-focus:translate-y-0",
            "peer-focus:text-[8px]",
            "peer-focus:font-semibold",
            "peer-focus:uppercase",
            "peer-focus:tracking-[0.16em]",
            "peer-focus:text-accent",

            "peer-[:not(:placeholder-shown)]:top-3",
            "peer-[:not(:placeholder-shown)]:translate-y-0",
            "peer-[:not(:placeholder-shown)]:text-[8px]",
            "peer-[:not(:placeholder-shown)]:font-semibold",
            "peer-[:not(:placeholder-shown)]:uppercase",
            "peer-[:not(:placeholder-shown)]:tracking-[0.16em]",
          ].join(" ")}
        >
          {label}
        </span>
      </div>

      {error && (
        <p className="mt-2 text-[10px] text-danger">
          {error}
        </p>
      )}
    </label>
  );
}