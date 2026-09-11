import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import { getProjectGalleryCanvas } from "@/lib/project-gallery-canvas";
import { ProjectPhotoCanvas } from "@/components/project-photo-canvas";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return { title: project?.title ?? "Projeto" };
}

// Generic filler paragraphs — only used to occupy the same visual space as the
// real description will, for projects that don't have real copy yet. Plain
// public-domain placeholder text (not anyone's actual content).
const PLACEHOLDER_PARAGRAPHS = [
  "[PENDENTE] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Texto de preenchimento — substituir pela descrição real do projeto, escrita pelo Humberto Resende Arquiteto.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
  "Deserunt mollit anim id est laborum, perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore.",
];

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const galleryCanvas = await getProjectGalleryCanvas(slug, "pt");

  const locationYear = project.real
    ? [project.location, project.year].filter(Boolean).join(", ")
    : "[PENDENTE] Local, Ano.";

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
          {project.real && project.tagline ? project.tagline : "[PENDENTE] Frase de efeito."}
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
              [PENDENTE] Fotos de referência de layout — substituir por fotos reais do projeto.
            </p>
          )}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center bg-neutral-100 text-sm text-neutral-400">
          [PENDENTE] Fotos do projeto
        </div>
      )}

      <hr className="border-t-[2.4px] border-neutral-400" />

      {/* Ficha técnica — same field pattern as a real case-study credits block,
          filled only with facts we actually know; the rest stays pending. */}
      <div className="px-6 py-16 md:px-16">
        <dl className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Local</dt>
            <dd className="mt-1.5 text-neutral-700">{project.location ?? "[PENDENTE]"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Ano</dt>
            <dd className="mt-1.5 text-neutral-700">{project.year ?? "[PENDENTE]"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Programa</dt>
            <dd className="mt-1.5 text-neutral-700">{project.program ?? "[PENDENTE]"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Área</dt>
            <dd className="mt-1.5 text-neutral-700">{project.area ?? "[PENDENTE]"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Concepção</dt>
            <dd className="mt-1.5 text-neutral-700">{project.credits ?? "Humberto Resende Arquiteto"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">Fotografia</dt>
            <dd className="mt-1.5 text-neutral-700">[PENDENTE]</dd>
          </div>
        </dl>
      </div>

      <hr className="border-t-[2.4px] border-neutral-400" />
    </article>
  );
}
