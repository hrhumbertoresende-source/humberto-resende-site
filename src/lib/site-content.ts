import { promises as fs } from "fs";
import path from "path";
import type { SiteContent } from "@/types/site-content";

const CONTENT_PATH = path.join(process.cwd(), "content", "site-content.json");
const CONTENT_PATH_EN = path.join(process.cwd(), "content", "site-content.en.json");

export async function getSiteContent(locale: "pt" | "en" = "pt"): Promise<SiteContent> {
  const raw = await fs.readFile(locale === "en" ? CONTENT_PATH_EN : CONTENT_PATH, "utf-8");
  return JSON.parse(raw) as SiteContent;
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2) + "\n", "utf-8");
}
