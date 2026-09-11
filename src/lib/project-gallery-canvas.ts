import type { ProjectGalleryCanvasData } from "@/types/project-gallery-canvas";
import { getProjectBySlug } from "@/lib/projects";
import { buildPhotoCanvas } from "@/lib/canvas-builder";

export async function getProjectGalleryCanvas(
  slug: string,
  locale: "pt" | "en" = "pt"
): Promise<ProjectGalleryCanvasData | undefined> {
  const project = await getProjectBySlug(slug, locale);
  if (!project) return undefined;
  const sources = [project.image, ...(project.gallery ?? [])].filter((s): s is string => Boolean(s));
  return buildPhotoCanvas(sources, project.title);
}
