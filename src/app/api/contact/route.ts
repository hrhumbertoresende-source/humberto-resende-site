import { NextResponse } from "next/server";
import { Resend } from "resend";

const CONTACT_EMAIL = "hr.humbertoresende@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { name?: string; email?: string; subject?: string; message?: string }
    | null;

  const name = body?.name?.trim();
  const email = body?.email?.trim();
  const subject = body?.subject?.trim();
  const message = body?.message?.trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Preencha nome, e-mail, assunto e mensagem." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Envio de e-mail ainda não configurado." }, { status: 500 });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Site Humberto Resende <onboarding@resend.dev>",
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[Site] ${subject}`,
      text: `Nome: ${name}\nE-mail: ${email}\nAssunto: ${subject}\n\nMensagem:\n${message}`,
    });
    if (error) {
      return NextResponse.json({ error: "Falha ao enviar mensagem." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Falha ao enviar mensagem." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
