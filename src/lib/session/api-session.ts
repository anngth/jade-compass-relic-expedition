import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";
import { cookies } from "next/headers";
import { ProviderType } from "@/types/game";
import { SESSION_COOKIE } from "@/lib/session/constants";

export { SESSION_COOKIE };
const SESSION_TTL_SEC = 24 * 60 * 60;

interface SessionPayload {
  apiKeyManager: Partial<Record<ProviderType, string>>;
  exp: number;
}

function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return scryptSync(
    secret || "dev-insecure-session-secret",
    "jade-compass",
    32,
  );
}

export function encryptSessionPayload(
  payload: Omit<SessionPayload, "exp">,
): string {
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + SESSION_TTL_SEC * 1000,
  });
  const encrypted = Buffer.concat([
    cipher.update(data, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptSessionPayload(token: string): SessionPayload | null {
  try {
    const buf = Buffer.from(token, "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const key = getEncryptionKey();
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const data = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
    const payload = JSON.parse(data) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function readSessionApiKeys(): Promise<Partial<
  Record<ProviderType, string>
> | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = decryptSessionPayload(token);
  return payload?.apiKeyManager ?? null;
}

export async function writeSessionCookie(
  apiKeyManager: Partial<Record<ProviderType, string>>,
): Promise<void> {
  const cookieStore = await cookies();
  const token = encryptSessionPayload({ apiKeyManager });
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SEC,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function getSessionRateLimitId(token: string | undefined): string {
  if (token) return `session:${token.slice(0, 32)}`;
  return "anonymous";
}
