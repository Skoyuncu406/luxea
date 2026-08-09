"use client";

import { useState } from "react";
import Image from "next/image";

import {
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";

import {
  CldUploadWidget,
  type CloudinaryUploadWidgetInfo,
  type CloudinaryUploadWidgetResults,
} from "next-cloudinary";

type AdminProductImageUploaderProps = {
  label: string;
  description: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
};

export default function AdminProductImageUploader({
  label,
  description,
  value,
  onChange,
  required = false,
}: AdminProductImageUploaderProps) {
  const [isUploading, setIsUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * =============================================================
   * UPLOAD SUCCESS
   * =============================================================
   */

  function handleUploadSuccess(
    result: CloudinaryUploadWidgetResults
  ) {
    if (
      typeof result.info !== "object" ||
      result.info === null
    ) {
      setIsUploading(false);

      return;
    }

    const info =
      result.info as CloudinaryUploadWidgetInfo;

    if (!info.secure_url) {
      setError(
        "Görsel URL'si alınamadı."
      );

      setIsUploading(false);

      return;
    }

    onChange(
      info.secure_url
    );

    setError("");

    setIsUploading(false);
  }

  /*
   * =============================================================
   * UPLOAD ERROR
   * =============================================================
   */

  function handleUploadError() {
    setError(
      "Görsel yüklenemedi. Lütfen tekrar deneyin."
    );

    setIsUploading(false);
  }

  /*
   * =============================================================
   * RENDER
   * =============================================================
   */

  return (
    <div>
      {/* ========================================================
          BAŞLIK
      ======================================================== */}

      <div>
        <div className="flex items-center gap-2">
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-foreground">
            {label}

            {required && (
              <span className="ms-1 text-danger">
                *
              </span>
            )}
          </p>
        </div>

        <p className="mt-2 text-xs leading-6 text-muted">
          {description}
        </p>
      </div>

      {/* ========================================================
          YÜKLENMİŞ GÖRSEL VAR
      ======================================================== */}

      {value ? (
        <div className="mt-5 overflow-hidden border border-border bg-surface/45">
          <div className="grid gap-5 p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-5">
            {/* Görsel */}

            <div className="relative aspect-[4/5] overflow-hidden bg-background">
              <Image
                src={value}
                alt={label}
                fill
                sizes="180px"
                className="object-cover object-center"
              />
            </div>

            {/* Bilgi + aksiyonlar */}

            <div className="flex min-w-0 flex-col justify-between gap-6">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Yüklenen Görsel
                </p>

                <p
                  dir="ltr"
                  className="mt-3 break-all text-[10px] leading-5 text-foreground-soft"
                >
                  {value}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* =================================================
                    GÖRSELİ DEĞİŞTİR
                ================================================= */}

                <CldUploadWidget
                  signatureEndpoint="/api/cloudinary/sign"
                  options={{
                    sources: ["local"],
                    multiple: false,
                    maxFiles: 1,
                    resourceType: "image",

                    clientAllowedFormats: [
                      "jpg",
                      "jpeg",
                      "png",
                      "webp",
                      "avif",
                    ],

                    maxFileSize:
                      8_000_000,

                    folder:
                      "luxea/products",

                    cropping: true,

                    croppingAspectRatio:
                      0.8,

                    showSkipCropButton:
                      false,
                  }}
                  onOpen={() => {
                    /*
                     * Widget açıldığında henüz
                     * gerçek upload başlamadı.
                     *
                     * Bu nedenle loading açmıyoruz.
                     */

                    setError("");
                  }}
                  onQueuesStart={() => {
                    /*
                     * Gerçek dosya upload kuyruğuna
                     * girdiğinde loading başlar.
                     */

                    setIsUploading(
                      true
                    );

                    setError("");
                  }}
                  onSuccess={
                    handleUploadSuccess
                  }
                  onClose={() => {
                    /*
                     * Kullanıcı widget'ı kapatırsa
                     * loading açık kalmamalı.
                     */

                    setIsUploading(
                      false
                    );
                  }}
                  onError={
                    handleUploadError
                  }
                >
                  {({ open }) => (
                    <button
                      type="button"
                      disabled={
                        isUploading
                      }
                      onClick={() => {
                        if (
                          isUploading
                        ) {
                          return;
                        }

                        open();
                      }}
                      className={[
                        "inline-flex min-h-12",
                        "items-center justify-center",
                        "gap-3 border px-5",
                        "text-[8px] font-semibold",
                        "uppercase tracking-[0.14em]",
                        "transition-all duration-300",

                        isUploading
                          ? "cursor-wait border-border bg-surface-strong text-muted"
                          : "border-foreground text-foreground hover:bg-foreground hover:text-white",
                      ].join(" ")}
                    >
                      {isUploading ? (
                        <LoaderCircle
                          size={15}
                          strokeWidth={
                            1.4
                          }
                          className="animate-spin"
                        />
                      ) : (
                        <RefreshCw
                          size={15}
                          strokeWidth={
                            1.4
                          }
                        />
                      )}

                      <span>
                        {isUploading
                          ? "Görsel Yükleniyor"
                          : "Görseli Değiştir"}
                      </span>
                    </button>
                  )}
                </CldUploadWidget>

                {/* =================================================
                    GÖRSELİ KALDIR
                ================================================= */}

                <button
                  type="button"
                  disabled={
                    isUploading
                  }
                  onClick={() => {
                    onChange("");

                    setError("");
                  }}
                  className={[
                    "inline-flex min-h-12",
                    "items-center justify-center",
                    "gap-3 border px-5",
                    "text-[8px] font-semibold uppercase",
                    "tracking-[0.14em]",
                    "transition-all duration-300",

                    isUploading
                      ? "cursor-not-allowed border-border text-muted opacity-50"
                      : "border-danger/40 text-danger hover:bg-danger hover:text-white",
                  ].join(" ")}
                >
                  <Trash2
                    size={15}
                    strokeWidth={
                      1.4
                    }
                  />

                  <span>
                    Görseli Kaldır
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================
           HENÜZ GÖRSEL YOK
        ====================================================== */

        <div className="mt-5">
          <CldUploadWidget
            signatureEndpoint="/api/cloudinary/sign"
            options={{
              sources: ["local"],
              multiple: false,
              maxFiles: 1,
              resourceType: "image",

              clientAllowedFormats: [
                "jpg",
                "jpeg",
                "png",
                "webp",
                "avif",
              ],

              maxFileSize:
                8_000_000,

              folder:
                "luxea/products",

              cropping: true,

              croppingAspectRatio:
                0.8,

              showSkipCropButton:
                false,
            }}
            onOpen={() => {
              /*
               * Cloudinary widget açıldı.
               *
               * Dosya henüz seçilmedi.
               *
               * Dolayısıyla:
               * isUploading = false
               */

              setError("");
            }}
            onQueuesStart={() => {
              /*
               * Dosya gerçekten seçilip
               * upload kuyruğuna girdi.
               */

              setIsUploading(
                true
              );

              setError("");
            }}
            onSuccess={
              handleUploadSuccess
            }
            onClose={() => {
              /*
               * Kullanıcı:
               *
               * - dosya seçmeden kapatabilir
               * - widget'ı kapatabilir
               *
               * Her iki durumda da loading
               * kesinlikle kapanmalı.
               */

              setIsUploading(
                false
              );
            }}
            onError={
              handleUploadError
            }
          >
            {({ open }) => (
              <button
                type="button"
                disabled={
                  isUploading
                }
                onClick={() => {
                  if (
                    isUploading
                  ) {
                    return;
                  }

                  open();
                }}
                className={[
                  "group flex min-h-[300px]",
                  "w-full flex-col",
                  "items-center justify-center",
                  "border border-dashed",
                  "px-6 py-12 text-center",
                  "transition-all duration-300",

                  isUploading
                    ? "cursor-wait border-accent bg-accent/5"
                    : "border-border-strong bg-surface/30 hover:border-accent hover:bg-accent/5",
                ].join(" ")}
              >
                {/* Icon */}

                <span className="flex h-20 w-20 items-center justify-center border border-accent/30 bg-accent/10 text-accent transition-transform duration-300 group-hover:-translate-y-1">
                  {isUploading ? (
                    <LoaderCircle
                      size={30}
                      strokeWidth={
                        1.2
                      }
                      className="animate-spin"
                    />
                  ) : (
                    <ImagePlus
                      size={30}
                      strokeWidth={
                        1.2
                      }
                    />
                  )}
                </span>

                {/* Title */}

                <p className="mt-7 font-heading text-3xl leading-none text-foreground">
                  {isUploading
                    ? "Görsel yükleniyor"
                    : "Görsel seçin veya sürükleyip bırakın"}
                </p>

                {/* Description */}

                <p className="mt-4 max-w-md text-xs leading-6 text-muted">
                  JPG, PNG, WebP veya AVIF.
                  En fazla 8 MB.
                </p>

                {/* Select button */}

                {!isUploading && (
                  <span className="mt-7 inline-flex min-h-11 items-center justify-center gap-3 border border-foreground px-5 text-[8px] font-semibold uppercase tracking-[0.14em] text-foreground">
                    <UploadCloud
                      size={15}
                      strokeWidth={
                        1.4
                      }
                    />

                    <span>
                      Bilgisayardan Seç
                    </span>
                  </span>
                )}
              </button>
            )}
          </CldUploadWidget>
        </div>
      )}

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <p
          role="alert"
          className="mt-3 text-xs leading-6 text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}