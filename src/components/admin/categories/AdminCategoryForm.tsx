"use client";

import {
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  Save,
} from "lucide-react";

import AdminProductImageUploader from "@/components/admin/products/AdminProductImageUploader";
import {
  useCategories,
  type CreateCategoryInput,
} from "@/contexts/CategoryContext";
import type { Locale } from "@/lib/i18n/config";
import type { Category } from "@/types/category";

type AdminCategoryFormDictionary = {
  basicInformation: string;
  basicInformationDescription: string;

  turkish: string;
  english: string;
  arabic: string;

  categoryName: string;
  eyebrow: string;

  slug: string;
  slugDescription: string;

  order: string;

  image: string;
  imageDescription: string;

  visibility: string;
  visibilityDescription: string;

  active: string;
  activeDescription: string;

  save: string;
  saving: string;
  cancel: string;

  requiredField: string;
  imageRequired: string;
  invalidOrder: string;
  saveError: string;
};

type AdminCategoryFormProps = {
  locale: Locale;
  dictionary: AdminCategoryFormDictionary;
  category?: Category;
};

type FormErrors = Partial<
  Record<
    | "nameTr"
    | "nameEn"
    | "nameAr"
    | "eyebrowTr"
    | "eyebrowEn"
    | "eyebrowAr"
    | "slug"
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

export default function AdminCategoryForm({
  locale,
  dictionary,
  category,
}: AdminCategoryFormProps) {
  const router = useRouter();

  const {
    categories,
    createCategory,
    updateCategory,
  } = useCategories();

  const [nameTr, setNameTr] = useState(
    category?.name.tr ?? ""
  );

  const [nameEn, setNameEn] = useState(
    category?.name.en ?? ""
  );

  const [nameAr, setNameAr] = useState(
    category?.name.ar ?? ""
  );

  const [eyebrowTr, setEyebrowTr] =
    useState(
      category?.eyebrow.tr ?? ""
    );

  const [eyebrowEn, setEyebrowEn] =
    useState(
      category?.eyebrow.en ?? ""
    );

  const [eyebrowAr, setEyebrowAr] =
    useState(
      category?.eyebrow.ar ?? ""
    );

  const [slug, setSlug] = useState(
    category?.slug ?? ""
  );

  const [
    slugWasManuallyEdited,
    setSlugWasManuallyEdited,
  ] = useState(Boolean(category));

  const [image, setImage] = useState(
    category?.image ?? ""
  );

  const [order, setOrder] = useState(
    category?.order.toString() ??
      (
        Math.max(
          0,
          ...categories.map(
            (item) => item.order
          )
        ) + 1
      ).toString()
  );

  const [isActive, setIsActive] =
    useState(
      category?.isActive ?? true
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function handleTurkishNameChange(
    value: string
  ) {
    setNameTr(value);

    setErrors((current) => ({
      ...current,
      nameTr: undefined,
    }));

    if (!slugWasManuallyEdited) {
      setSlug(createSlug(value));
    }
  }

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

    if (!eyebrowTr.trim()) {
      nextErrors.eyebrowTr =
        dictionary.requiredField;
    }

    if (!eyebrowEn.trim()) {
      nextErrors.eyebrowEn =
        dictionary.requiredField;
    }

    if (!eyebrowAr.trim()) {
      nextErrors.eyebrowAr =
        dictionary.requiredField;
    }

    if (!slug.trim()) {
      nextErrors.slug =
        dictionary.requiredField;
    }

    if (!image.trim()) {
      nextErrors.image =
        dictionary.imageRequired;
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

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

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
      const input: CreateCategoryInput = {
        slug,

        name: {
          tr: nameTr,
          en: nameEn,
          ar: nameAr,
        },

        eyebrow: {
          tr: eyebrowTr,
          en: eyebrowEn,
          ar: eyebrowAr,
        },

        image,

        order: Number(order),

        isActive,
      };

      if (category) {
        updateCategory(
          category.id,
          input
        );
      } else {
        createCategory(input);
      }

      router.push(
        `/${locale}/admin/categories`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Kategori kaydedilemedi:",
        error
      );

      setErrors({
        general:
          dictionary.saveError,
      });

      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full"
    >
      {errors.general && (
        <div
          role="alert"
          className="mb-8 border-s-2 border-danger bg-danger/10 px-5 py-4 text-sm leading-7 text-danger"
        >
          {errors.general}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* Sol alan */}
        <div className="min-w-0 space-y-8">
          <FormSection
            title={
              dictionary.basicInformation
            }
            description={
              dictionary.basicInformationDescription
            }
          >
            <div className="space-y-6">
              <LanguageSection
                language={
                  dictionary.turkish
                }
              >
                <TextField
                  label={
                    dictionary.categoryName
                  }
                  value={nameTr}
                  error={errors.nameTr}
                  onChange={
                    handleTurkishNameChange
                  }
                />

                <TextField
                  label={
                    dictionary.eyebrow
                  }
                  value={eyebrowTr}
                  error={
                    errors.eyebrowTr
                  }
                  onChange={setEyebrowTr}
                />
              </LanguageSection>

              <LanguageSection
                language={
                  dictionary.english
                }
              >
                <TextField
                  label={
                    dictionary.categoryName
                  }
                  value={nameEn}
                  error={errors.nameEn}
                  onChange={setNameEn}
                />

                <TextField
                  label={
                    dictionary.eyebrow
                  }
                  value={eyebrowEn}
                  error={
                    errors.eyebrowEn
                  }
                  onChange={setEyebrowEn}
                />
              </LanguageSection>

              <LanguageSection
                language={
                  dictionary.arabic
                }
              >
                <TextField
                  label={
                    dictionary.categoryName
                  }
                  value={nameAr}
                  error={errors.nameAr}
                  direction="rtl"
                  onChange={setNameAr}
                />

                <TextField
                  label={
                    dictionary.eyebrow
                  }
                  value={eyebrowAr}
                  error={
                    errors.eyebrowAr
                  }
                  direction="rtl"
                  onChange={setEyebrowAr}
                />
              </LanguageSection>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div>
                <TextField
                  label={dictionary.slug}
                  value={slug}
                  error={errors.slug}
                  direction="ltr"
                  onChange={(value) => {
                    setSlug(
                      createSlug(value)
                    );

                    setSlugWasManuallyEdited(
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

              <NumberField
                label={dictionary.order}
                value={order}
                error={errors.order}
                onChange={setOrder}
              />
            </div>
          </FormSection>

          {/* Görsel */}
          <FormSection
            title={dictionary.image}
            description={
              dictionary.imageDescription
            }
          >
            <AdminProductImageUploader
              label={dictionary.image}
              description={
                dictionary.imageDescription
              }
              value={image}
              required
              onChange={(url) => {
                setImage(url);

                setErrors(
                  (current) => ({
                    ...current,
                    image: undefined,
                  })
                );
              }}
            />

            {errors.image && (
              <p className="mt-3 text-xs text-danger">
                {errors.image}
              </p>
            )}
          </FormSection>
        </div>

        {/* Sağ panel */}
        <aside className="min-w-0">
          <div className="sticky top-[112px] space-y-6">
            <FormSection
              title={
                dictionary.visibility
              }
              description={
                dictionary.visibilityDescription
              }
              compact
            >
              <ToggleField
                checked={isActive}
                title={
                  dictionary.active
                }
                description={
                  dictionary.activeDescription
                }
                onChange={setIsActive}
              />
            </FormSection>

            <div className="border border-border bg-surface/45 p-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className={[
                  "inline-flex min-h-14",
                  "w-full items-center",
                  "justify-center gap-3",
                  "border px-6",
                  "text-[9px] font-semibold",
                  "uppercase tracking-[0.16em]",
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

              <Link
                href={`/${locale}/admin/categories`}
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

type FormSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
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

function LanguageSection({
  language,
  children,
}: {
  language: string;
  children: React.ReactNode;
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

type TextFieldProps = {
  label: string;
  value: string;
  error?: string;
  direction?: "ltr" | "rtl";
  onChange: (value: string) => void;
};

function TextField({
  label,
  value,
  error,
  direction,
  onChange,
}: TextFieldProps) {
  return (
    <label className="block min-w-0">
      <FieldLabel label={label} />

      <input
        type="text"
        value={value}
        dir={direction}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={[
          "h-14 w-full min-w-0",
          "border bg-background/60 px-5",
          "text-sm text-foreground",
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

function NumberField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <FieldLabel label={label} />

      <input
        type="number"
        min="0"
        step="1"
        value={value}
        dir="ltr"
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={[
          "h-14 w-full min-w-0",
          "border bg-background/60 px-5",
          "text-sm text-foreground",
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

function ToggleField({
  checked,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  onChange: (value: boolean) => void;
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