"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";

const CARDS = [
  {
    href: "/admin/site",
    title: "Configurações do site",
    description: "Nome, cores, e-mail, telefone, endereço e rodapé.",
  },
  {
    href: "/admin/projects",
    title: "Projetos",
    description: "Adicione, edite ou remova os trabalhos exibidos no site.",
  },
  {
    href: "/admin/sobre",
    title: "Página Sobre",
    description: "Texto de apresentação, foto de perfil e mini-trajetória.",
  },
  {
    href: "/admin/trajetoria",
    title: "Página Trajetória",
    description: "Formação, linha do tempo profissional e clientes atendidos.",
  },
];

export default function AdminHomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content").then((res) => {
      if (res.status === 401) router.push("/admin/login");
      else setReady(true);
    });
  }, [router]);

  if (!ready) return <main className="p-8 text-sm text-neutral-500">Carregando...</main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <AdminNav />

      <header className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Painel do site</h1>
        <p className="text-sm text-neutral-500">Escolha o que você quer editar.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-neutral-200 p-5 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
          >
            <h2 className="text-sm font-semibold text-neutral-900">{card.title}</h2>
            <p className="mt-1 text-xs text-neutral-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
