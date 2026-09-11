import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { getProjects, saveProjects } from "@/lib/projects";
import { slugify } from "@/lib/slug";
import type { Project, ProjectSection } from "@/types/project";

const SECTION_LABEL: Record<ProjectSection, { pt: string; en: string }> = {
  "arquitetura-interiores": { pt: "Arquitetura & Interiores", en: "Architecture & Interiors" },
  "cenografia-eventos": { pt: "Cenografia & Eventos", en: "Scenography & Events" },
  "consultoria-criativa": { pt: "Consultoria Criativa", en: "Creative Consulting" },
};

async function requireSession() {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const [pt, en] = await Promise.all([getProjects("pt"), getProjects("en")]);
  return NextResponse.json({ pt, en });
}

interface ProjectInput {
  title: string;
  section: ProjectSection;
  shape?: Project["shape"];
  location?: string;
  year?: string;
  tagline?: string;
  program?: string;
  area?: string;
  credits?: string;
  paragraphs?: string[];
  image?: string;
  gallery?: string[];
}

export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const body = (await request.json()) as { pt?: ProjectInput; en?: ProjectInput };
  if (!body.pt?.title || !body.pt?.section) {
    return NextResponse.json({ error: "Título e categoria são obrigatórios" }, { status: 400 });
  }

  const [ptProjects, enProjects] = await Promise.all([getProjects("pt"), getProjects("en")]);

  let slug = slugify(body.pt.title);
  const existingSlugs = new Set(ptProjects.map((p) => p.slug));
  if (existingSlugs.has(slug)) {
    let i = 2;
    while (existingSlugs.has(`${slug}-${i}`)) i++;
    slug = `${slug}-${i}`;
  }

  function toProject(input: ProjectInput, locale: "pt" | "en"): Project {
    return {
      slug,
      title: input.title,
      category: SECTION_LABEL[input.section][locale],
      section: input.section,
      shape: input.shape ?? "square",
      real: true,
      ...(input.image ? { image: input.image } : {}),
      ...(input.gallery?.length ? { gallery: input.gallery } : {}),
      ...(input.location ? { location: input.location } : {}),
      ...(input.year ? { year: input.year } : {}),
      ...(input.tagline ? { tagline: input.tagline } : {}),
      ...(input.program ? { program: input.program } : {}),
      ...(input.area ? { area: input.area } : {}),
      ...(input.credits ? { credits: input.credits } : {}),
      ...(input.paragraphs?.length ? { paragraphs: input.paragraphs } : {}),
    };
  }

  const ptProject = toProject(body.pt, "pt");
  const enProject = toProject(body.en?.title ? body.en : body.pt, "en");

  await Promise.all([
    saveProjects([...ptProjects, ptProject], "pt"),
    saveProjects([...enProjects, enProject], "en"),
  ]);

  return NextResponse.json({ ok: true, slug });
}
