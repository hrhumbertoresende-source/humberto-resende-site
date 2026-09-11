import type { GalleryCanvasItem, GalleryCanvasPosition, ProjectGalleryCanvasData } from "@/types/project-gallery-canvas";

/**
 * Irregular free-positioning canvas for a project's own photo set — same
 * technique as the home/category canvases (position: relative container,
 * absolutely positioned tiles, one pre-computed coordinate set per
 * breakpoint), but with fixed-size boxes (object-cover) instead of the
 * photos' natural aspect ratio.
 */

function toCss(value: number | string, unit: "percent" | "px") {
  if (typeof value === "string") return value;
  return unit === "percent" ? `${value}%` : `${value}px`;
}

function PhotoTile({ item, position, unit }: { item: GalleryCanvasItem; position: GalleryCanvasPosition; unit: "percent" | "px" }) {
  return (
    <div
      className="absolute overflow-hidden bg-neutral-100"
      style={{
        top: toCss(position.top, unit),
        left: toCss(position.left, unit),
        width: toCss(position.width, unit),
        height: toCss(position.height, unit),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.src} alt={item.alt} loading={item.loading} className="h-full w-full object-cover" />
    </div>
  );
}

export function ProjectPhotoCanvas({ data }: { data: ProjectGalleryCanvasData }) {
  const { items, canvas } = data;
  if (items.length === 0) return null;

  return (
    <>
      <div className="relative hidden w-full lg:block" style={{ aspectRatio: canvas.desktop.aspectRatio }}>
        {items.map((item, i) => (
          <PhotoTile key={i} item={item} position={item.desktop} unit="percent" />
        ))}
      </div>

      <div className="relative hidden w-full sm:block lg:hidden" style={{ aspectRatio: canvas.tablet.aspectRatio }}>
        {items.map((item, i) => (
          <PhotoTile key={i} item={item} position={item.tablet} unit="percent" />
        ))}
      </div>

      <div className="relative block w-full sm:hidden" style={{ height: canvas.mobile.height }}>
        {items.map((item, i) => (
          <PhotoTile key={i} item={item} position={item.mobile} unit="px" />
        ))}
      </div>
    </>
  );
}
