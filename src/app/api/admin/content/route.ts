import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { getSiteContent, saveSiteContent } from "@/lib/site-content";
import type { SiteContent } from "@/types/site-content";

async function requireSession() {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const body = (await request.json()) as SiteContent;

  if (!body || typeof body.siteName !== "string" || !Array.isArray(body.sections)) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  await saveSiteContent(body);
  return NextResponse.json({ ok: true });
}
