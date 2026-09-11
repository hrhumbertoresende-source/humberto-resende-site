import { promises as fs } from "fs";
import path from "path";
import type { Project, ProjectSection } from "@/types/project";
import { hasBlobStore, readBlobJson, writeBlobJson } from "@/lib/blob-store";

const PROJECTS_PATH = path.join(process.cwd(), "content", "projects.json");
const PROJECTS_PATH_EN = path.join(process.cwd(), "content", "projects.en.json");
const BLOB_PATH = "content/projects.json";
const BLOB_PATH_EN = "content/projects.en.json";

export async function getProjects(locale: "pt" | "en" = "pt"): Promise<Project[]> {
  if (hasBlobStore()) {
    const fromBlob = await readBlobJson<Project[]>(locale === "en" ? BLOB_PATH_EN : BLOB_PATH);
    if (fromBlob) return fromBlob;
  }
  const raw = await fs.readFile(locale === "en" ? PROJECTS_PATH_EN : PROJECTS_PATH, "utf-8");
  return JSON.parse(raw) as Project[];
}

export async function getProjectsBySection(
  section: ProjectSection,
  locale: "pt" | "en" = "pt"
): Promise<Project[]> {
  const all = await getProjects(locale);
  return all.filter((p) => p.section === section);
}

export async function getProjectBySlug(
  slug: string,
  locale: "pt" | "en" = "pt"
): Promise<Project | undefined> {
  const all = await getProjects(locale);
  return all.find((p) => p.slug === slug);
}

export async function saveProjects(projects: Project[], locale: "pt" | "en" = "pt"): Promise<void> {
  if (hasBlobStore()) {
    await writeBlobJson(locale === "en" ? BLOB_PATH_EN : BLOB_PATH, projects);
    return;
  }
  const targetPath = locale === "en" ? PROJECTS_PATH_EN : PROJECTS_PATH;
  await fs.writeFile(targetPath, JSON.stringify(projects, null, 2) + "\n", "utf-8");
}
