import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

type SignRequestBody = {
  paramsToSign?: Record<
    string,
    string | number | boolean
  >;
};

export async function POST(request: Request) {
  try {
    const apiSecret =
      process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      return NextResponse.json(
        {
          message:
            "Cloudinary API secret tanımlanmamış.",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      (await request.json()) as SignRequestBody;

    if (
      !body.paramsToSign ||
      typeof body.paramsToSign !== "object"
    ) {
      return NextResponse.json(
        {
          message:
            "İmzalanacak parametreler bulunamadı.",
        },
        {
          status: 400,
        }
      );
    }

    const signature =
      cloudinary.utils.api_sign_request(
        body.paramsToSign,
        apiSecret
      );

    return NextResponse.json({
      signature,
    });
  } catch (error) {
    console.error(
      "Cloudinary imzalama hatası:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Görsel yükleme imzası oluşturulamadı.",
      },
      {
        status: 500,
      }
    );
  }
}