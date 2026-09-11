import type { Project } from "@/types/project";
import type { CanvasItem, HomeCanvasData } from "@/types/home-canvas";
import type { GalleryCanvasItem, ProjectGalleryCanvasData } from "@/types/project-gallery-canvas";

/**
 * Shared layout logic for every free-positioning canvas on the site (home,
 * the 3 category pages, and each project's own photo gallery). Positions
 * are computed here, on demand, straight from the live project data — so
 * adding/editing/removing a project through the admin panel is immediately
 * reflected everywhere, with no separate "regenerate the layout" step.
 */

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function packDesktop(shapes: ("wide" | "tall" | "square")[]) {
  const UNIT_W = 328;
  const UNIT_H = 313;
  const GAP = 24;
  const colHeights = [0, 0, 0];
  const positions: Rect[] = [];

  for (const shape of shapes) {
    if (shape === "wide") {
      const pairs: [number, number][] = [[0, 1], [1, 2]];
      let best = pairs[0];
      let bestTop = Infinity;
      for (const [a, b] of pairs) {
        const top = Math.max(colHeights[a], colHeights[b]);
        if (top < bestTop) {
          bestTop = top;
          best = [a, b];
        }
      }
      const [a, b] = best;
      const top = bestTop;
      const rect = { top, left: a * (UNIT_W + GAP), width: UNIT_W * 2 + GAP, height: UNIT_H };
      positions.push(rect);
      colHeights[a] = top + UNIT_H + GAP;
      colHeights[b] = top + UNIT_H + GAP;
    } else if (shape === "tall") {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const top = colHeights[col];
      const height = UNIT_H * 2 + GAP;
      positions.push({ top, left: col * (UNIT_W + GAP), width: UNIT_W, height });
      colHeights[col] = top + height + GAP;
    } else {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const top = colHeights[col];
      positions.push({ top, left: col * (UNIT_W + GAP), width: UNIT_W, height: UNIT_H });
      colHeights[col] = top + UNIT_H + GAP;
    }
  }

  const canvasWidth = 3 * UNIT_W + 2 * GAP;
  const canvasHeight = positions.length ? Math.max(...colHeights) - GAP : 0;
  return { positions, canvasWidth, canvasHeight };
}

function packTablet(shapes: ("wide" | "tall" | "square")[]) {
  const UNIT_W = 440;
  const UNIT_H = 380;
  const GAP = 24;
  const colHeights = [0, 0];
  const positions: Rect[] = [];

  for (const shape of shapes) {
    const col = colHeights.indexOf(Math.min(...colHeights));
    const top = colHeights[col];
    const height = shape === "tall" ? UNIT_H * 2 + GAP : UNIT_H;
    positions.push({ top, left: col * (UNIT_W + GAP), width: UNIT_W, height });
    colHeights[col] = top + height + GAP;
  }

  const canvasWidth = 2 * UNIT_W + GAP;
  const canvasHeight = positions.length ? Math.max(...colHeights) - GAP : 0;
  return { positions, canvasWidth, canvasHeight };
}

function packMobile(count: number) {
  const HEIGHT = 300;
  const GAP = 20;
  const positions: Rect[] = [];
  let top = 0;
  for (let i = 0; i < count; i++) {
    positions.push({ top, left: 0, width: 0, height: HEIGHT });
    top += HEIGHT + GAP;
  }
  return { positions, canvasHeight: positions.length ? top - GAP : 0 };
}

function toPct(rect: Rect, canvasW: number, canvasH: number) {
  return {
    top: +((rect.top / canvasH) * 100).toFixed(3),
    left: +((rect.left / canvasW) * 100).toFixed(3),
    width: +((rect.width / canvasW) * 100).toFixed(3),
    height: +((rect.height / canvasH) * 100).toFixed(3),
    objectPosition: "center",
  };
}

/** Home / category page canvas — one tile per project, with title overlay. */
export function buildProjectCanvas(projects: Project[], basePath: string): HomeCanvasData {
  const shapes = projects.map((p) => p.shape);
  const desktop = packDesktop(shapes);
  const tablet = packTablet(shapes);
  const mobile = packMobile(projects.length);

  const items: CanvasItem[] = projects.map((p, i) => ({
    id: p.slug,
    href: `${basePath}/projetos/${p.slug}`,
    image: p.image ?? null,
    alternateImage: p.gallery?.[0] ?? null,
    alt: p.title,
    title: p.title,
    category: p.category,
    blurb: p.tagline ?? p.description ?? null,
    zIndex: i + 1,
    desktop: toPct(desktop.positions[i], desktop.canvasWidth, desktop.canvasHeight),
    tablet: toPct(tablet.positions[i], tablet.canvasWidth, tablet.canvasHeight),
    mobile: {
      top: mobile.positions[i].top,
      left: 0,
      width: "100%",
      height: mobile.positions[i].height,
      objectPosition: "center",
    },
  }));

  return {
    items,
    canvas: {
      desktop: { aspectRatio: desktop.canvasHeight ? +(desktop.canvasWidth / desktop.canvasHeight).toFixed(4) : 1 },
      tablet: { aspectRatio: tablet.canvasHeight ? +(tablet.canvasWidth / tablet.canvasHeight).toFixed(4) : 1 },
      mobile: { height: mobile.canvasHeight },
    },
  };
}

// Deterministic per-project shape rhythm for a single project's own photo
// set (index-based, independent of the site-wide `shape` curation above).
const PHOTO_CYCLE: ("wide" | "tall" | "square")[] = [
  "wide",
  "square",
  "tall",
  "square",
  "square",
  "wide",
  "square",
  "square",
  "tall",
  "wide",
  "square",
];

/** A single project's own photo gallery canvas — no titles/links, fixed crop boxes. */
export function buildPhotoCanvas(sources: string[], title: string): ProjectGalleryCanvasData {
  const shapes = sources.map((_, i) => PHOTO_CYCLE[i % PHOTO_CYCLE.length]);
  const desktop = packDesktop(shapes);
  const tablet = packTablet(shapes);
  const mobile = packMobile(sources.length);

  const items: GalleryCanvasItem[] = sources.map((src, i) => ({
    src,
    alt: i === 0 ? title : `${title} — ${i + 1}`,
    loading: i === 0 ? undefined : "lazy",
    desktop: {
      top: +((desktop.positions[i].top / desktop.canvasHeight) * 100).toFixed(3),
      left: +((desktop.positions[i].left / desktop.canvasWidth) * 100).toFixed(3),
      width: +((desktop.positions[i].width / desktop.canvasWidth) * 100).toFixed(3),
      height: +((desktop.positions[i].height / desktop.canvasHeight) * 100).toFixed(3),
    },
    tablet: {
      top: +((tablet.positions[i].top / tablet.canvasHeight) * 100).toFixed(3),
      left: +((tablet.positions[i].left / tablet.canvasWidth) * 100).toFixed(3),
      width: +((tablet.positions[i].width / tablet.canvasWidth) * 100).toFixed(3),
      height: +((tablet.positions[i].height / tablet.canvasHeight) * 100).toFixed(3),
    },
    mobile: { top: mobile.positions[i].top, left: 0, width: "100%", height: mobile.positions[i].height },
  }));

  return {
    items,
    canvas: {
      desktop: { aspectRatio: desktop.canvasHeight ? +(desktop.canvasWidth / desktop.canvasHeight).toFixed(4) : 1 },
      tablet: { aspectRatio: tablet.canvasHeight ? +(tablet.canvasWidth / tablet.canvasHeight).toFixed(4) : 1 },
      mobile: { height: mobile.canvasHeight },
    },
  };
}
