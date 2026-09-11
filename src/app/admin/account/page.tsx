"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminAccountPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("A confirmação não é igual à nova senha.");
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao trocar a senha");

      // The server invalidated the session cookie — send them back to log in.
      router.push("/admin/login?senha-trocada=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao trocar a senha");
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <AdminNav />

      <header className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Trocar senha</h1>
        <p className="text-sm text-neutral-500">
          Depois de trocar, você será desconectado e vai precisar entrar de novo com a senha nova. Em
          casos raros isso pode levar alguns minutos para valer — se o login falhar logo em seguida,
          aguarde um pouco e tente de novo.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-neutral-200 p-5">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <label className="block space-y-1">
          <span className="text-xs font-medium text-neutral-500">Senha atual</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-neutral-500">Nova senha</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <span className="block text-[11px] text-neutral-400">Pelo menos 6 caracteres.</span>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-neutral-500">Confirmar nova senha</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </label>

        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {status === "saving" ? "Trocando..." : "Trocar senha"}
        </button>
      </form>
    </main>
  );
}
