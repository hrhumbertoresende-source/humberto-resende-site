import { promises as fs } from "fs";
import path from "path";
import type { TrajetoriaContent } from "@/types/page-content";

const TRAJETORIA_PATH = path.join(process.cwd(), "content", "trajetoria.json");
const TRAJETORIA_PATH_EN = path.join(process.cwd(), "content", "trajetoria.en.json");

export async function getTrajetoriaContent(locale: "pt" | "en" = "pt"): Promise<TrajetoriaContent> {
  const raw = await fs.readFile(locale === "en" ? TRAJETORIA_PATH_EN : TRAJETORIA_PATH, "utf-8");
  return JSON.parse(raw) as TrajetoriaContent;
}

export async function saveTrajetoriaContent(content: TrajetoriaContent, locale: "pt" | "en" = "pt"): Promise<void> {
  const targetPath = locale === "en" ? TRAJETORIA_PATH_EN : TRAJETORIA_PATH;
  await fs.writeFile(targetPath, JSON.stringify(content, null, 2) + "\n", "utf-8");
}
