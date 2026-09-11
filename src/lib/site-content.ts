import { promises as fs } from "fs";
import path from "path";
import type { SiteContent } from "@/types/site-content";
import { hasBlobStore, readBlobJson, writeBlobJson } from "@/lib/blob-store";

const CONTENT_PATH = path.join(process.cwd(), "content", "site-content.json");
const CONTENT_PATH_EN = path.join(process.cwd(), "content", "site-content.en.json");
const BLOB_PATH = "content/site-content.json";

export async function getSiteContent(locale: "pt" | "en" = "pt"): Promise<SiteContent> {
  if (hasBlobStore()) {
    const fromBlob = await readBlobJson<SiteContent>(BLOB_PATH);
    if (fromBlob) return fromBlob;
  }
  const raw = await fs.readFile(locale === "en" ? CONTENT_PATH_EN : CONTENT_PATH, "utf-8");
  return JSON.parse(raw) as SiteContent;
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (hasBlobStore()) {
    await writeBlobJson(BLOB_PATH, content);
    return;
  }
  await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2) + "\n", "utf-8");
}
