"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import type { SobreContent, SobreTimelineEntry } from "@/types/page-content";

interface SobreFormValues {
  tagline: string;
  profileImage: string;
  col1p1: string;
  col1p2: string;
  col2p1: string;
  col2p2: string;
  col3p1: string;
  col3p2: string;
  timeline1: string;
  timeline2: string;
  timeline3: string;
}

function timelineToText(entries: SobreTimelineEntry[]): string {
  return entries.flatMap((e) => e.items.map((item) => `${e.year}: ${item}`)).join("\n");
}

function textToTimeline(text: string): SobreTimelineEntry[] {
  const result: SobreTimelineEntry[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const year = line.slice(0, idx).trim();
    const item = line.slice(idx + 1).trim();
    if (!year || !item) continue;
    const existing = result.find((e) => e.year === year);
    if (existing) existing.items.push(item);
    else result.push({ year, items: [item] });
  }
  return result;
}

function toFormValues(c: SobreContent): SobreFormValues {
  return {
    tagline: c.tagline,
    profileImage: c.profileImage,
    col1p1: c.bioColumns[0]?.paragraphs[0] ?? "",
    col1p2: c.bioColumns[0]?.paragraphs[1] ?? "",
    col2p1: c.bioColumns[1]?.paragraphs[0] ?? "",
    col2p2: c.bioColumns[1]?.paragraphs[1] ?? "",
    col3p1: c.bioColumns[2]?.paragraphs[0] ?? "",
    col3p2: c.bioColumns[2]?.paragraphs[1] ?? "",
    timeline1: timelineToText(c.timelineColumns[0] ?? []),
    timeline2: timelineToText(c.timelineColumns[1] ?? []),
    timeline3: timelineToText(c.timelineColumns[2] ?? []),
  };
}

function fromFormValues(v: SobreFormValues): SobreContent {
  return {
    tagline: v.tagline,
    profileImage: v.profileImage,
    bioColumns: [
      { paragraphs: [v.col1p1, v.col1p2].filter(Boolean) },
      { paragraphs: [v.col2p1, v.col2p2].filter(Boolean) },
      { paragraphs: [v.col3p1, v.col3p2].filter(Boolean) },
    ],
    timelineColumns: [textToTimeline(v.timeline1), textToTimeline(v.timeline2), textToTimeline(v.timeline3)],
  };
}

function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
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

export default function AdminSobrePage() {
  const router = useRouter();
  const [pt, setPt] = useState<SobreFormValues | null>(null);
  const [en, setEn] = useState<SobreFormValues | null>(null);
  const [locale, setLocale] = useState<"pt" | "en">("pt");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/sobre")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data: { pt: SobreContent; en: SobreContent } | null) => {
        if (!data) return;
        setPt(toFormValues(data.pt));
        setEn(toFormValues(data.en));
      });
  }, [router]);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("slug", "sobre-perfil");
      form.append("files", fileList[0]);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao enviar foto");
      const path: string = data.paths[0];
      setPt((v) => v && { ...v, profileImage: path });
      setEn((v) => v && { ...v, profileImage: path });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar foto");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!pt || !en) return;
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/sobre", {
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

  function set<K extends keyof SobreFormValues>(key: K, value: SobreFormValues[K]) {
    setValues((v) => v && { ...v, [key]: value });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <AdminNav />

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Página Sobre</h1>
          <p className="text-sm text-neutral-500">Texto de apresentação, foto de perfil e mini-trajetória.</p>
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
          <h2 className="text-sm font-semibold text-neutral-900">Título de destaque</h2>
          <Field
            label="Frase grande no topo da página"
            value={values.tagline}
            onChange={(v) => set("tagline", v)}
          />
        </section>

        <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Foto de perfil</h2>
          <p className="text-xs text-neutral-500">Mesma foto para as duas versões do site (PT/EN).</p>
          <label
            htmlFor="sobre-photo-input"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleUpload(e.dataTransfer.files);
            }}
            className={`flex items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-colors ${
              dragOver ? "border-neutral-500 bg-neutral-50" : "border-neutral-300 hover:border-neutral-400"
            } ${uploading ? "cursor-wait" : "cursor-pointer"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pt.profileImage}
              alt=""
              className="h-24 w-20 flex-shrink-0 rounded-md object-cover"
            />
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {uploading ? "Enviando..." : "Clique ou arraste uma nova foto"}
              </p>
              <p className="text-xs text-neutral-400">JPG, PNG ou WEBP</p>
            </div>
            <input
              id="sobre-photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => {
                handleUpload(e.target.files);
                e.target.value = "";
              }}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 p-5">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Texto de apresentação</h2>
            <p className="text-xs text-neutral-500">
              Aparece em 3 colunas, com a foto de perfil no meio da coluna 2. {BOLD_HINT}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">Coluna 1</p>
            <Field label="Parágrafo 1" value={values.col1p1} onChange={(v) => set("col1p1", v)} multiline />
            <Field label="Parágrafo 2" value={values.col1p2} onChange={(v) => set("col1p2", v)} multiline />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">Coluna 2 (com a foto no meio)</p>
            <Field label="Parágrafo antes da foto" value={values.col2p1} onChange={(v) => set("col2p1", v)} multiline />
            <Field label="Parágrafo depois da foto" value={values.col2p2} onChange={(v) => set("col2p2", v)} multiline />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">Coluna 3</p>
            <Field label="Parágrafo 1" value={values.col3p1} onChange={(v) => set("col3p1", v)} multiline />
            <Field label="Parágrafo 2" value={values.col3p2} onChange={(v) => set("col3p2", v)} multiline />
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-200 p-5">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Mini-trajetória</h2>
            <p className="text-xs text-neutral-500">
              Uma conquista por linha, no formato <code>ANO: texto</code>. Linhas com o mesmo ano ficam agrupadas
              automaticamente.
            </p>
          </div>
          <Field
            label="Coluna 1"
            value={values.timeline1}
            onChange={(v) => set("timeline1", v)}
            multiline
            hint="Ex: 2005: Início da graduação em Arquitetura, Belas Artes de São Paulo."
          />
          <Field label="Coluna 2" value={values.timeline2} onChange={(v) => set("timeline2", v)} multiline />
          <Field label="Coluna 3" value={values.timeline3} onChange={(v) => set("timeline3", v)} multiline />
        </section>
      </div>
    </main>
  );
}
