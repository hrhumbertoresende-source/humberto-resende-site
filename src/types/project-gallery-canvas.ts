export interface GalleryCanvasPosition {
  top: number;
  left: number;
  width: number | string;
  height: number;
}

export interface GalleryCanvasItem {
  src: string;
  alt: string;
  loading?: "lazy";
  desktop: GalleryCanvasPosition;
  tablet: GalleryCanvasPosition;
  mobile: GalleryCanvasPosition;
}

export interface ProjectGalleryCanvasData {
  items: GalleryCanvasItem[];
  canvas: {
    desktop: { aspectRatio: number };
    tablet: { aspectRatio: number };
    mobile: { height: number };
  };
}
