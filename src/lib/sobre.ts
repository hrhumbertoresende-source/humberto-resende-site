import { promises as fs } from "fs";
import path from "path";
import type { SobreContent } from "@/types/page-content";

const SOBRE_PATH = path.join(process.cwd(), "content", "sobre.json");
const SOBRE_PATH_EN = path.join(process.cwd(), "content", "sobre.en.json");

export async function getSobreContent(locale: "pt" | "en" = "pt"): Promise<SobreContent> {
  const raw = await fs.readFile(locale === "en" ? SOBRE_PATH_EN : SOBRE_PATH, "utf-8");
  return JSON.parse(raw) as SobreContent;
}

export async function saveSobreContent(content: SobreContent, locale: "pt" | "en" = "pt"): Promise<void> {
  const targetPath = locale === "en" ? SOBRE_PATH_EN : SOBRE_PATH;
  await fs.writeFile(targetPath, JSON.stringify(content, null, 2) + "\n", "utf-8");
}
