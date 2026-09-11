import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import { getProjectGalleryCanvas } from "@/lib/project-gallery-canvas";
import { ProjectPhotoCanvas } from "@/components/project-photo-canvas";
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const projects = await getProjects("en");
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, "en");
  return { title: project?.title ?? "Project" };
}

// Generic filler paragraphs — only used to occupy the same visual space as the
// real description will, for projects that don't have real copy yet.
const PLACEHOLDER_PARAGRAPHS = [
  "[PENDING] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder text — to be replaced with the project's real description, written by Humberto Resende Arquiteto.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
  "Deserunt mollit anim id est laborum, perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore.",
];

export default async function ProjectPageEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, "en");
  if (!project) notFound();
  const galleryCanvas = await getProjectGalleryCanvas(slug, "en");

  const locationYear = project.real
    ? [project.location, project.year].filter(Boolean).join(", ")
    : "[PENDING] Location, Year.";

  return (
    <article>
      <hr className="border-t-[2.4px] border-neutral-400" />

      {/* Block A: title / category / location (left) + tagline (right) */}
      <div className="grid grid-cols-1 gap-10 px-6 pb-16 pt-24 md:grid-cols-2 md:px-16 md:pb-20 md:pt-40">
        <div>
          <h1
            className="text-4xl font-bold uppercase leading-none text-neutral-700 md:text-6xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {project.title}
          </h1>
          <p className="mt-6 text-lg text-neutral-500">{project.category}</p>
          <p className="mt-1 text-lg text-neutral-500">{locationYear}</p>
        </div>

        <p className="text-3xl font-semibold text-neutral-700 md:text-4xl" style={{ fontFamily: "var(--font-outfit)" }}>
          {project.real && project.tagline ? project.tagline : "[PENDING] Tagline."}
        </p>
      </div>

      <hr className="border-t-[2.4px] border-neutral-400" />

      {/* Block B: description text alone */}
      <div className="grid grid-cols-1 gap-10 px-6 py-16 md:grid-cols-2 md:px-16">
        <div />
        <div className="space-y-6 text-base leading-relaxed text-neutral-500">
          {project.real && project.paragraphs?.length ? (
            project.paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : project.real && project.description ? (
            <p>{project.description}</p>
          ) : (
            PLACEHOLDER_PARAGRAPHS.map((p, i) => <p key={i}>{p}</p>)
          )}
        </div>
      </div>

      <hr className="border-t-[2.4px] border-neutral-400" />

      {/* Photo gallery — irregular free-positioning canvas, same technique as
          the home/category pages, but with fixed (cropped) image boxes. */}
      {project.image && galleryCanvas ? (
        <div className="py-16">
          <ProjectPhotoCanvas data={galleryCanvas} />
          {!project.real && (
            <p className="px-6 pt-8 text-xs text-neutral-400 md:px-16">
              [PENDING] Layout reference photos — to be replaced with the project's real photos.
            </p>
          )}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center bg-neutral-100 text-sm text-neutral-400">
          [PENDING] Project photos
        </div>
      )}

      <hr className="border-t-[2.4px] border-neutral-400" />

      {/* Ficha técnica — same field pattern as a real case-study credits block,
          filled only with facts we actually know; the rest stays pending. */}
      <div className="px-6 py-16 md:px-16">
        <dl className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Location</dt>
            <dd className="mt-1.5 text-neutral-700">{project.location ?? "[PENDING]"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Year</dt>
            <dd className="mt-1.5 text-neutral-700">{project.year ?? "[PENDING]"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Program</dt>
            <dd className="mt-1.5 text-neutral-700">{project.program ?? "[PENDING]"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Area</dt>
            <dd className="mt-1.5 text-neutral-700">{project.area ?? "[PENDING]"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Design</dt>
            <dd className="mt-1.5 text-neutral-700">{project.credits ?? "Humberto Resende Arquiteto"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Photography</dt>
            <dd className="mt-1.5 text-neutral-700">[PENDING]</dd>
          </div>
        </dl>
      </div>

      <hr className="border-t-[2.4px] border-neutral-400" />
    </article>
  );
}
