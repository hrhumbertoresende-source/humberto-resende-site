import type { Metadata } from "next";
import { HomeCanvas } from "@/components/home-canvas";
import { getHomeCanvas } from "@/lib/home-canvas";

export const metadata: Metadata = {
  title: "Humberto Resende Arquiteto",
  description: "Architecture studio",
};

export default async function HomeEn() {
  const canvasData = await getHomeCanvas("en");
  return (
    <div className="px-6 py-10 md:px-10">
      <HomeCanvas data={canvasData} comingSoonLabel="Coming soon" />
    </div>
  );
}
