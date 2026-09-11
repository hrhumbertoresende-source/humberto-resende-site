"use client";

import { useState } from "react";

const COPY = {
  pt: {
    name: "Nome",
    email: "E-mail",
    subject: "Assunto",
    message: "Mensagem",
    submit: "Enviar mensagem",
    sending: "Enviando...",
    success: "Mensagem enviada! Retornaremos em breve.",
    fallbackError: "Não foi possível enviar. Tente novamente ou escreva direto para o e-mail acima.",
  },
  en: {
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    submit: "Send message",
    sending: "Sending...",
    success: "Message sent! We'll get back to you soon.",
    fallbackError: "Couldn't send it. Try again or email the address above directly.",
  },
};

export function ContactForm({ locale }: { locale: "pt" | "en" }) {
  const t = COPY[locale];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.fallbackError);
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.fallbackError);
      setStatus("error");
    }
  }

  if (status === "success") {
    return <p className="text-sm text-neutral-600">{t.success}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <input
        type="text"
        placeholder={`${t.name} *`}
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
      />
      <input
        type="email"
        placeholder={`${t.email} *`}
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
      />
      <input
        type="text"
        placeholder={`${t.subject} *`}
        required
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 sm:col-span-2"
      />
      <textarea
        placeholder={`${t.message} *`}
        required
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 sm:col-span-2"
      />
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 sm:col-span-2 sm:w-fit"
      >
        {status === "sending" ? t.sending : t.submit}
      </button>
    </form>
  );
}
