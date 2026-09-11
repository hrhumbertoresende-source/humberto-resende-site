import type { Metadata } from "next";
import { HomeCanvas } from "@/components/home-canvas";
import { getCenografiaEventosCanvas } from "@/lib/home-canvas";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Scenography & Events" };

export default async function CenografiaEventosPageEn() {
  const canvasData = await getCenografiaEventosCanvas("en");
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
