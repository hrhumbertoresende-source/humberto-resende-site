import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { getSobreContent, saveSobreContent } from "@/lib/sobre";
import type { SobreContent } from "@/types/page-content";

async function requireSession() {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const [pt, en] = await Promise.all([getSobreContent("pt"), getSobreContent("en")]);
  return NextResponse.json({ pt, en });
}

export async function PUT(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const body = (await request.json()) as { pt?: SobreContent; en?: SobreContent };
  if (!body.pt || typeof body.pt.tagline !== "string" || !Array.isArray(body.pt.bioColumns)) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const writes = [saveSobreContent(body.pt, "pt")];
  if (body.en) writes.push(saveSobreContent(body.en, "en"));
  await Promise.all(writes);

  return NextResponse.json({ ok: true });
}
