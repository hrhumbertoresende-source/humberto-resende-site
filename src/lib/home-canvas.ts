import type { HomeCanvasData } from "@/types/home-canvas";
import { getProjects, getProjectsBySection } from "@/lib/projects";
import { buildProjectCanvas } from "@/lib/canvas-builder";

// Every canvas below is computed live from content/projects*.json (via
// getProjects), so adding/editing/removing a project in the admin panel
// shows up immediately — there is no separate pre-generated layout file to
// go stale.

export async function getHomeCanvas(locale: "pt" | "en" = "pt"): Promise<HomeCanvasData> {
  const projects = await getProjects(locale);
  return buildProjectCanvas(projects, locale === "en" ? "/en" : "");
}

export async function getArquiteturaCanvas(locale: "pt" | "en" = "pt"): Promise<HomeCanvasData> {
  const projects = await getProjectsBySection("arquitetura-interiores", locale);
  return buildProjectCanvas(projects, locale === "en" ? "/en" : "");
}

export async function getCenografiaEventosCanvas(locale: "pt" | "en" = "pt"): Promise<HomeCanvasData> {
  const projects = await getProjectsBySection("cenografia-eventos", locale);
  return buildProjectCanvas(projects, locale === "en" ? "/en" : "");
}

export async function getConsultoriaCriativaCanvas(locale: "pt" | "en" = "pt"): Promise<HomeCanvasData> {
  const projects = await getProjectsBySection("consultoria-criativa", locale);
  return buildProjectCanvas(projects, locale === "en" ? "/en" : "");
}
