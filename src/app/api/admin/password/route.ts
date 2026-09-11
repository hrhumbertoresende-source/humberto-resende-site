import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken, changeAdminPassword } from "@/lib/admin-auth";

async function requireSession() {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function PUT(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { currentPassword, newPassword } = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Preencha a senha atual e a nova senha" }, { status: 400 });
  }

  try {
    await changeAdminPassword(currentPassword, newPassword);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Falha ao trocar a senha" }, { status: 400 });
  }

  // The session token is derived from the password, so every existing
  // session (including this one) is invalid the moment it changes.
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
