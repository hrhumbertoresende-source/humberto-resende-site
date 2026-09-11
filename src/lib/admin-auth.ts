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
 */
async function getCurrentPassword(): Promise<string> {
  if (hasBlobStore()) {
    const stored = await readBlobJson<StoredPassword>(PASSWORD_BLOB_PATH);
    if (stored?.password) return stored.password;
  }
  const envSecret = process.env.ADMIN_PASSWORD;
  if (!envSecret) {
    throw new Error("ADMIN_PASSWORD is not set. Define it in .env.local.");
  }
  return envSecret;
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
}
