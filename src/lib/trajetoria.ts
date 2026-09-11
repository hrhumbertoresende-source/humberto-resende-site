import { promises as fs } from "fs";
import path from "path";
import type { TrajetoriaContent } from "@/types/page-content";
import { hasBlobStore, readBlobJson, writeBlobJson } from "@/lib/blob-store";

const TRAJETORIA_PATH = path.join(process.cwd(), "content", "trajetoria.json");
const TRAJETORIA_PATH_EN = path.join(process.cwd(), "content", "trajetoria.en.json");
const BLOB_PATH = "content/trajetoria.json";
const BLOB_PATH_EN = "content/trajetoria.en.json";

export async function getTrajetoriaContent(locale: "pt" | "en" = "pt"): Promise<TrajetoriaContent> {
  if (hasBlobStore()) {
    const fromBlob = await readBlobJson<TrajetoriaContent>(locale === "en" ? BLOB_PATH_EN : BLOB_PATH);
    if (fromBlob) return fromBlob;
  }
  const raw = await fs.readFile(locale === "en" ? TRAJETORIA_PATH_EN : TRAJETORIA_PATH, "utf-8");
  return JSON.parse(raw) as TrajetoriaContent;
}

export async function saveTrajetoriaContent(content: TrajetoriaContent, locale: "pt" | "en" = "pt"): Promise<void> {
  if (hasBlobStore()) {
    await writeBlobJson(locale === "en" ? BLOB_PATH_EN : BLOB_PATH, content);
    return;
  }
  const targetPath = locale === "en" ? TRAJETORIA_PATH_EN : TRAJETORIA_PATH;
  await fs.writeFile(targetPath, JSON.stringify(content, null, 2) + "\n", "utf-8");
}
