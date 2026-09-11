import type { Metadata } from "next";
import { HomeCanvas } from "@/components/home-canvas";
import { getConsultoriaCriativaCanvas } from "@/lib/home-canvas";

export const metadata: Metadata = { title: "Consultoria Criativa" };

export default async function ConsultoriaCriativaPage() {
  const canvasData = await getConsultoriaCriativaCanvas("pt");
  return (
    <div className="px-6 py-10 md:px-10">
      <HomeCanvas data={canvasData} revealOnHover emptyLabel="Nenhum projeto nesta categoria ainda." />
    </div>
  );
}
