import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { getProjects, saveProjects } from "@/lib/projects";
import type { Project } from "@/types/project";

async function requireSession() {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { slug } = await params;
  const body = (await request.json()) as { pt?: Project; en?: Project };
  if (!body.pt || body.pt.slug !== slug) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const [ptProjects, enProjects] = await Promise.all([getProjects("pt"), getProjects("en")]);

  const ptIndex = ptProjects.findIndex((p) => p.slug === slug);
  if (ptIndex === -1) {
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  }
  const nextPt = ptProjects.slice();
  nextPt[ptIndex] = body.pt;
  await saveProjects(nextPt, "pt");

  if (body.en) {
    const enIndex = enProjects.findIndex((p) => p.slug === slug);
    const nextEn = enProjects.slice();
    if (enIndex === -1) nextEn.push(body.en);
    else nextEn[enIndex] = body.en;
    await saveProjects(nextEn, "en");
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { slug } = await params;

  const [ptProjects, enProjects] = await Promise.all([getProjects("pt"), getProjects("en")]);
  await Promise.all([
    saveProjects(ptProjects.filter((p) => p.slug !== slug), "pt"),
    saveProjects(enProjects.filter((p) => p.slug !== slug), "en"),
  ]);

  // Best-effort cleanup of the project's photo folder — not every project
  // (e.g. the two hand-picked earliest ones) used this folder convention.
  try {
    await fs.rm(path.join(process.cwd(), "public", "images", "humberto", "trabalhos", slug), {
      recursive: true,
      force: true,
    });
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true });
}
