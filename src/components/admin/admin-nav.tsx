"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/site", label: "Site" },
  { href: "/admin/projects", label: "Projetos" },
  { href: "/admin/sobre", label: "Sobre" },
  { href: "/admin/trajetoria", label: "Trajetória" },
  { href: "/admin/account", label: "Conta" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div className="mb-8 flex items-center justify-between overflow-x-auto border-b border-neutral-200 pb-4">
      <nav className="flex gap-6 text-sm font-medium">
        {TABS.map((tab) => {
          const active = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`whitespace-nowrap ${active ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <button type="button" onClick={handleLogout} className="ml-4 flex-shrink-0 text-sm text-neutral-400 hover:text-neutral-600">
        Sair
      </button>
    </div>
  );
}
