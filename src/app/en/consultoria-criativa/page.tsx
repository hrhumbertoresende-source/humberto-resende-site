import type { Metadata } from "next";
import { HomeCanvas } from "@/components/home-canvas";
import { getConsultoriaCriativaCanvas } from "@/lib/home-canvas";

export const metadata: Metadata = { title: "Creative Consulting" };

export default async function ConsultoriaCriativaPageEn() {
  const canvasData = await getConsultoriaCriativaCanvas("en");
  return (
    <div className="px-6 py-10 md:px-10">
      <HomeCanvas
        data={canvasData}
        comingSoonLabel="Coming soon"
        revealOnHover
        pendingBlurb="[PENDING] Short project description."
        emptyLabel="No projects in this category yet."
      />
    </div>
  );
}
