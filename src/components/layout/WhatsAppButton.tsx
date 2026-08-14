"use client";

const WHATSAPP_NUMBER = "905453577806";

const WHATSAPP_PATH =
  "M16.04 3 C8.86 3 3.02 8.78 3.02 15.9 C3.02 18.43 3.77 20.9 5.18 23 L3 29 L9.24 26.95 C11.28 28.18 13.62 28.82 16.02 28.82 H16.04 C23.2 28.82 29.02 23.04 29.02 15.92 C29.02 8.8 23.2 3 16.04 3 Z M16.04 26.63 C13.91 26.63 11.82 26.06 10 24.98 L9.56 24.72 L5.86 25.94 L7.1 22.34 L6.82 21.88 C5.64 20.04 5.02 17.97 5.02 15.9 C5.02 9.91 9.96 5.04 16.04 5.04 C22.12 5.04 27.02 9.91 27.02 15.92 C27.02 21.93 22.1 26.63 16.04 26.63 Z M22.08 18.18 C21.75 18.02 20.13 17.23 19.82 17.13 C19.51 17.02 19.29 16.97 19.06 17.3 C18.84 17.62 18.2 18.35 18 18.57 C17.8 18.78 17.59 18.81 17.26 18.65 C16.93 18.49 15.87 18.15 14.61 17.04 C13.63 16.18 12.97 15.11 12.78 14.78 C12.58 14.46 12.76 14.28 12.93 14.12 C13.08 13.97 13.26 13.75 13.43 13.56 C13.59 13.37 13.65 13.24 13.76 13.02 C13.87 12.8 13.82 12.61 13.73 12.45 C13.65 12.29 12.98 10.68 12.7 10.04 C12.43 9.42 12.15 9.5 11.94 9.49 H11.29 C11.07 9.49 10.71 9.57 10.41 9.9 C10.1 10.22 9.23 11 9.23 12.61 C9.23 14.22 10.44 15.78 10.61 16 C10.77 16.21 12.97 19.56 16.32 21.01 C17.12 21.35 17.74 21.56 18.23 21.71 C19.03 21.96 19.76 21.93 20.34 21.84 C20.98 21.74 22.31 21.05 22.59 20.29 C22.87 19.53 22.87 18.88 22.79 18.75 C22.7 18.61 22.41 18.34 22.08 18.18 Z";

export default function WhatsAppButton() {
  const message =
    "Merhaba LUXEA, ürünleriniz hakkında bilgi almak istiyorum.";

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

  return (
    <div className="fixed bottom-6 end-5 z-[70] sm:bottom-7 sm:end-7">
      {/* Dış premium glow */}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-full bg-[#25D366]/20 blur-xl transition-all duration-500"
      />

      {/* Çok hafif pulse halkası */}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-[#25D366]/40 opacity-20"
      />

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile iletişime geç"
        title="WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-[#25D366] text-white shadow-[0_14px_40px_rgba(37,211,102,0.30)] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.06] hover:border-white/60 hover:bg-[#1ebe5d] hover:shadow-[0_18px_50px_rgba(37,211,102,0.42)] sm:h-16 sm:w-16"
      >
        {/* İç premium halka */}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[5px] rounded-full border border-white/20 transition-all duration-500 group-hover:inset-[4px] group-hover:border-white/35"
        />

        {/* WhatsApp ikonu */}

        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className="relative z-10 h-7 w-7 fill-current drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)] transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 sm:h-8 sm:w-8"
        >
          <path d={WHATSAPP_PATH} />
        </svg>
      </a>
    </div>
  );
}