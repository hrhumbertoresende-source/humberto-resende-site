import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { getTrajetoriaContent, saveTrajetoriaContent } from "@/lib/trajetoria";
import type { TrajetoriaContent } from "@/types/page-content";

async function requireSession() {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const [pt, en] = await Promise.all([getTrajetoriaContent("pt"), getTrajetoriaContent("en")]);
  return NextResponse.json({ pt, en });
}

export async function PUT(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const body = (await request.json()) as { pt?: TrajetoriaContent; en?: TrajetoriaContent };
  if (!body.pt || typeof body.pt.heroTitle !== "string" || !Array.isArray(body.pt.sections)) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const writes = [saveTrajetoriaContent(body.pt, "pt")];
  if (body.en) writes.push(saveTrajetoriaContent(body.en, "en"));
  await Promise.all(writes);

  return NextResponse.json({ ok: true });
}
