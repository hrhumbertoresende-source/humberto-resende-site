"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import type { TrajetoriaContent, TrajetoriaTimelineItem } from "@/types/page-content";

interface SectionFormValue {
  title: string;
  paragraphs: string; // blank-line separated
}

interface TrajetoriaFormValues {
  heroTitle: string;
  sections: SectionFormValue[];
  formacao: string; // one per line
  ferramentas: string;
  idiomas: string; // one per line
  linhaDoTempo: TrajetoriaTimelineItem[];
  clientes: string; // one per line
}

function toFormValues(c: TrajetoriaContent): TrajetoriaFormValues {
  return {
    heroTitle: c.heroTitle,
    sections: c.sections.map((s) => ({ title: s.title, paragraphs: s.paragraphs.join("\n\n") })),
    formacao: c.formacao.join("\n"),
    ferramentas: c.ferramentas,
    idiomas: c.idiomas.join("\n"),
    linhaDoTempo: c.linhaDoTempo,
    clientes: c.clientes.join("\n"),
  };
}

function linesOf(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function fromFormValues(v: TrajetoriaFormValues): TrajetoriaContent {
  return {
    heroTitle: v.heroTitle,
    sections: v.sections
      .filter((s) => s.title.trim() || s.paragraphs.trim())
      .map((s) => ({
        title: s.title,
        paragraphs: s.paragraphs
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
      })),
    formacao: linesOf(v.formacao),
    ferramentas: v.ferramentas,
    idiomas: linesOf(v.idiomas),
    linhaDoTempo: v.linhaDoTempo.filter((item) => item.periodo.trim() || item.cargo.trim() || item.texto.trim()),
    clientes: linesOf(v.clientes),
  };
}

function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
  rows?: number;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      )}
      {hint && <span className="block text-[11px] text-neutral-400">{hint}</span>}
    </label>
  );
}

const BOLD_HINT = "Use **palavra** para deixar um trecho em negrito.";
const EMPTY_TIMELINE_ITEM: TrajetoriaTimelineItem = { periodo: "", cargo: "", local: "", texto: "" };

export default function AdminTrajetoriaPage() {
  const router = useRouter();
  const [pt, setPt] = useState<TrajetoriaFormValues | null>(null);
  const [en, setEn] = useState<TrajetoriaFormValues | null>(null);
  const [locale, setLocale] = useState<"pt" | "en">("pt");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/trajetoria")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data: { pt: TrajetoriaContent; en: TrajetoriaContent } | null) => {
        if (!data) return;
        setPt(toFormValues(data.pt));
        setEn(toFormValues(data.en));
      });
  }, [router]);

  async function handleSave() {
    if (!pt || !en) return;
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/trajetoria", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pt: fromFormValues(pt), en: fromFormValues(en) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao salvar");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar");
      setStatus("error");
    }
  }

  if (!pt || !en) return <main className="p-8 text-sm text-neutral-500">Carregando...</main>;

  const values = locale === "pt" ? pt : en;
  const setValues = locale === "pt" ? setPt : setEn;

  function set<K extends keyof TrajetoriaFormValues>(key: K, value: TrajetoriaFormValues[K]) {
    setValues((v) => v && { ...v, [key]: value });
  }

  function updateSection(index: number, next: SectionFormValue) {
    const sections = values.sections.slice();
    sections[index] = next;
    set("sections", sections);
  }

  function addSection() {
    set("sections", [...values.sections, { title: "", paragraphs: "" }]);
  }

  function removeSection(index: number) {
    set(
      "sections",
      values.sections.filter((_, i) => i !== index)
    );
  }

  function updateTimelineItem(index: number, next: TrajetoriaTimelineItem) {
    const linhaDoTempo = values.linhaDoTempo.slice();
    linhaDoTempo[index] = next;
    set("linhaDoTempo", linhaDoTempo);
  }

  function addTimelineItem() {
    set("linhaDoTempo", [...values.linhaDoTempo, { ...EMPTY_TIMELINE_ITEM }]);
  }

  function removeTimelineItem(index: number) {
    set(
      "linhaDoTempo",
      values.linhaDoTempo.filter((_, i) => i !== index)
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <AdminNav />

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Página Trajetória</h1>
          <p className="text-sm text-neutral-500">Formação, linha do tempo profissional e clientes atendidos.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {status === "saving" ? "Salvando..." : status === "saved" ? "Salvo!" : "Salvar"}
        </button>
      </header>

      {error && <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-6 flex w-fit gap-1 rounded-md border border-neutral-200 p-1">
        <button
          type="button"
          onClick={() => setLocale("pt")}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            locale === "pt" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
          }`}
        >
          Português
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            locale === "en" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
          }`}
        >
          English
        </button>
      </div>

      <div className="space-y-6">
        <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Título principal</h2>
          <Field label="Frase de destaque no topo da página" value={values.heroTitle} onChange={(v) => set("heroTitle", v)} hint={BOLD_HINT} />
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Blocos de texto</h2>
              <p className="text-xs text-neutral-500">{BOLD_HINT} Separe parágrafos com uma linha em branco.</p>
            </div>
            <button type="button" onClick={addSection} className="text-xs font-medium text-neutral-900 hover:underline">
              + Adicionar bloco
            </button>
          </div>
          {values.sections.map((s, i) => (
            <div key={i} className="space-y-2 rounded-md border border-neutral-100 bg-neutral-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">Bloco {i + 1}</span>
                <button type="button" onClick={() => removeSection(i)} className="text-xs text-red-600 hover:underline">
                  Remover
                </button>
              </div>
              <Field label="Título" value={s.title} onChange={(v) => updateSection(i, { ...s, title: v })} />
              <Field
                label="Texto"
                value={s.paragraphs}
                onChange={(v) => updateSection(i, { ...s, paragraphs: v })}
                multiline
                rows={5}
              />
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Formação e competências</h2>
          <Field label="Formação (uma por linha)" value={values.formacao} onChange={(v) => set("formacao", v)} multiline />
          <Field label="Ferramentas" value={values.ferramentas} onChange={(v) => set("ferramentas", v)} />
          <Field label="Idiomas (um por linha)" value={values.idiomas} onChange={(v) => set("idiomas", v)} multiline />
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Linha do tempo</h2>
            <button type="button" onClick={addTimelineItem} className="text-xs font-medium text-neutral-900 hover:underline">
              + Adicionar experiência
            </button>
          </div>
          {values.linhaDoTempo.map((item, i) => (
            <div key={i} className="space-y-2 rounded-md border border-neutral-100 bg-neutral-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">Experiência {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTimelineItem(i)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Período"
                  value={item.periodo}
                  onChange={(v) => updateTimelineItem(i, { ...item, periodo: v })}
                  hint="Ex: 2016 – 2021"
                />
                <Field label="Cargo" value={item.cargo} onChange={(v) => updateTimelineItem(i, { ...item, cargo: v })} />
              </div>
              <Field label="Local / empresa" value={item.local} onChange={(v) => updateTimelineItem(i, { ...item, local: v })} />
              <Field label="Descrição" value={item.texto} onChange={(v) => updateTimelineItem(i, { ...item, texto: v })} multiline />
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Clientes atendidos</h2>
          <Field label="Um cliente por linha" value={values.clientes} onChange={(v) => set("clientes", v)} multiline rows={6} />
        </section>
      </div>
    </main>
  );
}
