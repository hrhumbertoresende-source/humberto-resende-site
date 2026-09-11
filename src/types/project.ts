export type ProjectSection = "arquitetura-interiores" | "cenografia-eventos" | "consultoria-criativa";

export interface Project {
  slug: string;
  title: string;
  category: string;
  section: ProjectSection;
  shape: "wide" | "tall" | "square";
  /** Local path to a project image, or omitted when no real photo is available yet. */
  image?: string;
  /** Additional gallery images for the project detail page. */
  gallery?: string[];
  /** Set on genuinely real (non-placeholder) entries, with whatever facts are known. */
  real?: boolean;
  location?: string;
  year?: string;
  /** Short blurb — used as the card-hover teaser and as a fallback if `paragraphs` is absent. */
  description?: string;
  /** "Frase de destaque" — the pull-quote headline on the case-study page. */
  tagline?: string;
  /** Ficha técnica: programa and área fields. */
  program?: string;
  area?: string;
  /** Full case-study body, one entry per paragraph. */
  paragraphs?: string[];
  /** Office / creative-direction credit line, shown in the ficha técnica. */
  credits?: string;
}
