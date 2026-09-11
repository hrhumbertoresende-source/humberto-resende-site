"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent, Section } from "@/types/site-content";
import { AdminNav } from "@/components/admin/admin-nav";

function TextField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
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
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={/^#([0-9a-f]{3}){1,2}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-neutral-300"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-neutral-500"
        />
      </span>
    </label>
  );
}

const COLOR_LABELS: Record<string, string> = {
  background: "Fundo do site",
  foreground: "Texto padrão",
  primary: "Cor principal (logo, destaques)",
  secondary: "Cor secundária (menu)",
  border: "Linhas e divisórias",
  accent: "Cor de destaque",
  muted: "Cor neutra",
};

function SectionEditor({ section, onChange }: { section: Section; onChange: (next: Section) => void }) {
  switch (section.type) {
    case "contact":
      return (
        <div className="space-y-3">
          <TextField label="E-mail" value={section.email ?? ""} onChange={(v) => onChange({ ...section, email: v })} />
          <TextField label="Telefone" value={section.phone ?? ""} onChange={(v) => onChange({ ...section, phone: v })} />
          <TextField label="Endereço" value={section.address ?? ""} onChange={(v) => onChange({ ...section, address: v })} />
        </div>
      );
    case "footer":
      return (
        <TextField
          label="Texto de rodapé / direitos autorais"
          value={section.copyright}
          onChange={(v) => onChange({ ...section, copyright: v })}
        />
      );
    default:
      return null;
  }
}

const SECTION_TITLES: Record<Section["type"], string> = {
  contact: "Contato",
  footer: "Rodapé",
};

export default function AdminSitePage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => data && setContent(data));
  }, [router]);

  async function handleSave() {
    if (!content) return;
    setStatus("saving");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setStatus(res.ok ? "saved" : "error");
    if (res.ok) setTimeout(() => setStatus("idle"), 2000);
  }

  function updateSection(index: number, next: Section) {
    if (!content) return;
    const sections = content.sections.slice();
    sections[index] = next;
    setContent({ ...content, sections });
  }

  if (!content) {
    return <main className="p-8 text-sm text-neutral-500">Carregando...</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <AdminNav />

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Configurações do site</h1>
          <p className="text-sm text-neutral-500">Nome, cores, contato e rodapé.</p>
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

      {status === "error" && (
        <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Erro ao salvar. Tente novamente.</p>
      )}

      <div className="space-y-6">
        <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Geral</h2>
          <TextField
            label="Nome do site"
            value={content.siteName}
            onChange={(v) => setContent({ ...content, siteName: v })}
          />
        </section>

        <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Cores</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(content.theme.colors).map(([key, value]) => (
              <ColorField
                key={key}
                label={COLOR_LABELS[key] ?? key}
                value={value}
                onChange={(v) =>
                  setContent({
                    ...content,
                    theme: { ...content.theme, colors: { ...content.theme.colors, [key]: v } },
                  })
                }
              />
            ))}
          </div>
        </section>

        {content.sections.map((section, i) => (
          <section key={section.id} className="space-y-3 rounded-lg border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-900">{SECTION_TITLES[section.type]}</h2>
            <SectionEditor section={section} onChange={(next) => updateSection(i, next)} />
          </section>
        ))}
      </div>
    </main>
  );
}
