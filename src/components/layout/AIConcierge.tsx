"use client";

import {
  Bot,
  ChevronRight,
  LoaderCircle,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import {
  FormEvent,
  MouseEvent,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

/*
 * =============================================================
 * TYPES
 * =============================================================
 */

type Message = {
  id: string;

  role:
    | "user"
    | "assistant";

  content: string;
};

type QuickAction = {
  id: string;

  label: {
    tr: string;
    en: string;
    ar: string;
  };
};

/*
 * =============================================================
 * AI STATUS
 * =============================================================
 *
 * false:
 * API çağrısı yapılmaz.
 *
 * true:
 * /api/ai-chat aktif olarak kullanılır.
 * =============================================================
 */

const AI_ENABLED =
  process.env
    .NEXT_PUBLIC_AI_CONCIERGE_ENABLED ===
  "true";

/*
 * =============================================================
 * QUICK ACTIONS
 * =============================================================
 */

const quickActions: QuickAction[] = [
  {
    id: "products",

    label: {
      tr: "Ürünler hakkında bilgi",
      en: "Product information",
      ar: "معلومات عن المنتجات",
    },
  },

  {
    id: "order",

    label: {
      tr: "Sipariş süreci",
      en: "Order process",
      ar: "عملية الطلب",
    },
  },

  {
    id: "shipping",

    label: {
      tr: "Kargo hakkında bilgi",
      en: "Shipping information",
      ar: "معلومات الشحن",
    },
  },
];

/*
 * =============================================================
 * COMPONENT
 * =============================================================
 */

export default function AIConcierge() {
  const params =
    useParams();

  const locale =
    params.locale === "en" ||
    params.locale === "ar"
      ? params.locale
      : "tr";

  /*
   * ===========================================================
   * PANEL
   * ===========================================================
   */

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  /*
   * ===========================================================
   * INPUT
   * ===========================================================
   */

  const [
    message,
    setMessage,
  ] = useState("");

  /*
   * ===========================================================
   * CHAT
   * ===========================================================
   */

  const [
    messages,
    setMessages,
  ] =
    useState<Message[]>(
      []
    );

  /*
   * ===========================================================
   * REQUEST STATE
   * ===========================================================
   */

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  /*
   * ===========================================================
   * TRANSLATIONS
   * ===========================================================
   */

  const copy = {
    tr: {
      greeting:
        "Size nasıl yardımcı olabilirim?",

      intro:
        "LUXEA ürünleri, sipariş süreci ve teslimat hakkında size yardımcı olabilirim.",

      placeholder:
        "Mesajınızı yazın...",

      thinking:
        "LUXEA düşünüyor...",

      unavailable:
        "LUXEA AI Concierge yakında kullanıma açılacaktır.",

      error:
        "AI Concierge şu anda yanıt veremiyor.",

      close:
        "AI Concierge kapat",

      send:
        "Gönder",

      status:
        AI_ENABLED
          ? "AI Concierge aktif"
          : "AI Concierge yakında",

      footer:
        "LUXEA Digital Concierge",
    },

    en: {
      greeting:
        "How can I assist you?",

      intro:
        "I can assist you with LUXEA products, orders and delivery.",

      placeholder:
        "Type your message...",

      thinking:
        "LUXEA is thinking...",

      unavailable:
        "LUXEA AI Concierge will be available soon.",

      error:
        "AI Concierge is currently unavailable.",

      close:
        "Close AI Concierge",

      send:
        "Send",

      status:
        AI_ENABLED
          ? "AI Concierge active"
          : "AI Concierge coming soon",

      footer:
        "LUXEA Digital Concierge",
    },

    ar: {
      greeting:
        "كيف يمكنني مساعدتك؟",

      intro:
        "يمكنني مساعدتك بشأن منتجات LUXEA والطلبات والتوصيل.",

      placeholder:
        "اكتب رسالتك...",

      thinking:
        "LUXEA يفكر...",

      unavailable:
        "سيكون مساعد LUXEA الذكي متاحًا قريبًا.",

      error:
        "خدمة المساعد الذكي غير متاحة حالياً.",

      close:
        "إغلاق المساعد الذكي",

      send:
        "إرسال",

      status:
        AI_ENABLED
          ? "المساعد الذكي متاح"
          : "المساعد الذكي قريباً",

      footer:
        "LUXEA Digital Concierge",
    },
  }[locale];

  /*
   * ===========================================================
   * SEND MESSAGE
   * ===========================================================
   */

  async function sendMessage(
    content: string
  ) {
    const cleanMessage =
      content.trim();

    if (
      !cleanMessage ||
      isLoading
    ) {
      return;
    }

    /*
     * ---------------------------------------------------------
     * AI PASİF
     *
     * API'ye kesinlikle istek gitmez.
     * ---------------------------------------------------------
     */

    if (!AI_ENABLED) {
      const userMessage: Message =
        {
          id:
            crypto.randomUUID(),

          role: "user",

          content:
            cleanMessage,
        };

      const assistantMessage: Message =
        {
          id:
            crypto.randomUUID(),

          role:
            "assistant",

          content:
            copy.unavailable,
        };

      setMessages(
        (current) => [
          ...current,

          userMessage,

          assistantMessage,
        ]
      );

      setMessage("");

      setError(null);

      return;
    }

    /*
     * ---------------------------------------------------------
     * AI AKTİF
     * ---------------------------------------------------------
     */

    const userMessage: Message =
      {
        id:
          crypto.randomUUID(),

        role: "user",

        content:
          cleanMessage,
      };

    setMessages(
      (current) => [
        ...current,
        userMessage,
      ]
    );

    setMessage("");

    setError(null);

    setIsLoading(true);

    try {
      const response =
        await fetch(
          "/api/ai-chat",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                message:
                  cleanMessage,

                locale,
              }),
          }
        );

      const data =
        (await response.json()) as {
          message?: string;

          error?: string;
        };

      if (
        !response.ok ||
        !data.message
      ) {
        throw new Error(
          data.error ||
            copy.error
        );
      }

      const assistantMessage: Message =
        {
          id:
            crypto.randomUUID(),

          role:
            "assistant",

          content:
            data.message,
        };

      setMessages(
        (current) => [
          ...current,

          assistantMessage,
        ]
      );
    } catch (requestError) {
      console.error(
        "AI Concierge error:",
        requestError
      );

      setError(
        copy.error
      );
    } finally {
      setIsLoading(
        false
      );
    }
  }

  /*
   * ===========================================================
   * SUBMIT
   * ===========================================================
   */

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    void sendMessage(
      message
    );
  }

  /*
   * ===========================================================
   * QUICK ACTION
   * ===========================================================
   */

  function handleQuickAction(
    label: string
  ) {
    void sendMessage(
      label
    );
  }

  /*
   * ===========================================================
   * CLOSE
   * ===========================================================
   */

  function closePanel() {
    setIsOpen(false);
  }

  function handlePanelClick(
    event:
      MouseEvent<HTMLDivElement>
  ) {
    /*
     * Panel içerisindeki
     * tıklamalar overlay'e
     * gitmesin.
     */
    event.stopPropagation();
  }

  /*
   * =============================================================
   * RENDER
   * =============================================================
   */

  return (
    <>
      {/* =====================================================
          OVERLAY
      ===================================================== */}

      <button
        type="button"
        aria-label={
          copy.close
        }
        onClick={
          closePanel
        }
        className={[
          "fixed",
          "inset-0",
          "z-[680]",

          "cursor-default",

          "bg-[#242320]/[0.035]",

          "backdrop-blur-[0.5px]",

          "transition-opacity",
          "duration-300",

          isOpen
            ? [
                "visible",
                "opacity-100",
              ].join(" ")
            : [
                "invisible",
                "pointer-events-none",
                "opacity-0",
              ].join(" "),
        ].join(" ")}
      />

      {/* =====================================================
          PANEL
      ===================================================== */}

      <div
        onClick={
          handlePanelClick
        }
        className={[
          /*
           * MOBILE
           */

          "fixed",

          "bottom-[176px]",
          "end-5",

          "z-[700]",

          "w-[calc(100vw-40px)]",
          "max-w-[390px]",

          /*
           * TABLET
           */

          "sm:bottom-[186px]",
          "sm:end-6",

          /*
           * DESKTOP
           *
           * AI butonunun üstünden başlar.
           */

          "lg:bottom-[176px]",
          "lg:end-8",

          /*
           * Masaüstünde ekranın
           * yaklaşık yarısı.
           */

          "lg:w-[50vw]",
          "lg:max-w-none",

          /*
           * Height
           */

          "lg:h-[calc(100dvh-200px)]",
          "lg:max-h-[760px]",

          /*
           * Animation
           */

          "transition-all",
          "duration-500",

          "ease-[cubic-bezier(0.22,1,0.36,1)]",

          isOpen
            ? [
                "visible",
                "translate-y-0",
                "opacity-100",
              ].join(" ")
            : [
                "invisible",
                "pointer-events-none",

                "translate-y-3",
                "opacity-0",
              ].join(" "),
        ].join(" ")}
      >
        {/* ===================================================
            PANEL SURFACE
        =================================================== */}

        <div
          className="
            relative

            overflow-hidden

            border
            border-white/45

            bg-[#EEEAE3]/97

            shadow-[0_28px_80px_rgba(36,35,32,0.18)]

            backdrop-blur-2xl

            lg:flex
            lg:h-full
            lg:flex-col
          "
        >
          {/* =================================================
              DECORATION
          ================================================= */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              -end-14
              -top-16

              h-44
              w-44

              rounded-full

              bg-accent/[0.08]

              blur-[70px]

              lg:h-[320px]
              lg:w-[320px]
            "
          />

          <span
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              -start-14
              bottom-10

              h-36
              w-36

              rounded-full

              bg-white/30

              blur-[60px]

              lg:h-[260px]
              lg:w-[260px]
            "
          />

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              relative
              z-10

              flex
              items-start
              justify-between

              gap-5

              border-b
              border-border

              px-5
              py-5

              sm:px-6
              sm:py-6

              lg:px-8
              lg:py-7
            "
          >
            <div
              className="
                flex
                min-w-0
                items-start
                gap-3.5
              "
            >
              {/* LOGO */}

              <span
                className="
                  flex
                  h-10
                  w-10
                  shrink-0

                  items-center
                  justify-center

                  border
                  border-accent/30

                  bg-accent/[0.06]

                  text-accent

                  lg:h-11
                  lg:w-11
                "
              >
                <Sparkles
                  size={17}
                  strokeWidth={
                    1.35
                  }
                />
              </span>

              <div className="min-w-0">
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-3
                  "
                >
                  <p
                    className="
                      text-[8px]
                      font-semibold
                      uppercase
                      tracking-[0.28em]

                      text-accent

                      lg:text-[9px]
                    "
                  >
                    LUXEA
                  </p>

                  {/* STATUS */}

                  <span
                    className={[
                      "text-[7px]",
                      "font-semibold",
                      "uppercase",
                      "tracking-[0.15em]",

                      AI_ENABLED
                        ? "text-success"
                        : "text-muted",
                    ].join(" ")}
                  >
                    {copy.status}
                  </span>
                </div>

                <h2
                  className="
                    mt-1.5

                    font-heading
                    text-[24px]
                    font-semibold

                    leading-none

                    tracking-[-0.025em]

                    text-foreground

                    lg:text-[30px]
                  "
                >
                  AI Concierge
                </h2>

                <p
                  className="
                    mt-2

                    text-[10px]
                    leading-5

                    text-foreground-soft

                    lg:text-[11px]
                    lg:leading-6
                  "
                >
                  {copy.greeting}
                </p>
              </div>
            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={
                closePanel
              }
              aria-label={
                copy.close
              }
              className="
                flex
                h-9
                w-9
                shrink-0

                items-center
                justify-center

                border
                border-transparent

                text-muted

                transition-all
                duration-300

                hover:border-border
                hover:bg-white/30
                hover:text-foreground

                lg:h-10
                lg:w-10
              "
            >
              <X
                size={17}
                strokeWidth={
                  1.35
                }
              />
            </button>
          </div>

          {/* =================================================
              CHAT AREA
          ================================================= */}

          <div
            className="
              relative
              z-10

              max-h-[360px]

              overflow-y-auto

              px-5
              py-5

              sm:px-6

              lg:min-h-0
              lg:max-h-none
              lg:flex-1

              lg:px-8
              lg:py-7
            "
          >
            {/* ===============================================
                INITIAL MESSAGE
            =============================================== */}

            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <span
                className="
                  mt-0.5

                  flex
                  h-8
                  w-8
                  shrink-0

                  items-center
                  justify-center

                  border
                  border-accent/25

                  bg-accent/[0.05]

                  text-accent
                "
              >
                <Bot
                  size={15}
                  strokeWidth={
                    1.35
                  }
                />
              </span>

              <div
                className="
                  max-w-[280px]

                  border
                  border-white/45

                  bg-white/22

                  px-4
                  py-3

                  backdrop-blur-md

                  lg:max-w-[460px]

                  lg:px-5
                  lg:py-4
                "
              >
                <p
                  className="
                    text-[11px]
                    leading-6

                    text-foreground-soft

                    lg:text-xs
                    lg:leading-7
                  "
                >
                  {AI_ENABLED
                    ? copy.intro
                    : copy.unavailable}
                </p>
              </div>
            </div>

            {/* ===============================================
                QUICK ACTIONS
            =============================================== */}

            {messages.length ===
              0 && (
              <div
                className="
                  mt-5
                  space-y-2

                  lg:mt-7
                  lg:space-y-2.5
                "
              >
                {quickActions.map(
                  (
                    action
                  ) => {
                    const label =
                      action
                        .label[
                        locale
                      ];

                    return (
                      <button
                        key={
                          action.id
                        }
                        type="button"
                        disabled={
                          isLoading
                        }
                        onClick={() =>
                          handleQuickAction(
                            label
                          )
                        }
                        className="
                          group

                          flex
                          min-h-11
                          w-full

                          items-center
                          justify-between

                          gap-4

                          border
                          border-border

                          bg-transparent

                          px-4

                          text-start

                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.14em]

                          text-foreground

                          transition-all
                          duration-300

                          hover:border-accent/50

                          hover:bg-white/24

                          hover:text-accent

                          disabled:pointer-events-none

                          disabled:opacity-40

                          lg:min-h-12

                          lg:px-5

                          lg:text-[10px]
                        "
                      >
                        <span>
                          {
                            label
                          }
                        </span>

                        <ChevronRight
                          size={
                            13
                          }
                          strokeWidth={
                            1.4
                          }
                          className="
                            shrink-0

                            transition-transform

                            duration-300

                            group-hover:translate-x-0.5

                            rtl:rotate-180

                            rtl:group-hover:-translate-x-0.5
                          "
                        />
                      </button>
                    );
                  }
                )}
              </div>
            )}

            {/* ===============================================
                MESSAGES
            =============================================== */}

            {messages.length >
              0 && (
              <div
                className="
                  mt-6
                  space-y-5
                "
              >
                {messages.map(
                  (
                    chatMessage
                  ) =>
                    chatMessage.role ===
                    "user" ? (
                      /* USER */

                      <div
                        key={
                          chatMessage.id
                        }
                        className="
                          flex
                          justify-end
                        "
                      >
                        <div
                          className="
                            max-w-[280px]

                            bg-[#242320]

                            px-4
                            py-3

                            text-[#F3F0EA]

                            lg:max-w-[460px]

                            lg:px-5
                            lg:py-4
                          "
                        >
                          <p
                            className="
                              whitespace-pre-wrap

                              text-[11px]
                              leading-5

                              lg:text-xs
                              lg:leading-6
                            "
                          >
                            {
                              chatMessage.content
                            }
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* AI */

                      <div
                        key={
                          chatMessage.id
                        }
                        className="
                          flex
                          items-start
                          gap-3
                        "
                      >
                        <span
                          className="
                            mt-0.5

                            flex
                            h-8
                            w-8
                            shrink-0

                            items-center
                            justify-center

                            border

                            border-accent/25

                            bg-accent/[0.05]

                            text-accent
                          "
                        >
                          <Bot
                            size={
                              15
                            }
                            strokeWidth={
                              1.35
                            }
                          />
                        </span>

                        <div
                          className="
                            max-w-[280px]

                            border

                            border-white/45

                            bg-white/22

                            px-4
                            py-3

                            lg:max-w-[460px]

                            lg:px-5
                            lg:py-4
                          "
                        >
                          <p
                            className="
                              whitespace-pre-wrap

                              text-[11px]
                              leading-6

                              text-foreground-soft

                              lg:text-xs
                              lg:leading-7
                            "
                          >
                            {
                              chatMessage.content
                            }
                          </p>
                        </div>
                      </div>
                    )
                )}

                {/* ===========================================
                    LOADING
                =========================================== */}

                {isLoading && (
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0

                        items-center
                        justify-center

                        border

                        border-accent/25

                        bg-accent/[0.05]

                        text-accent
                      "
                    >
                      <LoaderCircle
                        size={15}
                        strokeWidth={
                          1.4
                        }
                        className="
                          animate-spin
                        "
                      />
                    </span>

                    <div
                      className="
                        border

                        border-white/45

                        bg-white/22

                        px-4
                        py-3
                      "
                    >
                      <p
                        className="
                          text-[9px]

                          font-semibold

                          uppercase

                          tracking-[0.15em]

                          text-muted
                        "
                      >
                        {
                          copy.thinking
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* ===========================================
                    ERROR
                =========================================== */}

                {error && (
                  <div
                    className="
                      border

                      border-danger/25

                      bg-danger/[0.05]

                      px-4
                      py-3
                    "
                  >
                    <p
                      className="
                        text-[10px]

                        leading-5

                        text-danger
                      "
                    >
                      {error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <form
            onSubmit={
              handleSubmit
            }
            className="
              relative
              z-10

              border-t
              border-border

              p-4

              sm:p-5

              lg:px-8
              lg:py-6
            "
          >
            <div
              className="
                flex
                min-h-12
                items-center

                border
                border-border

                bg-white/20

                transition-colors
                duration-300

                focus-within:border-accent

                lg:min-h-14
              "
            >
              <div
                className="
                  flex
                  h-full
                  w-11
                  shrink-0

                  items-center
                  justify-center

                  text-muted

                  lg:w-12
                "
              >
                <MessageCircle
                  size={15}
                  strokeWidth={
                    1.35
                  }
                />
              </div>

              <input
                type="text"
                value={
                  message
                }
                disabled={
                  isLoading
                }
                onChange={(
                  event
                ) =>
                  setMessage(
                    event
                      .target
                      .value
                  )
                }
                placeholder={
                  copy.placeholder
                }
                className="
                  min-w-0
                  flex-1

                  bg-transparent

                  px-1
                  py-3

                  text-[11px]

                  text-foreground

                  outline-none

                  placeholder:text-muted/70

                  disabled:opacity-50

                  lg:text-xs
                "
              />

              <button
                type="submit"
                disabled={
                  !message.trim() ||
                  isLoading
                }
                aria-label={
                  copy.send
                }
                className="
                  me-1

                  flex
                  h-10
                  w-10
                  shrink-0

                  items-center
                  justify-center

                  bg-[#242320]

                  text-[#F3F0EA]

                  transition-all
                  duration-300

                  hover:bg-accent

                  disabled:cursor-not-allowed

                  disabled:opacity-30

                  lg:h-11
                  lg:w-11
                "
              >
                {isLoading ? (
                  <LoaderCircle
                    size={
                      14
                    }
                    strokeWidth={
                      1.4
                    }
                    className="
                      animate-spin
                    "
                  />
                ) : (
                  <Send
                    size={
                      14
                    }
                    strokeWidth={
                      1.4
                    }
                  />
                )}
              </button>
            </div>

            {/* FOOTER */}

            <div
              className="
                mt-3

                flex
                items-center
                justify-center

                gap-2
              "
            >
              <span
                className={[
                  "h-1.5",
                  "w-1.5",
                  "rounded-full",

                  AI_ENABLED
                    ? "bg-success"
                    : "bg-muted/50",
                ].join(" ")}
              />

              <p
                className="
                  text-center

                  text-[7px]

                  font-medium

                  uppercase

                  tracking-[0.17em]

                  text-muted/75

                  lg:text-[8px]
                "
              >
                {copy.footer}
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* =====================================================
          AI BUTTON
      ===================================================== */}

      <div
        className="
          fixed

          bottom-[104px]
          end-5

          z-[710]

          sm:bottom-[112px]
          sm:end-6

          lg:bottom-[108px]
          lg:end-8
        "
      >
        <button
          type="button"
          onClick={() =>
            setIsOpen(
              (current) =>
                !current
            )
          }
          aria-label="
            LUXEA AI Concierge
          "
          aria-expanded={
            isOpen
          }
          className="
            group
            relative

            flex
            h-14

            items-center
            justify-center

            gap-2.5

            overflow-hidden

            border

            border-accent/40

            bg-[#242320]

            px-4

            text-[#F3F0EA]

            shadow-[0_14px_40px_rgba(36,35,32,0.18)]

            backdrop-blur-xl

            transition-all

            duration-300

            ease-out

            hover:-translate-y-1

            hover:border-accent

            hover:bg-accent

            hover:shadow-[0_18px_46px_rgba(146,115,74,0.28)]
          "
        >
          {/* GLOW */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none

              absolute

              -start-12

              top-1/2

              h-16
              w-16

              -translate-y-1/2

              rounded-full

              bg-white/10

              blur-2xl

              transition-all

              duration-500

              group-hover:start-[55%]
            "
          />

          <Sparkles
            size={17}
            strokeWidth={
              1.45
            }
            className="
              relative
              z-10

              shrink-0

              transition-transform

              duration-300

              group-hover:rotate-6

              group-hover:scale-110
            "
          />

          <span
            className="
              relative
              z-10

              hidden

              text-[9px]

              font-semibold

              uppercase

              tracking-[0.18em]

              sm:block
            "
          >
            LUXEA AI
          </span>

          {/* PASİF DURUM NOKTASI */}

          {!AI_ENABLED && (
            <span
              aria-hidden="true"
              className="
                relative
                z-10

                h-1.5
                w-1.5

                rounded-full

                bg-[#F3F0EA]/40
              "
            />
          )}
        </button>
      </div>
    </>
  );
}