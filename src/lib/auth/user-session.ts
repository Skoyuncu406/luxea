import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const USER_SESSION_COOKIE =
  "luxea-user-session";

const SESSION_DURATION_SECONDS =
  60 * 60 * 24 * 30;

export type UserSessionPayload = {
  userId: string;
  email: string;
  role: "user";
};

/*
 * =============================================================
 * SESSION SECRET
 * =============================================================
 */

function getSessionSecret() {
  const secret =
    process.env.USER_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "USER_SESSION_SECRET ortam değişkeni tanımlanmamış."
    );
  }

  if (secret.length < 32) {
    throw new Error(
      "USER_SESSION_SECRET en az 32 karakter olmalıdır."
    );
  }

  return new TextEncoder().encode(
    secret
  );
}

/*
 * =============================================================
 * CREATE SESSION TOKEN
 * =============================================================
 */

export async function createUserSessionToken(
  payload: UserSessionPayload
) {
  const now =
    Math.floor(
      Date.now() / 1000
    );

  return new SignJWT({
    userId:
      payload.userId,

    email:
      payload.email,

    role:
      payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt(now)
    .setExpirationTime(
      now +
        SESSION_DURATION_SECONDS
    )
    .setIssuer("luxea")
    .setAudience("luxea-user")
    .sign(
      getSessionSecret()
    );
}

/*
 * =============================================================
 * VERIFY SESSION TOKEN
 * =============================================================
 */

export async function verifyUserSessionToken(
  token: string
): Promise<UserSessionPayload | null> {
  try {
    const { payload } =
      await jwtVerify(
        token,
        getSessionSecret(),
        {
          algorithms: [
            "HS256",
          ],

          issuer:
            "luxea",

          audience:
            "luxea-user",
        }
      );

    if (
      payload.role !==
        "user" ||
      typeof payload.userId !==
        "string" ||
      typeof payload.email !==
        "string"
    ) {
      return null;
    }

    return {
      userId:
        payload.userId,

      email:
        payload.email,

      role:
        "user",
    };
  } catch {
    return null;
  }
}

/*
 * =============================================================
 * SESSION MAX AGE
 * =============================================================
 */

export function getUserSessionMaxAge() {
  return SESSION_DURATION_SECONDS;
}

/*
 * =============================================================
 * NORMALIZE EMAIL
 * =============================================================
 */

export function normalizeUserEmail(
  email: string
) {
  return email
    .trim()
    .toLocaleLowerCase(
      "en-US"
    );
}

/*
 * =============================================================
 * GET CURRENT SESSION
 * =============================================================
 */

export async function getUserSession():
  Promise<UserSessionPayload | null> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      USER_SESSION_COOKIE
    )?.value;

  if (!token) {
    return null;
  }

  return verifyUserSessionToken(
    token
  );
}