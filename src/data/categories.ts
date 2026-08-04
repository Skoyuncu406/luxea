import type { Category } from "@/types/category";

export const categories: Category[] = [
  {
    id: "category-shoes",
    slug: "shoes",
    name: {
      tr: "Ayakkabı",
      en: "Shoes",
      ar: "الأحذية",
    },
    eyebrow: {
      tr: "Zamansız Adımlar",
      en: "Timeless Steps",
      ar: "خطوات خالدة",
    },
    image: "/categories/shoes.jpg",
    order: 1,
    isActive: true,
  },
  {
    id: "category-wallets",
    slug: "wallets",
    name: {
      tr: "Cüzdan",
      en: "Wallets",
      ar: "المحافظ",
    },
    eyebrow: {
      tr: "İnce İşçilik",
      en: "Fine Craftsmanship",
      ar: "حرفية راقية",
    },
    image: "/categories/wallets.jpg",
    order: 2,
    isActive: true,
  },
  {
    id: "category-belts",
    slug: "belts",
    name: {
      tr: "Kemer",
      en: "Belts",
      ar: "الأحزمة",
    },
    eyebrow: {
      tr: "Güçlü Detaylar",
      en: "Refined Details",
      ar: "تفاصيل راقية",
    },
    image: "/categories/belts.jpg",
    order: 3,
    isActive: true,
  },
  {
    id: "category-watches",
    slug: "watches",
    name: {
      tr: "Saat",
      en: "Watches",
      ar: "الساعات",
    },
    eyebrow: {
      tr: "Zamanın Zarafeti",
      en: "The Elegance of Time",
      ar: "أناقة الوقت",
    },
    image: "/categories/watches.jpg",
    order: 4,
    isActive: true,
  },
  {
    id: "category-glasses",
    slug: "glasses",
    name: {
      tr: "Gözlük",
      en: "Eyewear",
      ar: "النظارات",
    },
    eyebrow: {
      tr: "Karakterli Bakış",
      en: "A Distinctive View",
      ar: "نظرة مميزة",
    },
    image: "/categories/glasses.jpg",
    order: 5,
    isActive: true,
  },
  {
    id: "category-bags",
    slug: "bags",
    name: {
      tr: "Çanta",
      en: "Bags",
      ar: "الحقائب",
    },
    eyebrow: {
      tr: "Günlük Lüks",
      en: "Everyday Luxury",
      ar: "فخامة يومية",
    },
    image: "/categories/bags.jpg",
    order: 6,
    isActive: true,
  },
];