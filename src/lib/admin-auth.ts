import { createHmac, timingSafeEqual } from "crypto";
import { hasBlobStore, readBlobJson, writeBlobJson } from "@/lib/blob-store";

export const ADMIN_SESSION_COOKIE = "admin_session";

const PASSWORD_BLOB_PATH = "content/admin-password.json";

interface StoredPassword {
  password: string;
}

/**
 * The password can be changed at runtime (admin UI) once a Blob store is
 * connected — the override lives there. Without Blob (local dev), the
 * password always comes from ADMIN_PASSWORD in .env.local.
 *
 * A short in-memory cache avoids two problems: (1) a single request often
 * needs the password twice (once to check it, once to derive the session
 * token) — without caching those are two independent Blob reads that could
 * theoretically disagree; (2) right after changing the password, the Blob
 * write needs a moment to propagate, so we seed the cache with the new
 * value immediately instead of trusting a read-your-own-write.
 */
let cachedPassword: { value: string; expiresAt: number } | null = null;
const PASSWORD_CACHE_TTL_MS = 1000;

function envPassword(): string {
  const envSecret = process.env.ADMIN_PASSWORD;
  if (!envSecret) {
    throw new Error("ADMIN_PASSWORD is not set. Define it in .env.local.");
  }
  return envSecret;
}

async function getCurrentPassword(): Promise<string> {
  if (cachedPassword && cachedPassword.expiresAt > Date.now()) {
    return cachedPassword.value;
  }
  let value = envPassword();
  if (hasBlobStore()) {
    const stored = await readBlobJson<StoredPassword>(PASSWORD_BLOB_PATH);
    if (stored?.password) value = stored.password;
  }
  cachedPassword = { value, expiresAt: Date.now() + PASSWORD_CACHE_TTL_MS };
  return value;
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  const secret = await getCurrentPassword();
  const a = Buffer.from(password);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createSessionToken(): Promise<string> {
  const secret = await getCurrentPassword();
  return createHmac("sha256", secret).update("admin-session").digest("hex");
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!hasBlobStore()) {
    throw new Error("Trocar a senha requer o armazenamento Blob da Vercel conectado a este projeto.");
  }
  const isCurrentValid = await checkAdminPassword(currentPassword);
  if (!isCurrentValid) {
    throw new Error("Senha atual incorreta.");
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error("A nova senha precisa ter pelo menos 6 caracteres.");
  }
  await writeBlobJson(PASSWORD_BLOB_PATH, { password: newPassword } satisfies StoredPassword);
  cachedPassword = { value: newPassword, expiresAt: Date.now() + PASSWORD_CACHE_TTL_MS };

  // Overwriting a Blob object takes a few seconds to fully propagate before
  // every read sees it (measured ~3s), regardless of caching. The client is
  // about to be logged out and asked to log back in with the new password,
  // so we absorb that wait here instead of risking "senha incorreta" on the
  // very next login attempt.
  await new Promise((resolve) => setTimeout(resolve, 4000));
}
