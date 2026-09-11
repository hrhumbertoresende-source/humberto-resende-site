import { put, list } from "@vercel/blob";

/**
 * On Vercel the filesystem is read-only at runtime, so admin-saved content
 * (and uploaded photos) can't live in local files there. When a Blob store
 * is connected (BLOB_READ_WRITE_TOKEN present) we persist through it;
 * locally, callers fall back to reading/writing the bundled files instead.
 */
export function hasBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readBlobJson<T>(pathname: string): Promise<T | null> {
  const { blobs } = await list({ prefix: pathname, limit: 10 });
  const match = blobs.find((b) => b.pathname === pathname);
  if (!match) return null;
  const res = await fetch(match.url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function writeBlobJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function writeBlobFile(
  pathname: string,
  body: Buffer,
  contentType: string
): Promise<{ url: string }> {
  const blob = await put(pathname, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });
  return { url: blob.url };
}
