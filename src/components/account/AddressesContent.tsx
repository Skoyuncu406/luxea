"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type FormEvent,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Home,
  LoaderCircle,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import type {
  Locale,
} from "@/lib/i18n/config";

/*
 * ============================================================
 * EXPORTED DICTIONARY TYPE
 * ============================================================
 */

export type AddressesDictionary = {
  eyebrow: string;
  title: string;
  description: string;

  back: string;

  addAddress: string;

  emptyTitle: string;
  emptyDescription: string;

  defaultAddress: string;
  setDefault: string;

  edit: string;
  delete: string;
  deleting: string;

  addTitle: string;
  editTitle: string;
  formDescription: string;

  label: string;
  labelPlaceholder: string;

  firstName: string;
  firstNamePlaceholder: string;

  lastName: string;
  lastNamePlaceholder: string;

  phone: string;
  phonePlaceholder: string;

  country: string;
  countryPlaceholder: string;

  address: string;
  addressPlaceholder: string;

  addressLineTwo: string;
  addressLineTwoPlaceholder: string;

  city: string;
  cityPlaceholder: string;

  state: string;
  statePlaceholder: string;

  postalCode: string;
  postalCodePlaceholder: string;

  makeDefault: string;

  save: string;
  saving: string;
  update: string;
  cancel: string;

  requiredFields: string;

  loadError: string;
  saveError: string;
  deleteError: string;

  deleteConfirm: string;

  created: string;
  updated: string;
  deleted: string;
  defaultUpdated: string;

  loading: string;
};

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type AddressesContentProps = {
  locale: Locale;
  dictionary: AddressesDictionary;
};

type Address = {
  id: string;

  userId: string;

  label: string | null;

  firstName: string;
  lastName: string;
  phone: string | null;

  country: string;

  address: string;
  addressLineTwo: string | null;

  city: string;
  state: string | null;

  postalCode: string;

  isDefault: boolean;

  createdAt: string;
  updatedAt: string;
};

type AddressFormState = {
  label: string;

  firstName: string;
  lastName: string;
  phone: string;

  country: string;

  address: string;
  addressLineTwo: string;

  city: string;
  state: string;

  postalCode: string;

  isDefault: boolean;
};

type AddressesResponse = {
  success: boolean;

  addresses?: Address[];

  address?: Address;

  message?: string;
};

type FieldIcon =
  ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;

/*
 * ============================================================
 * EMPTY FORM
 * ============================================================
 */

const EMPTY_FORM:
  AddressFormState = {
  label: "",

  firstName: "",
  lastName: "",
  phone: "",

  country: "",

  address: "",
  addressLineTwo: "",

  city: "",
  state: "",

  postalCode: "",

  isDefault: false,
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function AddressesContent({
  locale,
  dictionary,
}: AddressesContentProps) {
  const router =
    useRouter();

  const [
    addresses,
    setAddresses,
  ] = useState<Address[]>([]);

  const [
    form,
    setForm,
  ] =
    useState<AddressFormState>(
      EMPTY_FORM
    );

  const [
    editingId,
    setEditingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    defaultChangingId,
    setDefaultChangingId,
  ] =
    useState<string | null>(
      null
    );

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
   * LOAD ADDRESSES
   * ==========================================================
   */

  const loadAddresses =
    useCallback(
      async () => {
        try {
          setError("");

          const response =
            await fetch(
              "/api/account/addresses",
              {
                method: "GET",

                cache:
                  "no-store",

                credentials:
                  "include",
              }
            );

          const data =
            (await response.json()) as
              AddressesResponse;

          if (
            response.status ===
            401
          ) {
            router.replace(
              `/${locale}/account/login`
            );

            return;
          }

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                dictionary.loadError
            );
          }

          setAddresses(
            Array.isArray(
              data.addresses
            )
              ? data.addresses
              : []
          );
        } catch (
          requestError
        ) {
          setError(
            requestError instanceof
              Error
              ? requestError.message
              : dictionary.loadError
          );
        } finally {
          setIsLoading(false);
        }
      },
      [
        dictionary.loadError,
        locale,
        router,
      ]
    );

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  /*
   * ==========================================================
   * HELPERS
   * ==========================================================
   */

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function updateField<
    K extends keyof AddressFormState,
  >(
    key: K,
    value: AddressFormState[K]
  ) {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );

    clearMessages();
  }

  function openNewAddress() {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,

      isDefault:
        addresses.length ===
        0,
    });

    clearMessages();

    setIsFormOpen(true);
  }

  function openEditAddress(
    address: Address
  ) {
    setEditingId(
      address.id
    );

    setForm({
      label:
        address.label || "",

      firstName:
        address.firstName,

      lastName:
        address.lastName,

      phone:
        address.phone || "",

      country:
        address.country,

      address:
        address.address,

      addressLineTwo:
        address.addressLineTwo ||
        "",

      city:
        address.city,

      state:
        address.state || "",

      postalCode:
        address.postalCode,

      isDefault:
        address.isDefault,
    });

    clearMessages();

    setIsFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setIsFormOpen(false);
    setEditingId(null);

    setForm(
      EMPTY_FORM
    );

    clearMessages();
  }

  /*
   * ==========================================================
   * SAVE
   * ==========================================================
   */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessages();

    const firstName =
      form.firstName.trim();

    const lastName =
      form.lastName.trim();

    const country =
      form.country.trim();

    const address =
      form.address.trim();

    const city =
      form.city.trim();

    const postalCode =
      form.postalCode.trim();

    if (
      !firstName ||
      !lastName ||
      !country ||
      !address ||
      !city ||
      !postalCode
    ) {
      setError(
        dictionary.requiredFields
      );

      return;
    }

    try {
      setIsSaving(true);

      const isEditing =
        Boolean(editingId);

      const url =
        isEditing
          ? `/api/account/addresses/${editingId}`
          : "/api/account/addresses";

      const response =
        await fetch(
          url,
          {
            method:
              isEditing
                ? "PATCH"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({
              label:
                form.label.trim(),

              firstName,
              lastName,

              phone:
                form.phone.trim(),

              country,

              address,

              addressLineTwo:
                form.addressLineTwo.trim(),

              city,

              state:
                form.state.trim(),

              postalCode,

              isDefault:
                form.isDefault,
            }),
          }
        );

      const data =
        (await response.json()) as
          AddressesResponse;

      if (
        response.status ===
        401
      ) {
        router.replace(
          `/${locale}/account/login`
        );

        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            dictionary.saveError
        );
      }

      await loadAddresses();

      setIsFormOpen(false);

      setEditingId(null);

      setForm(
        EMPTY_FORM
      );

      setSuccess(
        isEditing
          ? dictionary.updated
          : dictionary.created
      );
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : dictionary.saveError
      );
    } finally {
      setIsSaving(false);
    }
  }

  /*
   * ==========================================================
   * SET DEFAULT
   * ==========================================================
   */

  async function handleSetDefault(
    address: Address
  ) {
    if (
      address.isDefault ||
      defaultChangingId
    ) {
      return;
    }

    clearMessages();

    try {
      setDefaultChangingId(
        address.id
      );

      const response =
        await fetch(
          `/api/account/addresses/${address.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                label:
                  address.label ||
                  "",

                firstName:
                  address.firstName,

                lastName:
                  address.lastName,

                phone:
                  address.phone ||
                  "",

                country:
                  address.country,

                address:
                  address.address,

                addressLineTwo:
                  address.addressLineTwo ||
                  "",

                city:
                  address.city,

                state:
                  address.state ||
                  "",

                postalCode:
                  address.postalCode,

                isDefault:
                  true,
              }),
          }
        );

      const data =
        (await response.json()) as
          AddressesResponse;

      if (
        response.status ===
        401
      ) {
        router.replace(
          `/${locale}/account/login`
        );

        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            dictionary.saveError
        );
      }

      await loadAddresses();

      setSuccess(
        dictionary.defaultUpdated
      );
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : dictionary.saveError
      );
    } finally {
      setDefaultChangingId(
        null
      );
    }
  }

  /*
   * ==========================================================
   * DELETE
   * ==========================================================
   */

  async function handleDelete(
    address: Address
  ) {
    if (deletingId) {
      return;
    }

    const confirmed =
      window.confirm(
        dictionary.deleteConfirm
      );

    if (!confirmed) {
      return;
    }

    clearMessages();

    try {
      setDeletingId(
        address.id
      );

      const response =
        await fetch(
          `/api/account/addresses/${address.id}`,
          {
            method:
              "DELETE",

            credentials:
              "include",
          }
        );

      const data =
        (await response.json()) as
          AddressesResponse;

      if (
        response.status ===
        401
      ) {
        router.replace(
          `/${locale}/account/login`
        );

        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            dictionary.deleteError
        );
      }

      if (
        editingId ===
        address.id
      ) {
        setEditingId(null);
        setIsFormOpen(false);

        setForm(
          EMPTY_FORM
        );
      }

      await loadAddresses();

      setSuccess(
        dictionary.deleted
      );
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : dictionary.deleteError
      );
    } finally {
      setDeletingId(
        null
      );
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
            justify-center
            text-center
          "
        >
          <LoaderCircle
            size={30}
            strokeWidth={1.2}
            className="
              animate-spin
              text-accent
            "
          />

          <p
            className="
              mt-5
              text-center
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-muted
            "
          >
            {
              dictionary.loading
            }
          </p>
        </div>
      </main>
    );
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
        py-8
        text-foreground
        sm:px-6
        lg:px-8
        lg:py-10
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

      {/* =====================================================
          CONTAINER
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1000px]
        "
      >
        {/* ===================================================
            BACK
        =================================================== */}

        <div
          className="
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
            {locale ===
            "ar" ? (
              <ArrowRight
                size={13}
                strokeWidth={
                  1.3
                }
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            ) : (
              <ArrowLeft
                size={13}
                strokeWidth={
                  1.3
                }
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-x-1
                "
              />
            )}

            <span>
              {dictionary.back}
            </span>
          </Link>
        </div>

        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="
            mx-auto
            mt-6
            flex
            w-full
            max-w-[700px]
            flex-col
            items-center
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
            {
              dictionary.eyebrow
            }
          </p>

          <h1
            className="
              mt-3
              w-full
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
              max-w-[580px]
              text-center
              text-xs
              leading-6
              text-foreground-soft
              sm:text-sm
            "
          >
            {
              dictionary.description
            }
          </p>
        </header>

        {/* ===================================================
            MESSAGES
        =================================================== */}

        {error && (
          <div
            role="alert"
            className="
              mx-auto
              mt-7
              max-w-[760px]
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
              mx-auto
              mt-7
              flex
              max-w-[760px]
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

        {/* ===================================================
            ADD BUTTON
        =================================================== */}

        {!isFormOpen && (
          <div
            className="
              mt-8
              flex
              justify-center
            "
          >
            <button
              type="button"
              onClick={
                openNewAddress
              }
              className="
                group
                inline-flex
                min-h-[48px]
                items-center
                justify-center
                gap-3
                border
                border-foreground
                bg-foreground
                px-6
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white
                transition-all
                duration-300
                hover:border-accent
                hover:bg-accent
              "
            >
              <Plus
                size={15}
                strokeWidth={
                  1.4
                }
                className="
                  transition-transform
                  duration-300
                  group-hover:rotate-90
                "
              />

              <span>
                {
                  dictionary.addAddress
                }
              </span>
            </button>
          </div>
        )}

        {/* ===================================================
            ADDRESS FORM
        =================================================== */}

        {isFormOpen && (
          <AddressForm
            dictionary={
              dictionary
            }
            form={form}
            editing={
              Boolean(
                editingId
              )
            }
            isSaving={
              isSaving
            }
            onChange={
              updateField
            }
            onSubmit={
              handleSubmit
            }
            onCancel={
              closeForm
            }
          />
        )}

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {!isFormOpen &&
          addresses.length ===
            0 && (
            <section
              className="
                mx-auto
                mt-10
                flex
                min-h-[300px]
                max-w-[760px]
                flex-col
                items-center
                justify-center
                border-y
                border-border
                px-6
                py-12
                text-center
              "
            >
              <span
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  border
                  border-accent/25
                  bg-accent/[0.05]
                  text-accent
                "
              >
                <MapPin
                  size={25}
                  strokeWidth={
                    1.2
                  }
                />
              </span>

              <h2
                className="
                  mt-6
                  text-center
                  font-heading
                  text-3xl
                  leading-none
                  text-foreground
                  sm:text-4xl
                "
              >
                {
                  dictionary.emptyTitle
                }
              </h2>

              <p
                className="
                  mx-auto
                  mt-4
                  max-w-[480px]
                  text-center
                  text-xs
                  leading-6
                  text-foreground-soft
                  sm:text-sm
                "
              >
                {
                  dictionary.emptyDescription
                }
              </p>

              <button
                type="button"
                onClick={
                  openNewAddress
                }
                className="
                  group
                  mt-7
                  inline-flex
                  min-h-[48px]
                  items-center
                  justify-center
                  gap-3
                  border
                  border-foreground
                  bg-foreground
                  px-6
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-white
                  transition-all
                  duration-300
                  hover:border-accent
                  hover:bg-accent
                "
              >
                <Plus
                  size={15}
                  strokeWidth={
                    1.4
                  }
                />

                <span>
                  {
                    dictionary.addAddress
                  }
                </span>
              </button>
            </section>
          )}

        {/* ===================================================
            ADDRESS LIST
        =================================================== */}

        {addresses.length >
          0 && (
          <section
            className="
              mt-10
              grid
              gap-5
              md:grid-cols-2
            "
          >
            {addresses.map(
              (address) => (
                <AddressCard
                  key={
                    address.id
                  }
                  address={
                    address
                  }
                  dictionary={
                    dictionary
                  }
                  deleting={
                    deletingId ===
                    address.id
                  }
                  changingDefault={
                    defaultChangingId ===
                    address.id
                  }
                  disabled={
                    Boolean(
                      deletingId ||
                        defaultChangingId ||
                        isSaving
                    )
                  }
                  onEdit={() =>
                    openEditAddress(
                      address
                    )
                  }
                  onDelete={() =>
                    void handleDelete(
                      address
                    )
                  }
                  onSetDefault={() =>
                    void handleSetDefault(
                      address
                    )
                  }
                />
              )
            )}
          </section>
        )}
      </div>
    </main>
  );
}

/*
 * ============================================================
 * ADDRESS FORM
 * ============================================================
 */

type AddressFormProps = {
  dictionary:
    AddressesDictionary;

  form:
    AddressFormState;

  editing: boolean;
  isSaving: boolean;

  onChange: <
    K extends keyof AddressFormState,
  >(
    key: K,
    value: AddressFormState[K]
  ) => void;

  onSubmit: (
    event:
      FormEvent<HTMLFormElement>
  ) => void;

  onCancel:
    () => void;
};

function AddressForm({
  dictionary,
  form,
  editing,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  return (
    <section
      className="
        mx-auto
        mt-8
        w-full
        max-w-[900px]
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
      {/* HEADER */}

      <div
        className="
          mx-auto
          max-w-[620px]
          text-center
        "
      >
        <p
          className="
            text-center
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.24em]
            text-accent
          "
        >
          LUXEA
        </p>

        <h2
          className="
            mt-2
            text-center
            font-heading
            text-3xl
            leading-none
            text-foreground
            sm:text-4xl
          "
        >
          {editing
            ? dictionary.editTitle
            : dictionary.addTitle}
        </h2>

        <p
          className="
            mx-auto
            mt-3
            max-w-[500px]
            text-center
            text-xs
            leading-6
            text-muted
          "
        >
          {
            dictionary.formDescription
          }
        </p>
      </div>

      {/* FORM */}

      <form
        onSubmit={onSubmit}
        className="mt-7"
      >
        {/* LABEL */}

        <AddressField
          label={
            dictionary.label
          }
          placeholder={
            dictionary.labelPlaceholder
          }
          value={form.label}
          icon={Home}
          onChange={(value) =>
            onChange(
              "label",
              value
            )
          }
        />

        {/* NAME */}

        <div
          className="
            mt-5
            grid
            gap-5
            sm:grid-cols-2
            sm:gap-6
          "
        >
          <AddressField
            label={
              dictionary.firstName
            }
            placeholder={
              dictionary.firstNamePlaceholder
            }
            value={
              form.firstName
            }
            icon={
              UserRound
            }
            autoComplete="given-name"
            onChange={(value) =>
              onChange(
                "firstName",
                value
              )
            }
          />

          <AddressField
            label={
              dictionary.lastName
            }
            placeholder={
              dictionary.lastNamePlaceholder
            }
            value={
              form.lastName
            }
            icon={
              UserRound
            }
            autoComplete="family-name"
            onChange={(value) =>
              onChange(
                "lastName",
                value
              )
            }
          />
        </div>

        {/* PHONE / COUNTRY */}

        <div
          className="
            mt-5
            grid
            gap-5
            sm:grid-cols-2
            sm:gap-6
          "
        >
          <AddressField
            label={
              dictionary.phone
            }
            placeholder={
              dictionary.phonePlaceholder
            }
            value={
              form.phone
            }
            icon={Phone}
            type="tel"
            autoComplete="tel"
            onChange={(value) =>
              onChange(
                "phone",
                value
              )
            }
          />

          <AddressField
            label={
              dictionary.country
            }
            placeholder={
              dictionary.countryPlaceholder
            }
            value={
              form.country
            }
            icon={MapPin}
            autoComplete="country"
            onChange={(value) =>
              onChange(
                "country",
                value
              )
            }
          />
        </div>

        {/* ADDRESS */}

        <div className="mt-5">
          <AddressField
            label={
              dictionary.address
            }
            placeholder={
              dictionary.addressPlaceholder
            }
            value={
              form.address
            }
            icon={MapPin}
            autoComplete="address-line1"
            onChange={(value) =>
              onChange(
                "address",
                value
              )
            }
          />
        </div>

        <div className="mt-5">
          <AddressField
            label={
              dictionary.addressLineTwo
            }
            placeholder={
              dictionary.addressLineTwoPlaceholder
            }
            value={
              form.addressLineTwo
            }
            icon={MapPin}
            autoComplete="address-line2"
            onChange={(value) =>
              onChange(
                "addressLineTwo",
                value
              )
            }
          />
        </div>

        {/* CITY / STATE / POSTAL */}

        <div
          className="
            mt-5
            grid
            gap-5
            sm:grid-cols-3
            sm:gap-6
          "
        >
          <AddressField
            label={
              dictionary.city
            }
            placeholder={
              dictionary.cityPlaceholder
            }
            value={
              form.city
            }
            icon={MapPin}
            autoComplete="address-level2"
            onChange={(value) =>
              onChange(
                "city",
                value
              )
            }
          />

          <AddressField
            label={
              dictionary.state
            }
            placeholder={
              dictionary.statePlaceholder
            }
            value={
              form.state
            }
            icon={MapPin}
            autoComplete="address-level1"
            onChange={(value) =>
              onChange(
                "state",
                value
              )
            }
          />

          <AddressField
            label={
              dictionary.postalCode
            }
            placeholder={
              dictionary.postalCodePlaceholder
            }
            value={
              form.postalCode
            }
            icon={MapPin}
            autoComplete="postal-code"
            onChange={(value) =>
              onChange(
                "postalCode",
                value
              )
            }
          />
        </div>

        {/* DEFAULT */}

        <label
          className="
            group
            mt-6
            flex
            cursor-pointer
            items-center
            justify-center
            gap-3
            border-y
            border-border
            py-4
            text-center
          "
        >
          <input
            type="checkbox"
            checked={
              form.isDefault
            }
            onChange={(
              event
            ) =>
              onChange(
                "isDefault",
                event.target
                  .checked
              )
            }
            className="peer sr-only"
          />

          <span
            className="
              flex
              h-5
              w-5
              shrink-0
              items-center
              justify-center
              border
              border-border-strong
              text-transparent
              transition-all
              duration-300
              peer-checked:border-accent
              peer-checked:bg-accent
              peer-checked:text-white
            "
          >
            <Check
              size={13}
              strokeWidth={1.6}
            />
          </span>

          <span
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.13em]
              text-foreground-soft
              transition-colors
              duration-300
              group-hover:text-accent
            "
          >
            {
              dictionary.makeDefault
            }
          </span>
        </label>

        {/* ACTIONS */}

        <div
          className="
            mx-auto
            mt-6
            flex
            w-full
            max-w-[600px]
            flex-col
            gap-3
            sm:flex-row
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="
              inline-flex
              min-h-[50px]
              flex-1
              items-center
              justify-center
              gap-2
              border
              border-border-strong
              px-5
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-foreground
              transition-all
              duration-300
              hover:border-foreground
              hover:bg-foreground
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X
              size={14}
              strokeWidth={1.4}
            />

            {
              dictionary.cancel
            }
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className={[
              "group inline-flex",
              "min-h-[50px]",
              "flex-[1.5]",
              "items-center",
              "justify-center",
              "gap-3",
              "border px-5",
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
                strokeWidth={
                  1.4
                }
                className="animate-spin"
              />
            ) : (
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

            <span>
              {isSaving
                ? dictionary.saving
                : editing
                  ? dictionary.update
                  : dictionary.save}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}

/*
 * ============================================================
 * ADDRESS CARD
 * ============================================================
 */

type AddressCardProps = {
  address: Address;

  dictionary:
    AddressesDictionary;

  deleting: boolean;

  changingDefault:
    boolean;

  disabled: boolean;

  onEdit: () => void;
  onDelete: () => void;
  onSetDefault:
    () => void;
};

function AddressCard({
  address,
  dictionary,
  deleting,
  changingDefault,
  disabled,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const title =
    address.label?.trim() ||
    `${address.firstName} ${address.lastName}`;

  return (
    <article
      className={[
        "group relative",
        "flex min-h-[330px]",
        "flex-col",
        "overflow-hidden",
        "border",
        "px-6 py-6",
        "transition-all",
        "duration-500",

        address.isDefault
          ? "border-accent/45 bg-accent/[0.035]"
          : "border-border bg-surface/25 hover:-translate-y-1 hover:border-accent/40 hover:bg-surface/60 hover:shadow-[0_22px_60px_rgba(36,35,32,0.07)]",
      ].join(" ")}
    >
      {/* TOP */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <span
          className={[
            "flex h-12 w-12",
            "items-center",
            "justify-center",
            "border",
            "transition-all",
            "duration-500",

            address.isDefault
              ? "border-accent bg-accent text-white"
              : "border-accent/25 bg-accent/[0.04] text-accent group-hover:border-accent group-hover:bg-accent group-hover:text-white",
          ].join(" ")}
        >
          <MapPin
            size={19}
            strokeWidth={
              1.2
            }
          />
        </span>

        {address.isDefault && (
          <span
            className="
              inline-flex
              items-center
              gap-2
              border
              border-accent/30
              bg-accent/[0.06]
              px-3
              py-2
              text-[7px]
              font-semibold
              uppercase
              tracking-[0.15em]
              text-accent
            "
          >
            <Star
              size={11}
              strokeWidth={
                1.4
              }
              fill="currentColor"
            />

            {
              dictionary.defaultAddress
            }
          </span>
        )}
      </div>

      {/* CONTENT */}

      <div
        className="
          mt-6
          flex-1
          text-center
        "
      >
        <h2
          className="
            text-center
            font-heading
            text-3xl
            leading-none
            text-foreground
            transition-colors
            duration-500
            group-hover:text-accent
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-4
            text-center
            text-xs
            font-semibold
            text-foreground
          "
        >
          {address.firstName}{" "}
          {address.lastName}
        </p>

        {address.phone && (
          <p
            className="
              mt-2
              text-center
              text-xs
              text-muted
            "
          >
            {address.phone}
          </p>
        )}

        <div
          className="
            mx-auto
            mt-5
            max-w-[320px]
            text-center
            text-xs
            leading-6
            text-foreground-soft
          "
        >
          <p>
            {address.address}
          </p>

          {address.addressLineTwo && (
            <p>
              {
                address.addressLineTwo
              }
            </p>
          )}

          <p>
            {address.postalCode}{" "}
            {address.city}
          </p>

          {address.state && (
            <p>
              {address.state}
            </p>
          )}

          <p
            className="
              mt-1
              font-semibold
              uppercase
              tracking-[0.08em]
              text-foreground
            "
          >
            {address.country}
          </p>
        </div>
      </div>

      {/* DEFAULT ACTION */}

      {!address.isDefault && (
        <button
          type="button"
          onClick={
            onSetDefault
          }
          disabled={
            disabled
          }
          className="
            mx-auto
            mt-5
            inline-flex
            min-h-9
            items-center
            justify-center
            gap-2
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-muted
            transition-colors
            duration-300
            hover:text-accent
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {changingDefault ? (
            <LoaderCircle
              size={13}
              strokeWidth={
                1.3
              }
              className="animate-spin"
            />
          ) : (
            <Star
              size={13}
              strokeWidth={
                1.3
              }
            />
          )}

          {
            dictionary.setDefault
          }
        </button>
      )}

      {/* ACTIONS */}

      <div
        className="
          mt-5
          grid
          grid-cols-2
          border-t
          border-border
          pt-5
        "
      >
        <button
          type="button"
          onClick={onEdit}
          disabled={
            disabled
          }
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            border-e
            border-border
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-foreground-soft
            transition-colors
            duration-300
            hover:text-accent
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Pencil
            size={13}
            strokeWidth={
              1.3
            }
          />

          {dictionary.edit}
        </button>

        <button
          type="button"
          onClick={
            onDelete
          }
          disabled={
            disabled
          }
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-foreground-soft
            transition-colors
            duration-300
            hover:text-danger
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {deleting ? (
            <LoaderCircle
              size={13}
              strokeWidth={
                1.3
              }
              className="animate-spin"
            />
          ) : (
            <Trash2
              size={13}
              strokeWidth={
                1.3
              }
            />
          )}

          {deleting
            ? dictionary.deleting
            : dictionary.delete}
        </button>
      </div>

      {/* PREMIUM LINE */}

      <span
        className={[
          "absolute",
          "bottom-0",
          "left-1/2",
          "h-px",
          "-translate-x-1/2",
          "bg-accent",
          "transition-all",
          "duration-700",

          address.isDefault
            ? "w-[72%]"
            : "w-0 group-hover:w-[72%]",
        ].join(" ")}
      />
    </article>
  );
}

/*
 * ============================================================
 * ADDRESS FIELD
 * ============================================================
 */

type AddressFieldProps = {
  label: string;

  placeholder: string;

  value: string;

  icon: FieldIcon;

  type?: string;

  autoComplete?: string;

  onChange: (
    value: string
  ) => void;
};

function AddressField({
  label,
  placeholder,
  value,
  icon: Icon,
  type = "text",
  autoComplete,
  onChange,
}: AddressFieldProps) {
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