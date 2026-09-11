import type { Metadata } from "next";
import { getTrajetoriaContent } from "@/lib/trajetoria";
import { RichText } from "@/components/rich-text";

export const metadata: Metadata = {
  title: "Humberto Resende | Arquiteto, Cenógrafo e Consultor Criativo em São Paulo",
  description:
    "Conheça a trajetória de Humberto Resende, arquiteto especializado em arquitetura, cenografia e iluminação, com mais de 15 anos de experiência entre São Paulo e Mato Grosso.",
};

export default async function TrajetoriaPage() {
  const content = await getTrajetoriaContent("pt");

  return (
    <div className="px-6 py-16 md:px-16 md:py-24">
      <p
        className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        Trajetória
      </p>
      <h1
        className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-neutral-800 md:text-5xl"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        <RichText text={content.heroTitle} />
      </h1>

      <div className="mt-16 space-y-16">
        {content.sections.map((secao, i) => (
          <section key={i} className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,280px)_1fr] md:gap-16">
            <h2
              className="text-xl font-bold leading-snug text-neutral-800 md:text-2xl"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {secao.title}
            </h2>
            <div className="max-w-2xl space-y-4 text-base leading-relaxed text-neutral-500">
              {secao.paragraphs.map((p, j) => (
                <p key={j}>
                  <RichText text={p} />
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <hr className="my-20 border-t-[2.4px] border-neutral-400" />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,280px)_1fr] md:gap-16">
        <h2
          className="text-xl font-bold leading-snug text-neutral-800 md:text-2xl"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Formação e competências
        </h2>
        <div className="max-w-2xl space-y-8 text-base text-neutral-500">
          <ul className="space-y-2">
            {content.formacao.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-900">Ferramentas</p>
            <p className="mt-2">{content.ferramentas}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-900">
              Formação internacional em idiomas
            </p>
            <ul className="mt-2 space-y-2">
              {content.idiomas.map((idioma, i) => (
                <li key={i}>{idioma}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <hr className="my-20 border-t-[2.4px] border-neutral-400" />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,280px)_1fr] md:gap-16">
        <h2
          className="text-xl font-bold leading-snug text-neutral-800 md:text-2xl"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Linha do tempo
        </h2>
        <div className="max-w-2xl space-y-8 border-l border-neutral-200 pl-8">
          {content.linhaDoTempo.map((item, i) => (
            <div key={i}>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">{item.periodo}</p>
              <p className="mt-1 text-base font-semibold text-neutral-800">
                {item.cargo} — {item.local}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{item.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="my-20 border-t-[2.4px] border-neutral-400" />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,280px)_1fr] md:gap-16">
        <h2
          className="text-xl font-bold leading-snug text-neutral-800 md:text-2xl"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Clientes atendidos
        </h2>
        <ul className="flex max-w-2xl flex-wrap gap-x-6 gap-y-3">
          {content.clientes.map((cliente) => (
            <li key={cliente} className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {cliente}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
