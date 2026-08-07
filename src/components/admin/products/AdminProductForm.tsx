"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import AdminProductImageUploader from "@/components/admin/products/AdminProductImageUploader";

import { useCategories } from "@/contexts/CategoryContext";

import {
  useProducts,
  type CreateProductInput,
} from "@/contexts/ProductContext";

import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types/product";

type AdminProductFormDictionary = {
  basicInformation: string;
  basicInformationDescription: string;

  turkish: string;
  english: string;
  arabic: string;

  productName: string;
  shortDescription: string;

  slug: string;
  slugDescription: string;

  category: string;
  selectCategory: string;

  commerceInformation: string;
  commerceInformationDescription: string;

  price: string;
  currency: string;
  stock: string;
  order: string;

  colors: string;
  colorsDescription: string;
  addColor: string;
  removeColor: string;

  images: string;
  imagesDescription: string;

  mainImage: string;
  mainImageDescription: string;

  hoverImage: string;
  hoverImageDescription: string;

  visibility: string;
  visibilityDescription: string;

  active: string;
  activeDescription: string;

  featured: string;
  featuredDescription: string;

  newProduct: string;
  newProductDescription: string;

  save: string;
  saving: string;
  cancel: string;

  requiredField: string;
  invalidPrice: string;
  invalidStock: string;
  invalidOrder: string;

  imageRequired: string;
  categoryRequired: string;

  saveError: string;
};

type AdminProductFormProps = {
  locale: Locale;
  dictionary: AdminProductFormDictionary;
  product?: Product;
};

type FormErrors = Partial<
  Record<
    | "nameTr"
    | "nameEn"
    | "nameAr"
    | "descriptionTr"
    | "descriptionEn"
    | "descriptionAr"
    | "slug"
    | "categoryId"
    | "price"
    | "stock"
    | "order"
    | "image"
    | "general",
    string
  >
>;

function createSlug(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminProductForm({
  locale,
  dictionary,
  product,
}: AdminProductFormProps) {
  const router = useRouter();

  /*
   * PRODUCT CONTEXT
   */
  const {
    products,
    createProduct,
    updateProduct,
  } = useProducts();

  /*
   * CATEGORY CONTEXT
   *
   * Artık categories.ts kullanılmıyor.
   * Admin tarafından oluşturulan kategoriler
   * doğrudan buradan geliyor.
   */
  const {
    categories,
    isLoaded: categoriesLoaded,
  } = useCategories();

  /*
   * ÇOK DİLLİ ÜRÜN ADLARI
   */
  const [nameTr, setNameTr] = useState(
    product?.name.tr ?? ""
  );

  const [nameEn, setNameEn] = useState(
    product?.name.en ?? ""
  );

  const [nameAr, setNameAr] = useState(
    product?.name.ar ?? ""
  );

  /*
   * ÇOK DİLLİ AÇIKLAMALAR
   */
  const [
    descriptionTr,
    setDescriptionTr,
  ] = useState(
    product?.shortDescription.tr ?? ""
  );

  const [
    descriptionEn,
    setDescriptionEn,
  ] = useState(
    product?.shortDescription.en ?? ""
  );

  const [
    descriptionAr,
    setDescriptionAr,
  ] = useState(
    product?.shortDescription.ar ?? ""
  );

  /*
   * SLUG
   */
  const [slug, setSlug] = useState(
    product?.slug ?? ""
  );

  const [
    slugWasEdited,
    setSlugWasEdited,
  ] = useState(Boolean(product));

  /*
   * KATEGORİ
   */
  const [
    categoryId,
    setCategoryId,
  ] = useState(
    product?.categoryId ?? ""
  );

  /*
   * FİYAT
   */
  const [price, setPrice] = useState(
    product?.price.toString() ?? ""
  );

  const [
    currency,
    setCurrency,
  ] = useState<Product["currency"]>(
    product?.currency ?? "EUR"
  );

  /*
   * STOK
   *
   * Yeni üründe başlangıç değeri 1.
   * Böylece yanlışlıkla sıfır stokla ürün
   * oluşturma riski azalıyor.
   */
  const [stock, setStock] = useState(
    product?.stock.toString() ?? "1"
  );

  /*
   * ÜRÜN SIRALAMASI
   *
   * Yeni ürün için mevcut en yüksek order
   * değerinin bir fazlasını kullanıyoruz.
   */
  const defaultOrder = useMemo(() => {
    if (product) {
      return product.order;
    }

    const highestOrder = products.reduce(
      (highest, currentProduct) =>
        Math.max(
          highest,
          currentProduct.order
        ),
      0
    );

    return highestOrder + 1;
  }, [product, products]);

  const [order, setOrder] = useState(
    defaultOrder.toString()
  );

  /*
   * RENKLER
   */
  const [colors, setColors] = useState<
    string[]
  >(
    product?.colors.length
      ? product.colors
      : ["#242320"]
  );

  /*
   * GÖRSELLER
   */
  const [image, setImage] = useState(
    product?.image ?? ""
  );

  const [
    hoverImage,
    setHoverImage,
  ] = useState(
    product?.hoverImage ?? ""
  );

  /*
   * GÖRÜNÜRLÜK
   */
  const [
    isActive,
    setIsActive,
  ] = useState(
    product?.isActive ?? true
  );

  const [
    isFeatured,
    setIsFeatured,
  ] = useState(
    product?.isFeatured ?? false
  );

  const [isNew, setIsNew] = useState(
    product?.isNew ?? true
  );

  /*
   * FORM DURUMU
   */
  const [errors, setErrors] =
    useState<FormErrors>({});

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /*
   * DİNAMİK KATEGORİLER
   *
   * Sadece aktif kategoriler ürün formunda
   * gösterilir.
   *
   * Düzenlenen ürün pasif bir kategoriye
   * bağlıysa o kategori de formda tutulur.
   */
  const visibleCategories = useMemo(() => {
    return [...categories]
      .filter((category) => {
        if (category.isActive) {
          return true;
        }

        return (
          product?.categoryId ===
          category.id
        );
      })
      .sort(
        (a, b) => a.order - b.order
      );
  }, [
    categories,
    product?.categoryId,
  ]);

  /*
   * TÜRKÇE ÜRÜN ADINDAN
   * OTOMATİK SLUG
   */
  function handleTurkishNameChange(
    value: string
  ) {
    setNameTr(value);

    setErrors((current) => ({
      ...current,
      nameTr: undefined,
    }));

    if (!slugWasEdited) {
      setSlug(createSlug(value));
    }
  }

  /*
   * FORM DOĞRULAMA
   */
  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!nameTr.trim()) {
      nextErrors.nameTr =
        dictionary.requiredField;
    }

    if (!nameEn.trim()) {
      nextErrors.nameEn =
        dictionary.requiredField;
    }

    if (!nameAr.trim()) {
      nextErrors.nameAr =
        dictionary.requiredField;
    }

    if (!descriptionTr.trim()) {
      nextErrors.descriptionTr =
        dictionary.requiredField;
    }

    if (!descriptionEn.trim()) {
      nextErrors.descriptionEn =
        dictionary.requiredField;
    }

    if (!descriptionAr.trim()) {
      nextErrors.descriptionAr =
        dictionary.requiredField;
    }

    if (!slug.trim()) {
      nextErrors.slug =
        dictionary.requiredField;
    }

    /*
     * Kategori seçilmiş mi?
     */
    if (!categoryId) {
      nextErrors.categoryId =
        dictionary.categoryRequired;
    }

    /*
     * Seçilen kategori hâlâ sistemde var mı?
     */
    if (
      categoryId &&
      !categories.some(
        (category) =>
          category.id === categoryId
      )
    ) {
      nextErrors.categoryId =
        dictionary.categoryRequired;
    }

    const parsedPrice =
      Number(price);

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      nextErrors.price =
        dictionary.invalidPrice;
    }

    const parsedStock =
      Number(stock);

    if (
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      nextErrors.stock =
        dictionary.invalidStock;
    }

    const parsedOrder =
      Number(order);

    if (
      !Number.isInteger(parsedOrder) ||
      parsedOrder < 0
    ) {
      nextErrors.order =
        dictionary.invalidOrder;
    }

    if (!image.trim()) {
      nextErrors.image =
        dictionary.imageRequired;
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

  /*
   * ÜRÜN KAYDET
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      isSubmitting ||
      !validateForm()
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateProductInput = {
        slug,

        categoryId,

        name: {
          tr: nameTr,
          en: nameEn,
          ar: nameAr,
        },

        shortDescription: {
          tr: descriptionTr,
          en: descriptionEn,
          ar: descriptionAr,
        },

        image,

        hoverImage:
          hoverImage.trim() ||
          undefined,

        price: Number(price),

        currency,

        colors: colors
          .map((color) =>
            color.trim()
          )
          .filter(Boolean),

        order: Number(order),

        stock: Number(stock),

        isActive,
        isFeatured,
        isNew,
      };

      /*
       * EDIT MODE
       */
      if (product) {
        updateProduct(
          product.id,
          input
        );
      }

      /*
       * CREATE MODE
       */
      else {
        createProduct(input);
      }

      router.push(
        `/${locale}/admin/products`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Ürün kaydedilemedi:",
        error
      );

      setErrors({
        general:
          dictionary.saveError,
      });

      setIsSubmitting(false);
    }
  }

  /*
   * RENK GÜNCELLE
   */
  function updateColor(
    index: number,
    value: string
  ) {
    setColors(
      (currentColors) =>
        currentColors.map(
          (
            color,
            colorIndex
          ) =>
            colorIndex === index
              ? value
              : color
        )
    );
  }

  /*
   * RENK SİL
   */
  function removeColor(
    index: number
  ) {
    setColors(
      (currentColors) =>
        currentColors.filter(
          (_, colorIndex) =>
            colorIndex !== index
        )
    );
  }

  /*
   * CATEGORY CONTEXT
   * yüklenmeden formu göstermiyoruz.
   *
   * Böylece dropdown'un önce boş,
   * sonra dolu görünmesi engellenir.
   */
  if (!categoriesLoaded) {
    return (
      <div className="flex min-h-[420px] w-full items-center justify-center border-y border-border px-5 text-center">
        <div>
          <LoaderCircle
            size={24}
            strokeWidth={1.3}
            className="mx-auto animate-spin text-accent"
          />

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            {locale === "tr"
              ? "Kategoriler yükleniyor"
              : locale === "ar"
                ? "جارٍ تحميل الفئات"
                : "Loading categories"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      noValidate
    >
      {/* Genel hata */}
      {errors.general && (
        <div
          role="alert"
          className="mb-8 border-s-2 border-danger bg-danger/10 px-5 py-4 text-sm leading-7 text-danger"
        >
          {errors.general}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* SOL ANA ALAN */}
        <div className="min-w-0 space-y-8">
          {/* TEMEL BİLGİLER */}
          <FormSection
            title={
              dictionary.basicInformation
            }
            description={
              dictionary.basicInformationDescription
            }
          >
            <div className="grid gap-6">
              {/* TÜRKÇE */}
              <LanguageFieldGroup
                language={
                  dictionary.turkish
                }
              >
                <TextField
                  label={
                    dictionary.productName
                  }
                  value={nameTr}
                  error={errors.nameTr}
                  onChange={
                    handleTurkishNameChange
                  }
                />

                <TextAreaField
                  label={
                    dictionary.shortDescription
                  }
                  value={
                    descriptionTr
                  }
                  error={
                    errors.descriptionTr
                  }
                  onChange={
                    setDescriptionTr
                  }
                />
              </LanguageFieldGroup>

              {/* İNGİLİZCE */}
              <LanguageFieldGroup
                language={
                  dictionary.english
                }
              >
                <TextField
                  label={
                    dictionary.productName
                  }
                  value={nameEn}
                  error={errors.nameEn}
                  onChange={setNameEn}
                />

                <TextAreaField
                  label={
                    dictionary.shortDescription
                  }
                  value={
                    descriptionEn
                  }
                  error={
                    errors.descriptionEn
                  }
                  onChange={
                    setDescriptionEn
                  }
                />
              </LanguageFieldGroup>

              {/* ARAPÇA */}
              <LanguageFieldGroup
                language={
                  dictionary.arabic
                }
              >
                <TextField
                  label={
                    dictionary.productName
                  }
                  value={nameAr}
                  error={errors.nameAr}
                  direction="rtl"
                  onChange={setNameAr}
                />

                <TextAreaField
                  label={
                    dictionary.shortDescription
                  }
                  value={
                    descriptionAr
                  }
                  error={
                    errors.descriptionAr
                  }
                  direction="rtl"
                  onChange={
                    setDescriptionAr
                  }
                />
              </LanguageFieldGroup>
            </div>

            {/* SLUG + KATEGORİ */}
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div>
                <TextField
                  label={
                    dictionary.slug
                  }
                  value={slug}
                  error={errors.slug}
                  direction="ltr"
                  onChange={(value) => {
                    setSlug(
                      createSlug(value)
                    );

                    setSlugWasEdited(
                      true
                    );

                    setErrors(
                      (current) => ({
                        ...current,
                        slug: undefined,
                      })
                    );
                  }}
                />

                <p className="mt-2 text-[10px] leading-5 text-muted">
                  {
                    dictionary.slugDescription
                  }
                </p>
              </div>

              <SelectField
                label={
                  dictionary.category
                }
                value={categoryId}
                error={
                  errors.categoryId
                }
                onChange={(value) => {
                  setCategoryId(value);

                  setErrors(
                    (current) => ({
                      ...current,
                      categoryId:
                        undefined,
                    })
                  );
                }}
              >
                <option value="">
                  {
                    dictionary.selectCategory
                  }
                </option>

                {visibleCategories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name[
                          locale
                        ]
                      }
                    </option>
                  )
                )}
              </SelectField>
            </div>
          </FormSection>

          {/* TİCARİ BİLGİLER */}
          <FormSection
            title={
              dictionary.commerceInformation
            }
            description={
              dictionary.commerceInformationDescription
            }
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Fiyat */}
              <NumberField
                label={
                  dictionary.price
                }
                value={price}
                error={errors.price}
                min="0"
                step="0.01"
                onChange={setPrice}
              />

              {/* Para birimi */}
              <SelectField
                label={
                  dictionary.currency
                }
                value={currency}
                onChange={(value) =>
                  setCurrency(
                    value as Product["currency"]
                  )
                }
              >
                <option value="EUR">
                  EUR
                </option>

                <option value="USD">
                  USD
                </option>

                <option value="GBP">
                  GBP
                </option>
              </SelectField>

              {/* Stok */}
              <NumberField
                label={
                  dictionary.stock
                }
                value={stock}
                error={errors.stock}
                min="0"
                step="1"
                onChange={setStock}
              />

              {/* Sıralama */}
              <NumberField
                label={
                  dictionary.order
                }
                value={order}
                error={errors.order}
                min="0"
                step="1"
                onChange={setOrder}
              />
            </div>

            {/* RENKLER */}
            <div className="mt-8 border-t border-border pt-7">
              <div>
                <h3 className="text-[9px] font-semibold uppercase tracking-[0.18em] text-foreground">
                  {dictionary.colors}
                </h3>

                <p className="mt-2 text-xs leading-6 text-muted">
                  {
                    dictionary.colorsDescription
                  }
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {colors.map(
                  (
                    color,
                    index
                  ) => (
                    <div
                      key={index}
                      className="grid grid-cols-[54px_minmax(0,1fr)_44px] gap-3"
                    >
                      {/* Color Picker */}
                      <input
                        type="color"
                        value={
                          /^#[0-9A-Fa-f]{6}$/.test(
                            color
                          )
                            ? color
                            : "#242320"
                        }
                        onChange={(
                          event
                        ) =>
                          updateColor(
                            index,
                            event.target
                              .value
                          )
                        }
                        aria-label={
                          dictionary.colors
                        }
                        className="h-14 w-14 cursor-pointer border border-border bg-transparent p-1"
                      />

                      {/* HEX */}
                      <input
                        type="text"
                        value={color}
                        dir="ltr"
                        onChange={(
                          event
                        ) =>
                          updateColor(
                            index,
                            event.target
                              .value
                          )
                        }
                        className="h-14 min-w-0 border border-border bg-background/60 px-5 text-sm uppercase text-foreground outline-none transition-colors hover:border-border-strong focus:border-accent"
                      />

                      {/* Sil */}
                      <button
                        type="button"
                        onClick={() =>
                          removeColor(
                            index
                          )
                        }
                        disabled={
                          colors.length ===
                          1
                        }
                        aria-label={
                          dictionary.removeColor
                        }
                        className="flex h-14 w-11 items-center justify-center border border-border text-muted transition-colors hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Trash2
                          size={15}
                          strokeWidth={
                            1.4
                          }
                        />
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* Renk ekle */}
              <button
                type="button"
                onClick={() =>
                  setColors(
                    (current) => [
                      ...current,
                      "#92734A",
                    ]
                  )
                }
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 border border-border px-5 text-[8px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Plus
                  size={14}
                  strokeWidth={1.4}
                />

                {dictionary.addColor}
              </button>
            </div>
          </FormSection>

          {/* ÜRÜN GÖRSELLERİ */}
          <FormSection
            title={
              dictionary.images
            }
            description={
              dictionary.imagesDescription
            }
          >
            <div className="space-y-8">
              {/* Ana Görsel */}
              <div>
                <AdminProductImageUploader
                  label={
                    dictionary.mainImage
                  }
                  description={
                    dictionary.mainImageDescription
                  }
                  value={image}
                  onChange={(url) => {
                    setImage(url);

                    setErrors(
                      (current) => ({
                        ...current,
                        image: undefined,
                      })
                    );
                  }}
                  required
                />

                {errors.image && (
                  <p className="mt-3 text-xs text-danger">
                    {errors.image}
                  </p>
                )}
              </div>

              {/* Hover Görseli */}
              <AdminProductImageUploader
                label={
                  dictionary.hoverImage
                }
                description={
                  dictionary.hoverImageDescription
                }
                value={hoverImage}
                onChange={
                  setHoverImage
                }
              />
            </div>
          </FormSection>
        </div>

        {/* SAĞ PANEL */}
        <aside className="min-w-0">
          <div className="sticky top-[112px] space-y-6">
            {/* Görünürlük */}
            <FormSection
              title={
                dictionary.visibility
              }
              description={
                dictionary.visibilityDescription
              }
              compact
            >
              <div className="space-y-3">
                {/* Aktif */}
                <ToggleField
                  checked={isActive}
                  title={
                    dictionary.active
                  }
                  description={
                    dictionary.activeDescription
                  }
                  onChange={
                    setIsActive
                  }
                />

                {/* Öne çıkan */}
                <ToggleField
                  checked={isFeatured}
                  title={
                    dictionary.featured
                  }
                  description={
                    dictionary.featuredDescription
                  }
                  onChange={
                    setIsFeatured
                  }
                />

                {/* Yeni */}
                <ToggleField
                  checked={isNew}
                  title={
                    dictionary.newProduct
                  }
                  description={
                    dictionary.newProductDescription
                  }
                  onChange={setIsNew}
                />
              </div>
            </FormSection>

            {/* Kaydet */}
            <div className="border border-border bg-surface/45 p-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className={[
                  "inline-flex min-h-14 w-full",
                  "items-center justify-center gap-3",
                  "border px-6",
                  "text-[9px] font-semibold uppercase",
                  "tracking-[0.16em]",
                  "transition-all duration-300",
                  isSubmitting
                    ? "cursor-wait border-border bg-surface-strong text-muted"
                    : "border-foreground bg-foreground text-white hover:border-accent hover:bg-accent",
                ].join(" ")}
              >
                {isSubmitting ? (
                  <LoaderCircle
                    size={16}
                    strokeWidth={1.4}
                    className="animate-spin"
                  />
                ) : (
                  <Save
                    size={16}
                    strokeWidth={1.4}
                  />
                )}

                {isSubmitting
                  ? dictionary.saving
                  : dictionary.save}
              </button>

              {/* Vazgeç */}
              <Link
                href={`/${locale}/admin/products`}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-3 border border-border text-[8px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground"
              >
                <ArrowLeft
                  size={15}
                  strokeWidth={1.4}
                  className="rtl:rotate-180"
                />

                {dictionary.cancel}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

/*
 * FORM SECTION
 */

type FormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  compact?: boolean;
};

function FormSection({
  title,
  description,
  children,
  compact = false,
}: FormSectionProps) {
  return (
    <section
      className={[
        "border border-border bg-surface/40",
        compact
          ? "p-5"
          : "p-5 sm:p-7",
      ].join(" ")}
    >
      <div className="border-b border-border pb-5">
        <h2 className="font-heading text-3xl leading-none text-foreground">
          {title}
        </h2>

        <p className="mt-3 text-xs leading-6 text-muted">
          {description}
        </p>
      </div>

      <div className="pt-6">
        {children}
      </div>
    </section>
  );
}

/*
 * LANGUAGE GROUP
 */

function LanguageFieldGroup({
  language,
  children,
}: {
  language: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border border-border bg-background/35 p-5">
      <legend className="px-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
        {language}
      </legend>

      <div className="grid gap-5 md:grid-cols-2">
        {children}
      </div>
    </fieldset>
  );
}

/*
 * ORTAK FIELD PROP
 */

type FieldProps = {
  label: string;
  value: string;
  error?: string;
  direction?: "ltr" | "rtl";
  onChange: (value: string) => void;
};

/*
 * TEXT FIELD
 */

function TextField({
  label,
  value,
  error,
  direction,
  onChange,
}: FieldProps) {
  return (
    <label className="block min-w-0">
      <FieldLabel label={label} />

      <input
        type="text"
        value={value}
        dir={direction}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={[
          "h-14 w-full min-w-0",
          "border bg-background/60 px-5",
          "text-sm text-foreground outline-none",
          "transition-colors duration-300",
          error
            ? "border-danger"
            : "border-border hover:border-border-strong focus:border-accent",
        ].join(" ")}
      />

      <FieldError error={error} />
    </label>
  );
}

/*
 * TEXTAREA
 */

function TextAreaField({
  label,
  value,
  error,
  direction,
  onChange,
}: FieldProps) {
  return (
    <label className="block min-w-0">
      <FieldLabel label={label} />

      <textarea
        value={value}
        dir={direction}
        rows={4}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={[
          "min-h-28 w-full resize-y",
          "border bg-background/60",
          "px-5 py-4",
          "text-sm leading-7 text-foreground",
          "outline-none",
          "transition-colors duration-300",
          error
            ? "border-danger"
            : "border-border hover:border-border-strong focus:border-accent",
        ].join(" ")}
      />

      <FieldError error={error} />
    </label>
  );
}

/*
 * NUMBER FIELD
 */

function NumberField({
  label,
  value,
  error,
  min,
  step,
  onChange,
}: FieldProps & {
  min: string;
  step: string;
}) {
  return (
    <label className="block min-w-0">
      <FieldLabel label={label} />

      <input
        type="number"
        value={value}
        min={min}
        step={step}
        dir="ltr"
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={[
          "h-14 w-full min-w-0",
          "border bg-background/60 px-5",
          "text-sm text-foreground outline-none",
          "transition-colors duration-300",
          error
            ? "border-danger"
            : "border-border hover:border-border-strong focus:border-accent",
        ].join(" ")}
      />

      <FieldError error={error} />
    </label>
  );
}

/*
 * SELECT FIELD
 */

function SelectField({
  label,
  value,
  error,
  children,
  onChange,
}: FieldProps & {
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <FieldLabel label={label} />

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className={[
            "h-14 w-full appearance-none",
            "border bg-background/60",
            "px-5 pe-12",
            "text-sm text-foreground outline-none",
            "transition-colors duration-300",
            error
              ? "border-danger"
              : "border-border hover:border-border-strong focus:border-accent",
          ].join(" ")}
        >
          {children}
        </select>

        <ChevronDown
          size={15}
          strokeWidth={1.4}
          className="pointer-events-none absolute end-5 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>

      <FieldError error={error} />
    </label>
  );
}

/*
 * TOGGLE
 */

function ToggleField({
  checked,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() =>
        onChange(!checked)
      }
      className={[
        "flex w-full items-start gap-4",
        "border p-4 text-start",
        "transition-all duration-300",
        checked
          ? "border-accent bg-accent/10"
          : "border-border bg-background/35 hover:border-border-strong",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5 flex h-6 w-6",
          "shrink-0 items-center",
          "justify-center border",
          checked
            ? "border-accent bg-accent text-white"
            : "border-border-strong",
        ].join(" ")}
      >
        {checked && (
          <Check
            size={13}
            strokeWidth={1.7}
          />
        )}
      </span>

      <span>
        <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-foreground">
          {title}
        </span>

        <span className="mt-2 block text-[10px] leading-5 text-muted">
          {description}
        </span>
      </span>
    </button>
  );
}

/*
 * LABEL
 */

function FieldLabel({
  label,
}: {
  label: string;
}) {
  return (
    <span className="mb-3 block text-[8px] font-semibold uppercase tracking-[0.17em] text-muted">
      {label}
    </span>
  );
}

/*
 * ERROR
 */

function FieldError({
  error,
}: {
  error?: string;
}) {
  if (!error) {
    return null;
  }

  return (
    <span className="mt-2 block text-[10px] text-danger">
      {error}
    </span>
  );
}