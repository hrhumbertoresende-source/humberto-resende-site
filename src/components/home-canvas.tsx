import Link from "next/link";
import type { CanvasItem, CanvasPosition, HomeCanvasData } from "@/types/home-canvas";

/**
 * Free-positioning editorial canvas — mirrors the reference site's own
 * technique (absolutely positioned elements on a `position: relative`
 * canvas, one independent coordinate set per breakpoint) instead of a
 * CSS Grid / masonry auto-placement system. Each breakpoint's canvas is
 * pre-computed (see content/canvas-*.json) and simply shown/hidden via
 * CSS — nothing is rearranged at runtime. Desktop/tablet positions are
 * percentages of the canvas box (which is locked to the original design's
 * aspect ratio via `aspect-ratio`), so the whole composition scales up to
 * fill the available width while keeping every item's relative position,
 * size, and internal rhythm identical.
 */

function toCss(value: number | string, unit: "percent" | "px") {
  if (typeof value === "string") return value;
  return unit === "percent" ? `${value}%` : `${value}px`;
}

function CanvasTile({
  item,
  position,
  unit,
  comingSoonLabel,
  revealOnHover,
  pendingBlurb,
}: {
  item: CanvasItem;
  position: CanvasPosition;
  unit: "percent" | "px";
  comingSoonLabel: string;
  revealOnHover: boolean;
  pendingBlurb: string;
}) {
  const style = {
    top: toCss(position.top, unit),
    left: toCss(position.left, unit),
    width: toCss(position.width, unit),
    height: toCss(position.height, unit),
    zIndex: item.zIndex,
  };

  if (!item.image) {
    return (
      <Link
        href={item.href}
        className="absolute overflow-hidden bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        style={style}
      >
        <div className="flex h-full flex-col items-start justify-end p-4">
          <span className="absolute right-4 top-4 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
            {comingSoonLabel}
          </span>
          <p
            className="text-lg font-bold uppercase leading-tight text-neutral-800"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {item.title}
          </p>
        </div>
      </Link>
    );
  }

  if (revealOnHover) {
    return (
      <Link
        href={item.href}
        className="group absolute block overflow-hidden bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        style={style}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position.objectPosition }}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/70 opacity-0 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6 opacity-0 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <p
            className="text-xl font-bold uppercase leading-tight text-white md:text-2xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {item.title}
          </p>
          {item.category && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/70">{item.category}</p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-white/80">{item.blurb ?? pendingBlurb}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className="group absolute block overflow-hidden bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
      style={style}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt={item.alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position.objectPosition }}
      />
      {item.alternateImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.alternateImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-0 motion-safe:transition-opacity motion-safe:duration-500 group-hover:opacity-100"
          style={{ objectPosition: position.objectPosition }}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
      <p
        className="pointer-events-none absolute bottom-4 left-4 right-4 text-lg font-bold uppercase leading-tight text-white drop-shadow"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {item.title}
      </p>
    </Link>
  );
}

export function HomeCanvas({
  data,
  comingSoonLabel = "Em breve",
  revealOnHover = false,
  pendingBlurb = "[PENDENTE] Descrição breve do projeto.",
  emptyLabel,
}: {
  data: HomeCanvasData;
  comingSoonLabel?: string;
  /** Category-page mode: title/category/description are hidden until hover/focus. */
  revealOnHover?: boolean;
  pendingBlurb?: string;
  emptyLabel?: string;
}) {
  const { items, canvas } = data;

  if (items.length === 0) {
    return (
      <p className="px-6 py-16 text-center text-sm text-neutral-400 md:px-10">
        {emptyLabel ?? "Nenhum projeto nesta categoria ainda."}
      </p>
    );
  }

  return (
    <>
      <div className="relative hidden w-full lg:block" style={{ aspectRatio: canvas.desktop.aspectRatio }}>
        {items.map((item) => (
          <CanvasTile
            key={item.id}
            item={item}
            position={item.desktop}
            unit="percent"
            comingSoonLabel={comingSoonLabel}
            revealOnHover={revealOnHover}
            pendingBlurb={pendingBlurb}
          />
        ))}
      </div>

      <div className="relative hidden w-full sm:block lg:hidden" style={{ aspectRatio: canvas.tablet.aspectRatio }}>
        {items.map((item) => (
          <CanvasTile
            key={item.id}
            item={item}
            position={item.tablet}
            unit="percent"
            comingSoonLabel={comingSoonLabel}
            revealOnHover={revealOnHover}
            pendingBlurb={pendingBlurb}
          />
        ))}
      </div>

      <div className="relative block w-full sm:hidden" style={{ height: canvas.mobile.height }}>
        {items.map((item) => (
          <CanvasTile
            key={item.id}
            item={item}
            position={item.mobile}
            unit="px"
            comingSoonLabel={comingSoonLabel}
            // Touch devices have no hover state, so mobile always shows the
            // plain title overlay regardless of the desktop/tablet mode.
            revealOnHover={false}
            pendingBlurb={pendingBlurb}
          />
        ))}
      </div>
    </>
  );
}
