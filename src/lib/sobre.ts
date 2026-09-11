import { promises as fs } from "fs";
import path from "path";
import type { SobreContent } from "@/types/page-content";
import { hasBlobStore, readBlobJson, writeBlobJson } from "@/lib/blob-store";

const SOBRE_PATH = path.join(process.cwd(), "content", "sobre.json");
const SOBRE_PATH_EN = path.join(process.cwd(), "content", "sobre.en.json");
const BLOB_PATH = "content/sobre.json";
const BLOB_PATH_EN = "content/sobre.en.json";

export async function getSobreContent(locale: "pt" | "en" = "pt"): Promise<SobreContent> {
  if (hasBlobStore()) {
    const fromBlob = await readBlobJson<SobreContent>(locale === "en" ? BLOB_PATH_EN : BLOB_PATH);
    if (fromBlob) return fromBlob;
  }
  const raw = await fs.readFile(locale === "en" ? SOBRE_PATH_EN : SOBRE_PATH, "utf-8");
  return JSON.parse(raw) as SobreContent;
}

export async function saveSobreContent(content: SobreContent, locale: "pt" | "en" = "pt"): Promise<void> {
  if (hasBlobStore()) {
    await writeBlobJson(locale === "en" ? BLOB_PATH_EN : BLOB_PATH, content);
    return;
  }
  const targetPath = locale === "en" ? SOBRE_PATH_EN : SOBRE_PATH;
  await fs.writeFile(targetPath, JSON.stringify(content, null, 2) + "\n", "utf-8");
}
