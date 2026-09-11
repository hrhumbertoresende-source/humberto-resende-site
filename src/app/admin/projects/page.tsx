"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project } from "@/types/project";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/projects")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => data && setProjects(data.pt));
  }

  useEffect(load, [router]);

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Remover "${title}"? Isso apaga o projeto e as fotos dele do site.`)) return;
    setDeleting(slug);
    const res = await fetch(`/api/admin/projects/${slug}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) load();
  }

  if (!projects) {
    return <main className="p-8 text-sm text-neutral-500">Carregando...</main>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <AdminNav />

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Projetos</h1>
          <p className="text-sm text-neutral-500">{projects.length} projetos no site.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Novo projeto
        </Link>
      </header>

      {projects.length === 0 && (
        <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          Nenhum projeto ainda. Clique em &ldquo;+ Novo projeto&rdquo; para adicionar o primeiro.
        </p>
      )}

      <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
        {projects.map((p) => (
          <li key={p.slug} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                  Sem foto
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{p.title}</p>
              <p className="truncate text-xs text-neutral-500">{p.category}</p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <Link
                href={`/admin/projects/${p.slug}`}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-50"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(p.slug, p.title)}
                disabled={deleting === p.slug}
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting === p.slug ? "Removendo..." : "Remover"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
