import { HomeCanvas } from "@/components/home-canvas";
import { getHomeCanvas } from "@/lib/home-canvas";

export default async function Home() {
  const canvasData = await getHomeCanvas("pt");
  return (
    <div className="px-6 py-10 md:px-10">
      <HomeCanvas data={canvasData} comingSoonLabel="Em breve" />
    </div>
  );
}
