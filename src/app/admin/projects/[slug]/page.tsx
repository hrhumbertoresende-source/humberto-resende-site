"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProjectForm, projectToFormValues, type ProjectFormValues } from "@/components/admin/project-form";
import type { Project } from "@/types/project";
import { AdminNav } from "@/components/admin/admin-nav";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [values, setValues] = useState<ProjectFormValues | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data: { pt: Project[]; en: Project[] } | null) => {
        if (!data) return;
        const pt = data.pt.find((p) => p.slug === params.slug);
        if (!pt) {
          setNotFound(true);
          return;
        }
        const en = data.en.find((p) => p.slug === params.slug);
        setValues(projectToFormValues(pt, en));
        setPhotos([pt.image, ...(pt.gallery ?? [])].filter((s): s is string => Boolean(s)));
      });
  }, [params.slug, router]);

  if (notFound) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <AdminNav />
        <p className="text-sm text-neutral-500">Projeto não encontrado.</p>
        <Link href="/admin/projects" className="text-sm text-neutral-900 hover:underline">
          ← Voltar para projetos
        </Link>
      </main>
    );
  }

  if (!values) return <main className="p-8 text-sm text-neutral-500">Carregando...</main>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <AdminNav />
      <header className="mb-6">
        <Link href="/admin/projects" className="text-xs text-neutral-500 hover:underline">
          ← Voltar para projetos
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">Editar projeto</h1>
      </header>
      <ProjectForm mode="edit" slug={params.slug} initialValues={values} initialPhotos={photos} />
    </main>
  );
}
