import type { Metadata } from "next";
import { HomeCanvas } from "@/components/home-canvas";
import { getArquiteturaCanvas } from "@/lib/home-canvas";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Arquitetura & Interiores" };

export default async function ArquiteturaPage() {
  const canvasData = await getArquiteturaCanvas("pt");
  return (
    <div className="px-6 py-10 md:px-10">
      <HomeCanvas data={canvasData} revealOnHover emptyLabel="Nenhum projeto nesta categoria ainda." />
    </div>
  );
}
