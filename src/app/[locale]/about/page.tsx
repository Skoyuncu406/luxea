import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowUpRight,
  Hand,
  Scissors,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

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

type AboutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/*
 * =============================================================
 * CONTENT
 * =============================================================
 */

const content = {
  tr: {
    eyebrow:
      "LUXEA Marka Hikayesi",

    heroTitleFirst:
      "Derinin doğallığı.",

    heroTitleSecond:
      "El işçiliğinin karakteri.",

    heroDescription:
      "LUXEA, geleneksel deri işçiliğini zamansız tasarım anlayışıyla buluşturarak uzun yıllar kullanılabilecek seçkin deri aksesuarlar üretir.",

    storyEyebrow:
      "Biz Kimiz",

    storyTitle:
      "Detaylarda başlayan bir ustalık.",

    storyParagraphOne:
      "LUXEA'nın temelinde kaliteli malzeme, özenli el işçiliği ve zamansız tasarım anlayışı yer alır. Koleksiyonlarımızda kullandığımız %100 dana derisi, doğal dokusunu ve karakterini koruyacak şekilde seçilir ve deneyimli ustaların ellerinde titizlikle işlenir.",

    storyParagraphTwo:
      "Her parça, kesimden dikişe, kenar işçiliğinden son dokunuşlara kadar birçok aşamadan geçer. Amacımız yalnızca estetik bir ürün ortaya çıkarmak değil; kullanıldıkça karakter kazanan, sahibine eşlik eden ve yıllarca değerini koruyan deri aksesuarlar üretmektir.",

    craftEyebrow:
      "Üretim Anlayışımız",

    craftTitle:
      "Her parça, elde şekillenen bir karakterdir.",

    craftDescription:
      "Seri üretim anlayışının aksine, ürünlerimizde detaylara ve işçiliğe odaklanıyoruz. Derinin doğal yapısını koruyarak her parçanın kendine özgü bir karakter kazanmasını hedefliyoruz.",

    leatherTitle:
      "%100 Dana Derisi",

    leatherDescription:
      "Ürünlerimizde seçkin ve dayanıklı %100 dana derisi kullanıyoruz. Doğal deri, zaman içinde kendine özgü bir patina geliştirerek daha kişisel bir görünüm kazanır.",

    handmadeTitle:
      "El Yapımı",

    handmadeDescription:
      "Kesimden dikişe ve kenar işçiliğine kadar üretimin birçok aşaması deneyimli ustaların el işçiliğiyle tamamlanır.",

    qualityTitle:
      "Uzun Ömürlü Kalite",

    qualityDescription:
      "Malzeme seçiminden üretimin son aşamasına kadar dayanıklılığı, kullanım konforunu ve zamansız görünümü birlikte değerlendiriyoruz.",

    designTitle:
      "Zamansız Tasarım",

    designDescription:
      "Geçici trendlerin ötesinde, günlük yaşamın farklı anlarına uyum sağlayabilecek sade ve karakterli tasarımlar geliştiriyoruz.",

    customEyebrow:
      "Özel Üretim",

    customTitle:
      "Deriden hayal edilebilen her detay.",

    customParagraphOne:
      "LUXEA yalnızca hazır koleksiyonlardan ibaret değildir. Farklı ihtiyaçlara, markalara ve projelere yönelik özel deri aksesuar üretimi de gerçekleştiriyoruz.",

    customParagraphTwo:
      "Cüzdan, kartlık, kemer, çanta, anahtarlık, kılıf ve günlük yaşam aksesuarlarının yanı sıra projeye özel farklı deri ürünleri de tasarlayıp üretebiliyoruz. Malzeme, renk, ölçü ve detay seçenekleri ihtiyaca göre şekillendirilebilir.",

    customLeather:
      "%100 Dana Derisi",

    customHandmade:
      "El Yapımı",

    customBespoke:
      "Özel Üretim",

    closingEyebrow:
      "LUXEA",

    closingTitle:
      "Zamansız parçalar. Gerçek işçilik.",

    closingDescription:
      "Doğal derinin karakterini, el işçiliğinin özeniyle bir araya getiriyoruz.",

    products:
      "Koleksiyonu Keşfet",
  },

  en: {
    eyebrow:
      "The LUXEA Story",

    heroTitleFirst:
      "The nature of leather.",

    heroTitleSecond:
      "The character of craftsmanship.",

    heroDescription:
      "LUXEA combines traditional leather craftsmanship with timeless design to create refined leather accessories made to accompany you for years.",

    storyEyebrow:
      "Who We Are",

    storyTitle:
      "Craftsmanship begins in the details.",

    storyParagraphOne:
      "At the heart of LUXEA are quality materials, meticulous craftsmanship and timeless design. The 100% calf leather used throughout our collections is carefully selected to preserve its natural texture and character, then shaped by experienced artisans.",

    storyParagraphTwo:
      "Every piece passes through multiple stages, from cutting and stitching to edge finishing and final detailing. Our aim is not simply to create something beautiful, but to craft leather accessories that develop character with use and retain their value for years.",

    craftEyebrow:
      "Our Craft",

    craftTitle:
      "Every piece carries a character shaped by hand.",

    craftDescription:
      "Rather than focusing on mass production, we focus on detail and craftsmanship. By respecting the natural structure of leather, we allow every piece to develop its own distinctive identity.",

    leatherTitle:
      "100% Calf Leather",

    leatherDescription:
      "We use carefully selected, durable 100% calf leather. Natural leather develops a distinctive patina over time, giving every piece a more personal character.",

    handmadeTitle:
      "Handcrafted",

    handmadeDescription:
      "From cutting and stitching to edge finishing, many stages of production are completed by experienced artisans.",

    qualityTitle:
      "Lasting Quality",

    qualityDescription:
      "From material selection to final finishing, durability, comfort and timeless appearance are considered together.",

    designTitle:
      "Timeless Design",

    designDescription:
      "Beyond temporary trends, we create understated and distinctive designs made to adapt naturally to everyday life.",

    customEyebrow:
      "Bespoke Production",

    customTitle:
      "Leather shaped around your idea.",

    customParagraphOne:
      "LUXEA extends beyond ready-to-wear collections. We also produce bespoke leather accessories for individual needs, brands and special projects.",

    customParagraphTwo:
      "From wallets, card holders, belts and bags to key holders, cases and everyday accessories, we can design and produce a wide variety of custom leather goods. Materials, colours, dimensions and details can be adapted to the project.",

    customLeather:
      "100% Calf Leather",

    customHandmade:
      "Handcrafted",

    customBespoke:
      "Bespoke Production",

    closingEyebrow:
      "LUXEA",

    closingTitle:
      "Timeless pieces. Genuine craftsmanship.",

    closingDescription:
      "We bring the natural character of leather together with the precision of handcrafted production.",

    products:
      "Explore the Collection",
  },

  ar: {
    eyebrow:
      "قصة LUXEA",

    heroTitleFirst:
      "طبيعة الجلد.",

    heroTitleSecond:
      "وشخصية الحرفية.",

    heroDescription:
      "تجمع LUXEA بين الحرفية التقليدية في صناعة الجلود والتصميم الخالد لإنتاج إكسسوارات جلدية مميزة تدوم لسنوات.",

    storyEyebrow:
      "من نحن",

    storyTitle:
      "الحرفية تبدأ من التفاصيل.",

    storyParagraphOne:
      "تقوم فلسفة LUXEA على جودة الخامات ودقة الحرفية والتصميم الخالد. نستخدم في مجموعاتنا جلداً بقرياً طبيعياً بنسبة 100% يتم اختياره بعناية للحفاظ على ملمسه وشخصيته الطبيعية، ثم يُشكّل على أيدي حرفيين ذوي خبرة.",

    storyParagraphTwo:
      "تمر كل قطعة بعدة مراحل تبدأ من القص والخياطة وتصل إلى تشطيب الحواف واللمسات النهائية. هدفنا ليس مجرد صناعة منتج جميل، بل تقديم إكسسوارات جلدية تكتسب شخصية مميزة مع الاستخدام وتحافظ على قيمتها لسنوات.",

    craftEyebrow:
      "نهجنا في التصنيع",

    craftTitle:
      "كل قطعة تحمل شخصية صنعت باليد.",

    craftDescription:
      "بدلاً من الاعتماد على الإنتاج الكمي، نركز على التفاصيل والحرفية. نحافظ على البنية الطبيعية للجلد ليكتسب كل منتج هويته الخاصة.",

    leatherTitle:
      "جلد بقري طبيعي 100%",

    leatherDescription:
      "نستخدم جلداً بقرياً طبيعياً مختاراً بعناية يتميز بالمتانة والجودة، ويكتسب مع مرور الوقت مظهراً خاصاً يعكس شخصية صاحبه.",

    handmadeTitle:
      "صناعة يدوية",

    handmadeDescription:
      "يتم تنفيذ العديد من مراحل الإنتاج، من القص والخياطة إلى تشطيب الحواف، على أيدي حرفيين ذوي خبرة.",

    qualityTitle:
      "جودة تدوم",

    qualityDescription:
      "نراعي المتانة والراحة والمظهر الخالد في جميع مراحل التصنيع، بدءاً من اختيار الخامات وحتى اللمسات النهائية.",

    designTitle:
      "تصميم خالد",

    designDescription:
      "نبتعد عن الصيحات المؤقتة لنقدم تصاميم بسيطة وذات شخصية تتناسب مع مختلف تفاصيل الحياة اليومية.",

    customEyebrow:
      "تصنيع خاص",

    customTitle:
      "نحوّل أفكارك إلى منتجات جلدية.",

    customParagraphOne:
      "لا تقتصر LUXEA على المجموعات الجاهزة، بل نقدم أيضاً خدمات تصنيع الإكسسوارات الجلدية الخاصة للأفراد والعلامات التجارية والمشاريع المختلفة.",

    customParagraphTwo:
      "يمكننا تصميم وإنتاج المحافظ وحافظات البطاقات والأحزمة والحقائب وحافظات المفاتيح والأغطية ومختلف إكسسوارات الحياة اليومية، بالإضافة إلى المنتجات المصممة خصيصاً حسب المشروع.",

    customLeather:
      "جلد بقري طبيعي 100%",

    customHandmade:
      "صناعة يدوية",

    customBespoke:
      "تصنيع خاص",

    closingEyebrow:
      "LUXEA",

    closingTitle:
      "قطع خالدة. حرفية حقيقية.",

    closingDescription:
      "نجمع بين الشخصية الطبيعية للجلد ودقة التصنيع اليدوي.",

    products:
      "اكتشف المجموعة",
  },
} as const;

/*
 * =============================================================
 * PAGE
 * =============================================================
 */

export default async function AboutPage({
  params,
}: AboutPageProps) {
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

  const copy =
    content[locale];

  return (
    <main
      className="
        relative
        min-h-screen
        w-full
        overflow-x-clip
        bg-transparent
        text-foreground
      "
    >
      {/* =====================================================
          FIXED BACKGROUND
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          fixed
          inset-0
          z-[-30]
        "
        style={{
          backgroundImage:
            "url('/Hero.png')",

          backgroundPosition:
            "center",

          backgroundSize:
            "cover",

          backgroundRepeat:
            "no-repeat",
        }}
      />

      {/* =====================================================
          SOFT OVERLAY
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          fixed
          inset-0
          z-[-20]

          bg-[#E5E0D7]/72

          backdrop-blur-[1px]
        "
      />

      {/* =====================================================
          PREMIUM LIGHT
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          z-[-10]

          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.17),transparent_58%)]
        "
      />

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative
          z-10

          flex
          min-h-[92dvh]
          items-center
          justify-center

          px-5
          pb-20
          pt-[150px]

          sm:px-8
          sm:pb-24
          sm:pt-[165px]

          lg:min-h-screen
          lg:pb-24
          lg:pt-[120px]
        "
      >
        <div className="container-premium">
          <div
            className="
              mx-auto
              flex
              max-w-[1100px]
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <p
              className="
                w-full
                text-center
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.32em]
                text-accent

                sm:text-[10px]
                sm:tracking-[0.36em]
              "
            >
              {copy.eyebrow}
            </p>

            <h1
              className="
                mx-auto
                mt-7
                w-full
                max-w-[1050px]
                text-center
                font-heading
                text-[46px]
                font-medium
                leading-[0.92]
                tracking-[-0.04em]
                text-foreground

                sm:text-[68px]

                lg:text-[88px]

                xl:text-[104px]
              "
            >
              <span className="block">
                {copy.heroTitleFirst}
              </span>

              <span
                className="
                  mt-2
                  block
                  text-accent
                "
              >
                {copy.heroTitleSecond}
              </span>
            </h1>

            <p
              className="
                mx-auto
                mt-8
                w-full
                max-w-[720px]
                text-center
                text-sm
                leading-7
                text-foreground-soft

                sm:text-base
                sm:leading-8

                lg:mt-10
                lg:text-[17px]
              "
            >
              {copy.heroDescription}
            </p>

            <div
              className="
                mt-10
                h-20
                w-px
                bg-gradient-to-b
                from-accent
                to-transparent

                sm:mt-12
              "
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          STORY
      ===================================================== */}

      <section
        className="
          relative
          z-10

          border-y
          border-border/70

          bg-[#E5E0D7]/18

          py-20

          backdrop-blur-[0.5px]

          sm:py-24

          lg:py-32
        "
      >
        <div className="container-premium">
          <div
            className="
              mx-auto
              flex
              max-w-[1000px]
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <p
              className="
                w-full
                text-center
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-accent
              "
            >
              {copy.storyEyebrow}
            </p>

            <div
              className="
                mt-6
                h-px
                w-20
                bg-accent
              "
            />

            <h2
              className="
                mx-auto
                mt-8
                max-w-[820px]
                text-center
                font-heading
                text-[42px]
                leading-[0.98]
                tracking-[-0.03em]

                sm:text-6xl

                lg:text-[70px]
              "
            >
              {copy.storyTitle}
            </h2>

            <div
              className="
                mx-auto
                mt-9
                grid
                max-w-[900px]
                gap-6

                text-center
                text-sm
                leading-7
                text-foreground-soft

                sm:text-[15px]
                sm:leading-8

                md:grid-cols-2
                md:gap-10
              "
            >
              <p className="text-center">
                {copy.storyParagraphOne}
              </p>

              <p className="text-center">
                {copy.storyParagraphTwo}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CRAFT VALUES
      ===================================================== */}

      <section
        className="
          relative
          z-10

          py-20

          sm:py-24

          lg:py-32
        "
      >
        <div className="container-premium">
          <div
            className="
              mx-auto
              flex
              max-w-[900px]
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <p
              className="
                w-full
                text-center
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-accent
              "
            >
              {copy.craftEyebrow}
            </p>

            <h2
              className="
                mx-auto
                mt-6
                max-w-[850px]
                text-center
                font-heading
                text-[42px]
                leading-[0.98]
                tracking-[-0.03em]

                sm:text-6xl

                lg:text-[72px]
              "
            >
              {copy.craftTitle}
            </h2>

            <p
              className="
                mx-auto
                mt-7
                max-w-[700px]
                text-center
                text-sm
                leading-7
                text-foreground-soft

                sm:text-[15px]
                sm:leading-8
              "
            >
              {copy.craftDescription}
            </p>
          </div>

          {/* VALUES */}

          <div
            className="
              mx-auto
              mt-14
              grid
              max-w-[1180px]
              border-t
              border-border/70

              sm:grid-cols-2

              lg:mt-20
              lg:grid-cols-4
            "
          >
            <ValueItem
              icon={Scissors}
              number="01"
              title={copy.leatherTitle}
              description={
                copy.leatherDescription
              }
            />

            <ValueItem
              icon={Hand}
              number="02"
              title={copy.handmadeTitle}
              description={
                copy.handmadeDescription
              }
            />

            <ValueItem
              icon={ShieldCheck}
              number="03"
              title={copy.qualityTitle}
              description={
                copy.qualityDescription
              }
            />

            <ValueItem
              icon={Sparkles}
              number="04"
              title={copy.designTitle}
              description={
                copy.designDescription
              }
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CUSTOM PRODUCTION
      ===================================================== */}

      <section
        className="
          relative
          z-10

          border-y
          border-border/70

          bg-[#E5E0D7]/18

          py-16

          backdrop-blur-[0.5px]

          sm:py-20

          lg:py-24
        "
      >
        <div className="container-premium">
          <div
            className="
              mx-auto
              flex
              max-w-[900px]
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            {/* EYEBROW */}

            <p
              className="
                w-full
                text-center
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-accent
              "
            >
              {copy.customEyebrow}
            </p>

            {/* TITLE */}

            <h2
              className="
                mx-auto
                mt-5
                max-w-[850px]
                text-center
                font-heading
                text-[42px]
                leading-[0.97]
                tracking-[-0.035em]

                sm:text-6xl

                lg:text-[68px]
              "
            >
              {copy.customTitle}
            </h2>

            {/* TEXT */}

            <div
              className="
                mx-auto
                mt-7
                max-w-[760px]
                space-y-4

                text-center
                text-sm
                leading-7
                text-foreground-soft

                sm:text-[15px]
                sm:leading-8
              "
            >
              <p className="text-center">
                {copy.customParagraphOne}
              </p>

              <p className="text-center">
                {copy.customParagraphTwo}
              </p>
            </div>

            {/* =================================================
                PREMIUM META LINE
            ================================================= */}

            <div
              className="
                mt-9
                flex
                w-full
                max-w-[760px]
                flex-wrap
                items-center
                justify-center
                gap-x-5
                gap-y-3

                border-y
                border-border/70

                py-4

                sm:gap-x-8
              "
            >
              <span
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-foreground

                  sm:text-[9px]
                "
              >
                {copy.customLeather}
              </span>

              <span
                aria-hidden="true"
                className="
                  hidden
                  h-1
                  w-1
                  rounded-full
                  bg-accent

                  sm:block
                "
              />

              <span
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-foreground

                  sm:text-[9px]
                "
              >
                {copy.customHandmade}
              </span>

              <span
                aria-hidden="true"
                className="
                  hidden
                  h-1
                  w-1
                  rounded-full
                  bg-accent

                  sm:block
                "
              />

              <span
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-accent

                  sm:text-[9px]
                "
              >
                {copy.customBespoke}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section
        className="
          relative
          z-10

          py-24

          sm:py-28

          lg:py-32
        "
      >
        <div className="container-premium">
          <div
            className="
              mx-auto
              flex
              max-w-[980px]
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <p
              className="
                w-full
                text-center
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.34em]
                text-accent
              "
            >
              {copy.closingEyebrow}
            </p>

            <h2
              className="
                mx-auto
                mt-6
                max-w-[900px]
                text-center
                font-heading
                text-[44px]
                leading-[0.96]
                tracking-[-0.035em]

                sm:text-6xl

                lg:text-[78px]
              "
            >
              {copy.closingTitle}
            </h2>

            <p
              className="
                mx-auto
                mt-7
                max-w-[620px]
                text-center
                text-sm
                leading-7
                text-foreground-soft

                sm:text-base
                sm:leading-8
              "
            >
              {copy.closingDescription}
            </p>

            {/* PRODUCTS */}

            <Link
              href={`/${locale}/products`}
              className="
                group
                relative

                mt-10

                inline-flex
                min-h-14

                items-center
                justify-center

                gap-4

                overflow-hidden

                border
                border-foreground

                bg-foreground

                px-8

                text-[9px]
                font-semibold
                uppercase
                tracking-[0.17em]

                !text-[#F3F0EA]

                shadow-[0_14px_35px_rgba(36,35,32,0.12)]

                transition-all
                duration-500

                hover:-translate-y-1

                hover:border-accent

                hover:bg-accent

                hover:!text-white

                hover:shadow-[0_18px_45px_rgba(146,115,74,0.20)]
              "
            >
              <span
                aria-hidden="true"
                className="
                  pointer-events-none

                  absolute
                  inset-y-0

                  -start-24

                  w-16

                  skew-x-[-20deg]

                  bg-white/10

                  transition-all
                  duration-700

                  group-hover:start-[120%]
                "
              />

              <span
                className="
                  relative
                  z-10
                "
              >
                {copy.products}
              </span>

              <ArrowUpRight
                size={15}
                strokeWidth={1.3}
                className="
                  relative
                  z-10

                  transition-transform
                  duration-300

                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5

                  rtl:group-hover:-translate-x-0.5
                "
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/*
 * =============================================================
 * VALUE ITEM
 * =============================================================
 */

type ValueItemProps = {
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;

  number: string;
  title: string;
  description: string;
};

function ValueItem({
  icon: Icon,
  number,
  title,
  description,
}: ValueItemProps) {
  return (
    <article
      className="
        group
        relative

        flex
        min-h-[300px]
        flex-col

        items-center
        justify-center

        border-b
        border-border/70

        bg-[#E5E0D7]/10

        px-6
        py-10

        text-center

        backdrop-blur-[0.5px]

        transition-all
        duration-500

        hover:bg-[#E5E0D7]/30

        sm:px-7

        lg:border-e
        lg:border-b-0
        lg:px-8

        lg:last:border-e-0
      "
    >
      <span
        className="
          text-center
          text-[8px]
          font-semibold
          uppercase
          tracking-[0.22em]
          text-muted
        "
      >
        {number}
      </span>

      <span
        className="
          mt-6

          flex
          h-12
          w-12

          items-center
          justify-center

          rounded-full

          border
          border-accent/25

          text-accent

          transition-all
          duration-500

          group-hover:-translate-y-1

          group-hover:border-accent

          group-hover:bg-accent

          group-hover:text-white

          group-hover:shadow-[0_12px_30px_rgba(146,115,74,0.18)]
        "
      >
        <Icon
          size={18}
          strokeWidth={1.2}
        />
      </span>

      <h3
        className="
          mt-7
          w-full

          text-center

          font-heading
          text-3xl
          leading-none

          transition-colors
          duration-500

          group-hover:text-accent
        "
      >
        {title}
      </h3>

      <p
        className="
          mx-auto
          mt-5
          max-w-[270px]

          text-center

          text-xs
          leading-6

          text-foreground-soft

          sm:text-[13px]
          sm:leading-7
        "
      >
        {description}
      </p>

      <span
        aria-hidden="true"
        className="
          absolute
          bottom-0
          left-1/2

          h-px
          w-0

          -translate-x-1/2

          bg-accent

          transition-all
          duration-700

          group-hover:w-[72%]
        "
      />
    </article>
  );
}