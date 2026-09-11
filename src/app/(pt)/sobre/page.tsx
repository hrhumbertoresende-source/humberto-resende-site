import type { Metadata } from "next";
import Image from "next/image";
import { getSobreContent } from "@/lib/sobre";
import { getSiteContent } from "@/lib/site-content";
import { RichText } from "@/components/rich-text";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sobre Humberto Resende | Arquitetura, Cenografia e Consultoria Criativa",
  description:
    "Arquiteto e cenógrafo à frente do Estúdio Dorama, Humberto Resende já assinou projetos para marcas como Coca-Cola, Google, Netflix, Adidas e Chanel.",
};

export default async function SobrePage() {
  const [content, site] = await Promise.all([getSobreContent("pt"), getSiteContent("pt")]);
  const contact = site.sections.find((s): s is Extract<typeof s, { type: "contact" }> => s.type === "contact");
  const [col1, col2, col3] = content.bioColumns;

  return (
    <div className="px-6 py-10 md:px-10">
      <div
        className="flex w-full justify-between text-sm font-semibold text-neutral-900 sm:text-base md:text-lg"
        style={{ fontFamily: "var(--font-outfit)" }}
        aria-label={content.tagline}
      >
        {content.tagline.split("").map((ch, i) => (
          <span key={i} aria-hidden="true">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 items-stretch gap-x-12 gap-y-16 text-base font-medium leading-loose text-neutral-600 md:gap-y-8 md:text-sm md:leading-relaxed md:grid-cols-3">
        <div className="flex flex-col justify-center space-y-10 md:space-y-6">
          {col1?.paragraphs.map((p, i) => (
            <p key={i}>
              <RichText text={p} strongClassName="font-black text-neutral-800" />
            </p>
          ))}
        </div>

        <div className="flex flex-col justify-between space-y-10 md:space-y-6">
          {col2?.paragraphs[0] && (
            <p>
              <RichText text={col2.paragraphs[0]} strongClassName="font-black text-neutral-800" />
            </p>
          )}
          <div className="relative mx-auto bg-neutral-100" style={{ width: 371, height: 479 }}>
            <Image src={content.profileImage} alt="Humberto Resende" fill sizes="371px" className="object-cover" />
          </div>
          {col2?.paragraphs[1] && (
            <p>
              <RichText text={col2.paragraphs[1]} strongClassName="font-black text-neutral-800" />
            </p>
          )}
        </div>

        <div className="flex flex-col justify-end space-y-10 md:space-y-6">
          {col3?.paragraphs.map((p, i) => (
            <p key={i}>
              <RichText text={p} strongClassName="font-black text-neutral-800" />
            </p>
          ))}
        </div>
      </div>

      <div className="mt-24">
        <h2
          className="text-2xl font-medium uppercase tracking-[0.15em] text-neutral-400"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Trajetória
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
          {content.timelineColumns.map((col, i) => (
            <div key={i} className="space-y-8">
              {col.map((entry) => (
                <div key={entry.year}>
                  <p className="text-3xl font-medium text-neutral-400">{entry.year}</p>
                  <ul className="mt-2 space-y-1.5">
                    {entry.items.map((item, j) => (
                      <li key={j} className="text-sm font-semibold text-neutral-800">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {contact && (
        <div className="mt-24">
          <h2
            className="text-2xl font-medium uppercase tracking-[0.15em] text-neutral-400"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Contato
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-[1fr_1.5fr]">
            <div className="space-y-4 text-sm text-neutral-600">
              {contact.address && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-900">Endereço</p>
                  <p className="mt-1">{contact.address}</p>
                </div>
              )}
              {contact.email && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-900">E-mail</p>
                  <p className="mt-1">{contact.email}</p>
                </div>
              )}
              {contact.phone && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-900">Telefone</p>
                  <p className="mt-1">{contact.phone}</p>
                </div>
              )}
            </div>

            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Nome"
                className="border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
              />
              <input
                type="email"
                placeholder="E-mail"
                className="border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
              />
              <textarea
                placeholder="Mensagem"
                rows={4}
                className="border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 sm:col-span-2"
              />
              <button
                type="button"
                className="bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 sm:col-span-2 sm:w-fit"
              >
                Enviar mensagem
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
