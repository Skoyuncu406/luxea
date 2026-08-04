import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "product-heritage-wallet",
    slug: "heritage-leather-wallet",
    categoryId: "category-wallets",

    name: {
      tr: "Heritage Deri Cüzdan",
      en: "Heritage Leather Wallet",
      ar: "محفظة هيريتج الجلدية",
    },

    shortDescription: {
      tr: "El işçiliğiyle tamamlanan zamansız deri cüzdan.",
      en: "A timeless leather wallet finished by hand.",
      ar: "محفظة جلدية خالدة مصنوعة بحرفية يدوية.",
    },

    image: "/products/wallet-1.jpg",
    hoverImage: "/products/wallet-2.jpg",

    price: 189,
    currency: "EUR",

    colors: ["#3B2418", "#171614", "#8A6245"],

    order: 1,
    stock: 12,

    isActive: true,
    isFeatured: true,
    isNew: true,
  },

  {
    id: "product-signature-belt",
    slug: "signature-leather-belt",
    categoryId: "category-belts",

    name: {
      tr: "Signature Deri Kemer",
      en: "Signature Leather Belt",
      ar: "حزام سيغنتشر الجلدي",
    },

    shortDescription: {
      tr: "Pirinç tokalı, seçkin işçilikle hazırlanan deri kemer.",
      en: "A refined leather belt finished with a brass buckle.",
      ar: "حزام جلدي فاخر مزود بإبزيم نحاسي.",
    },

    image: "/products/belt-1.jpg",
    hoverImage: "/products/belt-2.jpg",

    price: 145,
    currency: "EUR",

    colors: ["#332117", "#111111"],

    order: 2,
    stock: 18,

    isActive: true,
    isFeatured: true,
    isNew: true,
  },

  {
    id: "product-noir-loafer",
    slug: "noir-leather-loafer",
    categoryId: "category-shoes",

    name: {
      tr: "Noir Deri Loafer",
      en: "Noir Leather Loafer",
      ar: "حذاء نوار الجلدي",
    },

    shortDescription: {
      tr: "Modern çizgilerle yorumlanan premium deri loafer.",
      en: "A premium leather loafer shaped by modern lines.",
      ar: "حذاء جلدي فاخر بتصميم عصري.",
    },

    image: "/products/shoes-1.jpg",
    hoverImage: "/products/shoes-2.jpg",

    price: 329,
    currency: "EUR",

    colors: ["#111111", "#5B3825"],

    order: 3,
    stock: 9,

    isActive: true,
    isFeatured: true,
    isNew: true,
  },

  {
    id: "product-atelier-watch",
    slug: "atelier-classic-watch",
    categoryId: "category-watches",

    name: {
      tr: "Atelier Klasik Saat",
      en: "Atelier Classic Watch",
      ar: "ساعة أتيليه الكلاسيكية",
    },

    shortDescription: {
      tr: "Minimal kadran ve deri kayışla tamamlanan klasik saat.",
      en: "A classic watch with a minimal dial and leather strap.",
      ar: "ساعة كلاسيكية بميناء بسيط وسوار جلدي.",
    },

    image: "/products/watch-1.jpg",
    hoverImage: "/products/watch-2.jpg",

    price: 395,
    currency: "EUR",

    colors: ["#3A271C", "#171717"],

    order: 4,
    stock: 7,

    isActive: true,
    isFeatured: true,
    isNew: false,
  },
];