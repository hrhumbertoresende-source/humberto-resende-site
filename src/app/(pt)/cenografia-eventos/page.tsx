import type { Metadata } from "next";
import { HomeCanvas } from "@/components/home-canvas";
import { getCenografiaEventosCanvas } from "@/lib/home-canvas";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Cenografia & Eventos" };

export default async function CenografiaEventosPage() {
  const canvasData = await getCenografiaEventosCanvas("pt");
  return (
    <div className="px-6 py-10 md:px-10">
      <HomeCanvas data={canvasData} revealOnHover emptyLabel="Nenhum projeto nesta categoria ainda." />
    </div>
  );
}
