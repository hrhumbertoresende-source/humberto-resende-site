import { put, get } from "@vercel/blob";

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
  // get()'s public URL sits behind a CDN that can keep serving a stale
  // copy for a while after an overwrite — a query-string cache-buster
  // didn't reliably fix that. useCache: false reads straight from origin.
  try {
    const result = await get(pathname, { access: "public", useCache: false });
    if (!result) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function writeBlobJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
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
