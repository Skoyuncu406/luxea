import type {
  Metadata,
} from "next";

import {
  notFound,
} from "next/navigation";

import AddressesContent, {
  type AddressesDictionary,
} from "@/components/account/AddressesContent";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n/config";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type AddressesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/*
 * ============================================================
 * DICTIONARY
 * ============================================================
 */

const dictionary:
  Record<
    Locale,
    AddressesDictionary
  > = {
  tr: {
    eyebrow:
      "LUXEA Hesabım",

    title:
      "Adreslerinizi yönetin.",

    description:
      "Teslimat adreslerinizi kaydedin, düzenleyin ve siparişleriniz için varsayılan adresinizi belirleyin.",

    back:
      "Hesabıma Dön",

    addAddress:
      "Yeni Adres Ekle",

    emptyTitle:
      "Henüz kayıtlı adresiniz yok.",

    emptyDescription:
      "Teslimat işlemlerini hızlandırmak için ilk adresinizi hesabınıza ekleyin.",

    defaultAddress:
      "Varsayılan Adres",

    setDefault:
      "Varsayılan Yap",

    edit:
      "Düzenle",

    delete:
      "Sil",

    deleting:
      "Siliniyor",

    addTitle:
      "Yeni adres ekleyin.",

    editTitle:
      "Adresi düzenleyin.",

    formDescription:
      "Teslimat için kullanılacak adres bilgilerini eksiksiz girin.",

    label:
      "Adres Başlığı",

    labelPlaceholder:
      "Örn. Ev, İş",

    firstName:
      "Ad",

    firstNamePlaceholder:
      "Adınızı girin",

    lastName:
      "Soyad",

    lastNamePlaceholder:
      "Soyadınızı girin",

    phone:
      "Telefon",

    phonePlaceholder:
      "+49...",

    country:
      "Ülke",

    countryPlaceholder:
      "Örn. DE",

    address:
      "Adres",

    addressPlaceholder:
      "Cadde, sokak ve bina numarası",

    addressLineTwo:
      "Adres Satırı 2",

    addressLineTwoPlaceholder:
      "Daire, kat vb. (isteğe bağlı)",

    city:
      "Şehir",

    cityPlaceholder:
      "Şehir",

    state:
      "Eyalet / Bölge",

    statePlaceholder:
      "Eyalet veya bölge (isteğe bağlı)",

    postalCode:
      "Posta Kodu",

    postalCodePlaceholder:
      "Posta kodu",

    makeDefault:
      "Bu adresi varsayılan teslimat adresim yap",

    save:
      "Adresi Kaydet",

    saving:
      "Kaydediliyor",

    update:
      "Değişiklikleri Kaydet",

    cancel:
      "Vazgeç",

    requiredFields:
      "Ad, soyad, ülke, adres, şehir ve posta kodu zorunludur.",

    loadError:
      "Adresleriniz yüklenemedi.",

    saveError:
      "Adres kaydedilemedi.",

    deleteError:
      "Adres silinemedi.",

    deleteConfirm:
      "Bu adresi silmek istediğinizden emin misiniz?",

    created:
      "Adres başarıyla eklendi.",

    updated:
      "Adres başarıyla güncellendi.",

    deleted:
      "Adres başarıyla silindi.",

    defaultUpdated:
      "Varsayılan adresiniz güncellendi.",

    loading:
      "Adresleriniz yükleniyor",
  },

  en: {
    eyebrow:
      "My LUXEA Account",

    title:
      "Manage your addresses.",

    description:
      "Save and manage your delivery addresses and choose the default address for your orders.",

    back:
      "Back to My Account",

    addAddress:
      "Add New Address",

    emptyTitle:
      "You don't have a saved address yet.",

    emptyDescription:
      "Add your first address to make future checkout and delivery faster.",

    defaultAddress:
      "Default Address",

    setDefault:
      "Set as Default",

    edit:
      "Edit",

    delete:
      "Delete",

    deleting:
      "Deleting",

    addTitle:
      "Add a new address.",

    editTitle:
      "Edit your address.",

    formDescription:
      "Enter the delivery address information completely.",

    label:
      "Address Label",

    labelPlaceholder:
      "e.g. Home, Work",

    firstName:
      "First Name",

    firstNamePlaceholder:
      "Enter your first name",

    lastName:
      "Last Name",

    lastNamePlaceholder:
      "Enter your last name",

    phone:
      "Phone",

    phonePlaceholder:
      "+49...",

    country:
      "Country",

    countryPlaceholder:
      "e.g. DE",

    address:
      "Address",

    addressPlaceholder:
      "Street and building number",

    addressLineTwo:
      "Address Line 2",

    addressLineTwoPlaceholder:
      "Apartment, floor, etc. (optional)",

    city:
      "City",

    cityPlaceholder:
      "City",

    state:
      "State / Region",

    statePlaceholder:
      "State or region (optional)",

    postalCode:
      "Postal Code",

    postalCodePlaceholder:
      "Postal code",

    makeDefault:
      "Make this my default delivery address",

    save:
      "Save Address",

    saving:
      "Saving",

    update:
      "Save Changes",

    cancel:
      "Cancel",

    requiredFields:
      "First name, last name, country, address, city and postal code are required.",

    loadError:
      "Your addresses could not be loaded.",

    saveError:
      "The address could not be saved.",

    deleteError:
      "The address could not be deleted.",

    deleteConfirm:
      "Are you sure you want to delete this address?",

    created:
      "Address added successfully.",

    updated:
      "Address updated successfully.",

    deleted:
      "Address deleted successfully.",

    defaultUpdated:
      "Your default address has been updated.",

    loading:
      "Loading your addresses",
  },

  ar: {
    eyebrow:
      "حسابي في LUXEA",

    title:
      "إدارة عناوينك.",

    description:
      "احفظ عناوين التوصيل وقم بإدارتها واختر العنوان الافتراضي لطلباتك.",

    back:
      "العودة إلى حسابي",

    addAddress:
      "إضافة عنوان جديد",

    emptyTitle:
      "لا توجد عناوين محفوظة بعد.",

    emptyDescription:
      "أضف عنوانك الأول لتسريع عملية الدفع والتوصيل مستقبلاً.",

    defaultAddress:
      "العنوان الافتراضي",

    setDefault:
      "تعيين كافتراضي",

    edit:
      "تعديل",

    delete:
      "حذف",

    deleting:
      "جارٍ الحذف",

    addTitle:
      "إضافة عنوان جديد.",

    editTitle:
      "تعديل العنوان.",

    formDescription:
      "أدخل معلومات عنوان التوصيل كاملة.",

    label:
      "اسم العنوان",

    labelPlaceholder:
      "مثال: المنزل، العمل",

    firstName:
      "الاسم",

    firstNamePlaceholder:
      "أدخل اسمك",

    lastName:
      "اسم العائلة",

    lastNamePlaceholder:
      "أدخل اسم العائلة",

    phone:
      "الهاتف",

    phonePlaceholder:
      "+49...",

    country:
      "الدولة",

    countryPlaceholder:
      "مثال: DE",

    address:
      "العنوان",

    addressPlaceholder:
      "الشارع ورقم المبنى",

    addressLineTwo:
      "سطر العنوان الثاني",

    addressLineTwoPlaceholder:
      "الشقة أو الطابق (اختياري)",

    city:
      "المدينة",

    cityPlaceholder:
      "المدينة",

    state:
      "الولاية / المنطقة",

    statePlaceholder:
      "الولاية أو المنطقة (اختياري)",

    postalCode:
      "الرمز البريدي",

    postalCodePlaceholder:
      "الرمز البريدي",

    makeDefault:
      "اجعل هذا عنوان التوصيل الافتراضي",

    save:
      "حفظ العنوان",

    saving:
      "جارٍ الحفظ",

    update:
      "حفظ التغييرات",

    cancel:
      "إلغاء",

    requiredFields:
      "الاسم واسم العائلة والدولة والعنوان والمدينة والرمز البريدي مطلوبة.",

    loadError:
      "تعذر تحميل عناوينك.",

    saveError:
      "تعذر حفظ العنوان.",

    deleteError:
      "تعذر حذف العنوان.",

    deleteConfirm:
      "هل أنت متأكد من أنك تريد حذف هذا العنوان؟",

    created:
      "تمت إضافة العنوان بنجاح.",

    updated:
      "تم تحديث العنوان بنجاح.",

    deleted:
      "تم حذف العنوان بنجاح.",

    defaultUpdated:
      "تم تحديث عنوانك الافتراضي.",

    loading:
      "جارٍ تحميل عناوينك",
  },
};

/*
 * ============================================================
 * METADATA
 * ============================================================
 */

export async function generateMetadata({
  params,
}: AddressesPageProps): Promise<Metadata> {
  const {
    locale,
  } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const content =
    dictionary[locale];

  return {
    title: content.title,

    description:
      content.description,

    robots: {
      index: false,
      follow: false,
    },
  };
}

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default async function AddressesPage({
  params,
}: AddressesPageProps) {
  const {
    locale,
  } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <AddressesContent
      locale={locale}
      dictionary={
        dictionary[locale]
      }
    />
  );
}