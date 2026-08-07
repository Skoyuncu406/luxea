import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE =
  "luxea-admin-session";

const SESSION_DURATION_SECONDS = 60 * 60 * 8;

export type AdminSessionPayload = {
  email: string;
  role: "admin";
};

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET ortam değişkeni tanımlanmamış."
    );
  }

  if (secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET en az 32 karakter olmalıdır."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(
  payload: AdminSessionPayload
) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt(now)
    .setExpirationTime(
      now + SESSION_DURATION_SECONDS
    )
    .setIssuer("luxea")
    .setAudience("luxea-admin")
    .sign(getSessionSecret());
}

export async function verifyAdminSessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      getSessionSecret(),
      {
        algorithms: ["HS256"],
        issuer: "luxea",
        audience: "luxea-admin",
      }
    );

    if (
      payload.role !== "admin" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return {
      email: payload.email,
      role: "admin",
    };
  } catch {
    return null;
  }
}

export function getAdminSessionMaxAge() {
  return SESSION_DURATION_SECONDS;
}

export function normalizeAdminEmail(
  email: string
) {
  return email.trim().toLocaleLowerCase("en-US");
}

export function validateAdminCredentials(
  email: string,
  password: string
) {
  const configuredEmail =
    process.env.ADMIN_EMAIL;

  const configuredPassword =
    process.env.ADMIN_PASSWORD;

  if (
    !configuredEmail ||
    !configuredPassword
  ) {
    throw new Error(
      "ADMIN_EMAIL veya ADMIN_PASSWORD ortam değişkeni tanımlanmamış."
    );
  }

  const normalizedInputEmail =
    normalizeAdminEmail(email);

  const normalizedConfiguredEmail =
    normalizeAdminEmail(configuredEmail);

  return (
    normalizedInputEmail ===
      normalizedConfiguredEmail &&
    password === configuredPassword
  );
}