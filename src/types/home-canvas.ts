export interface CanvasPosition {
  /** Desktop/tablet: percentage of the canvas box. Mobile: top in px, width is "100%". */
  top: number;
  left: number;
  width: number | string;
  height: number;
  objectPosition: string;
}

export interface CanvasItem {
  id: string;
  href: string;
  image: string | null;
  alternateImage: string | null;
  alt: string;
  title: string;
  /** Only used when the canvas reveals text on hover (category pages). */
  category?: string;
  blurb?: string | null;
  zIndex: number;
  desktop: CanvasPosition;
  tablet: CanvasPosition;
  mobile: CanvasPosition;
}

export interface HomeCanvasData {
  items: CanvasItem[];
  canvas: {
    desktop: { aspectRatio: number };
    tablet: { aspectRatio: number };
    mobile: { height: number };
  };
}
