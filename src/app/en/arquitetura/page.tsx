import type { Metadata } from "next";
import { HomeCanvas } from "@/components/home-canvas";
import { getArquiteturaCanvas } from "@/lib/home-canvas";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Architecture & Interiors" };

export default async function ArquiteturaPageEn() {
  const canvasData = await getArquiteturaCanvas("en");
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
