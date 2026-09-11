"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProjectForm } from "@/components/admin/project-form";
import { AdminNav } from "@/components/admin/admin-nav";

export default function NewProjectPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/admin/projects").then((res) => {
      if (res.status === 401) router.push("/admin/login");
      else setReady(true);
    });
  }, [router]);

  if (!ready) return <main className="p-8 text-sm text-neutral-500">Carregando...</main>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <AdminNav />
      <header className="mb-6">
        <Link href="/admin/projects" className="text-xs text-neutral-500 hover:underline">
          ← Voltar para projetos
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">Novo projeto</h1>
        <p className="text-sm text-neutral-500">Preencha as informações e envie as fotos do projeto.</p>
      </header>
      <ProjectForm mode="create" />
    </main>
  );
}
