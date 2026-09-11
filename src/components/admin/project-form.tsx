"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, ProjectSection } from "@/types/project";

const SECTIONS: { value: ProjectSection; label: string }[] = [
  { value: "arquitetura-interiores", label: "Arquitetura & Interiores" },
  { value: "cenografia-eventos", label: "Cenografia & Eventos" },
  { value: "consultoria-criativa", label: "Consultoria Criativa" },
];

const SHAPES: { value: Project["shape"]; label: string }[] = [
  { value: "square", label: "Normal" },
  { value: "wide", label: "Largo (ocupa 2 colunas)" },
  { value: "tall", label: "Alto (ocupa 2 linhas)" },
];

function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder={placeholder}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
        />
      )}
    </label>
  );
}

export interface ProjectFormValues {
  title: string;
  section: ProjectSection;
  shape: Project["shape"];
  location: string;
  year: string;
  tagline: string;
  program: string;
  area: string;
  credits: string;
  paragraphs: string; // newline-separated in the UI
  titleEn: string;
  locationEn: string;
  taglineEn: string;
  programEn: string;
  areaEn: string;
  creditsEn: string;
  paragraphsEn: string;
}

const EMPTY: ProjectFormValues = {
  title: "",
  section: "cenografia-eventos",
  shape: "square",
  location: "",
  year: "",
  tagline: "",
  program: "",
  area: "",
  credits: "",
  paragraphs: "",
  titleEn: "",
  locationEn: "",
  taglineEn: "",
  programEn: "",
  areaEn: "",
  creditsEn: "",
  paragraphsEn: "",
};

export function projectToFormValues(pt: Project, en?: Project): ProjectFormValues {
  return {
    title: pt.title,
    section: pt.section,
    shape: pt.shape,
    location: pt.location ?? "",
    year: pt.year ?? "",
    tagline: pt.tagline ?? "",
    program: pt.program ?? "",
    area: pt.area ?? "",
    credits: pt.credits ?? "",
    paragraphs: pt.paragraphs?.join("\n\n") ?? "",
    titleEn: en?.title && en.title !== pt.title ? en.title : "",
    locationEn: en?.location && en.location !== pt.location ? en.location : "",
    taglineEn: en?.tagline && en.tagline !== pt.tagline ? en.tagline : "",
    programEn: en?.program && en.program !== pt.program ? en.program : "",
    areaEn: en?.area && en.area !== pt.area ? en.area : "",
    creditsEn: en?.credits && en.credits !== pt.credits ? en.credits : "",
    paragraphsEn: en?.paragraphs?.join("\n\n") !== pt.paragraphs?.join("\n\n") ? en?.paragraphs?.join("\n\n") ?? "" : "",
  };
}

export function ProjectForm({
  mode,
  slug,
  initialValues,
  initialPhotos,
}: {
  mode: "create" | "edit";
  slug?: string;
  initialValues?: ProjectFormValues;
  initialPhotos?: string[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProjectFormValues>(initialValues ?? EMPTY);
  const [photos, setPhotos] = useState<string[]>(initialPhotos ?? []);
  const [showEnglish, setShowEnglish] = useState(
    Boolean(initialValues?.titleEn || initialValues?.taglineEn || initialValues?.paragraphsEn)
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const targetSlug = slug ?? values.title;
    if (!targetSlug.trim()) {
      setError("Escreva o título do projeto antes de enviar fotos.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("slug", targetSlug);
      Array.from(fileList).forEach((f) => form.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao enviar fotos");
      setPhotos((p) => [...p, ...data.paths]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar fotos");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(path: string) {
    setPhotos((p) => p.filter((x) => x !== path));
  }

  function movePhoto(index: number, dir: -1 | 1) {
    setPhotos((p) => {
      const next = p.slice();
      const target = index + dir;
      if (target < 0 || target >= next.length) return p;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toParagraphs(text: string): string[] {
    return text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  function buildProject(base: Partial<Project>): Project {
    return {
      slug: base.slug!,
      title: values.title,
      category: SECTIONS.find((s) => s.value === values.section)!.label,
      section: values.section,
      shape: values.shape,
      real: true,
      ...(photos[0] ? { image: photos[0] } : {}),
      ...(photos.length > 1 ? { gallery: photos.slice(1) } : {}),
      ...(values.location ? { location: values.location } : {}),
      ...(values.year ? { year: values.year } : {}),
      ...(values.tagline ? { tagline: values.tagline } : {}),
      ...(values.program ? { program: values.program } : {}),
      ...(values.area ? { area: values.area } : {}),
      ...(values.credits ? { credits: values.credits } : {}),
      ...(toParagraphs(values.paragraphs).length ? { paragraphs: toParagraphs(values.paragraphs) } : {}),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim() || !values.section) {
      setError("Preencha ao menos o título e a categoria.");
      return;
    }
    setStatus("saving");
    setError(null);

    try {
      if (mode === "create") {
        const ptInput = {
          title: values.title,
          section: values.section,
          shape: values.shape,
          location: values.location || undefined,
          year: values.year || undefined,
          tagline: values.tagline || undefined,
          program: values.program || undefined,
          area: values.area || undefined,
          credits: values.credits || undefined,
          paragraphs: toParagraphs(values.paragraphs),
          image: photos[0],
          gallery: photos.slice(1),
        };
        const enInput = showEnglish
          ? {
              title: values.titleEn || values.title,
              section: values.section,
              location: values.locationEn || values.location || undefined,
              tagline: values.taglineEn || values.tagline || undefined,
              program: values.programEn || values.program || undefined,
              area: values.areaEn || values.area || undefined,
              credits: values.creditsEn || values.credits || undefined,
              paragraphs: toParagraphs(values.paragraphsEn || values.paragraphs),
            }
          : undefined;

        const res = await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pt: ptInput, en: enInput }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Falha ao criar projeto");
        router.push("/admin/projects");
        router.refresh();
      } else {
        const pt = buildProject({ slug });
        const en = showEnglish
          ? {
              ...pt,
              title: values.titleEn || values.title,
              category: SECTIONS.find((s) => s.value === values.section)!.label,
              location: values.locationEn || values.location,
              tagline: values.taglineEn || values.tagline,
              program: values.programEn || values.program,
              area: values.areaEn || values.area,
              credits: values.creditsEn || values.credits,
              paragraphs: toParagraphs(values.paragraphsEn || values.paragraphs),
            }
          : undefined;

        const res = await fetch(`/api/admin/projects/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pt, en }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Falha ao salvar projeto");
        router.push("/admin/projects");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar");
      setStatus("error");
      return;
    }
    setStatus("idle");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Informações principais</h2>
        <Field label="Título" value={values.title} onChange={(v) => set("title", v)} />
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-neutral-500">Categoria</span>
            <select
              value={values.section}
              onChange={(e) => set("section", e.target.value as ProjectSection)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            >
              {SECTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-neutral-500">Formato na grade</span>
            <select
              value={values.shape}
              onChange={(e) => set("shape", e.target.value as Project["shape"])}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            >
              {SHAPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Local" value={values.location} onChange={(v) => set("location", v)} placeholder="Ex: São Paulo, SP" />
          <Field label="Ano" value={values.year} onChange={(v) => set("year", v)} placeholder="Ex: 2024" />
        </div>
        <Field
          label="Frase de destaque"
          value={values.tagline}
          onChange={(v) => set("tagline", v)}
          placeholder="Uma frase curta que resume o projeto"
        />
      </section>

      <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Ficha técnica</h2>
        <Field label="Programa" value={values.program} onChange={(v) => set("program", v)} />
        <Field label="Área" value={values.area} onChange={(v) => set("area", v)} />
        <Field
          label="Créditos (escritório / direção criativa)"
          value={values.credits}
          onChange={(v) => set("credits", v)}
        />
      </section>

      <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Descrição</h2>
        <Field
          label="Texto (separe os parágrafos com uma linha em branco)"
          value={values.paragraphs}
          onChange={(v) => set("paragraphs", v)}
          multiline
        />
      </section>

      <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Fotos do projeto</h2>
        <p className="text-xs text-neutral-500">
          A primeira foto da lista é usada como capa do projeto. Use as setas ← → para reordenar.
        </p>

        <label
          htmlFor="photo-upload-input"
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
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragOver
              ? "border-neutral-500 bg-neutral-50"
              : uploading
                ? "border-neutral-200 bg-neutral-50"
                : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
          } ${uploading ? "cursor-wait" : "cursor-pointer"}`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-lg text-white">
            +
          </span>
          <span className="text-sm font-medium text-neutral-900">
            {uploading ? "Enviando fotos..." : "Clique aqui ou arraste as fotos para esta área"}
          </span>
          <span className="text-xs text-neutral-400">JPG, PNG, WEBP ou GIF — pode selecionar várias de uma vez</span>
          <input
            id="photo-upload-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => {
              handleUpload(e.target.files);
              e.target.value = "";
            }}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-2 sm:grid-cols-4">
            {photos.map((src, i) => (
              <div key={src} className="relative overflow-hidden rounded-md border border-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-neutral-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Capa
                  </span>
                )}
                <div className="flex items-center justify-between gap-1 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => movePhoto(i, -1)}
                    disabled={i === 0}
                    className="rounded px-1 text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(src)}
                    className="rounded px-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(i, 1)}
                    disabled={i === photos.length - 1}
                    className="rounded px-1 text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-lg border border-neutral-200 p-5">
        <button
          type="button"
          onClick={() => setShowEnglish((v) => !v)}
          className="text-sm font-semibold text-neutral-900 hover:underline"
        >
          {showEnglish ? "− Ocultar versão em inglês" : "+ Adicionar versão em inglês (opcional)"}
        </button>
        {!showEnglish && (
          <p className="text-xs text-neutral-500">
            Se não preencher, o site em inglês mostra o mesmo texto em português até você traduzir.
          </p>
        )}
        {showEnglish && (
          <div className="space-y-3 pt-2">
            <Field label="Title" value={values.titleEn} onChange={(v) => set("titleEn", v)} placeholder={values.title} />
            <Field label="Location" value={values.locationEn} onChange={(v) => set("locationEn", v)} placeholder={values.location} />
            <Field label="Tagline" value={values.taglineEn} onChange={(v) => set("taglineEn", v)} placeholder={values.tagline} />
            <Field label="Program" value={values.programEn} onChange={(v) => set("programEn", v)} placeholder={values.program} />
            <Field label="Area" value={values.areaEn} onChange={(v) => set("areaEn", v)} placeholder={values.area} />
            <Field label="Credits" value={values.creditsEn} onChange={(v) => set("creditsEn", v)} placeholder={values.credits} />
            <Field
              label="Description (blank line between paragraphs)"
              value={values.paragraphsEn}
              onChange={(v) => set("paragraphsEn", v)}
              multiline
              placeholder={values.paragraphs}
            />
          </div>
        )}
      </section>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {status === "saving" ? "Salvando..." : mode === "create" ? "Criar projeto" : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
