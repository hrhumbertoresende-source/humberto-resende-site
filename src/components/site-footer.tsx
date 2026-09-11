import type { ContactSection, FooterSection, ThemeTokens } from "@/types/site-content";
import type { Project } from "@/types/project";
import { SiteLogo } from "@/components/site-logo";

export function SiteFooter({
  siteName,
  contactSection,
  footerSection,
  colors,
  projects,
  basePath = "",
}: {
  siteName: string;
  contactSection?: ContactSection;
  footerSection?: FooterSection;
  colors: ThemeTokens["colors"];
  projects: Project[];
  basePath?: string;
}) {
  const categories = Array.from(new Set(projects.map((p) => p.category)));

  return (
    <footer className="mt-auto border-t px-6 py-10 md:px-10" style={{ borderColor: colors.border }}>
      {categories.length > 0 && (
        <div
          className="hidden gap-8 border-b pb-8 md:grid md:grid-cols-6"
          style={{ borderColor: colors.border }}
        >
          {categories.map((cat) => (
            <div key={cat} className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#6a6a6a" }}>
                {cat}
              </p>
              <ul className="space-y-1.5">
                {projects
                  .filter((p) => p.category === cat)
                  .map((p) => (
                    <li key={p.slug} className="text-xs">
                      <a
                        href={`${basePath}/projetos/${p.slug}`}
                        className="text-(--footer-c) hover:text-[#383838]"
                        style={{ "--footer-c": colors.secondary } as React.CSSProperties}
                      >
                        {p.title}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-start justify-between gap-8">
        <SiteLogo siteName={siteName} color={colors.primary} />

        {contactSection?.socialLinks && contactSection.socialLinks.length > 0 && (
          <ul className="space-y-1.5">
            {contactSection.socialLinks.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  className="text-(--footer-c) text-xs hover:text-[#383838]"
                  style={{ "--footer-c": colors.secondary } as React.CSSProperties}
                >
                  {s.platform}
                </a>
              </li>
            ))}
          </ul>
        )}

        {contactSection && (
          <div className="space-y-1.5 text-xs" style={{ color: colors.secondary }}>
            <p>{siteName}</p>
            {contactSection.email && <p>{contactSection.email}</p>}
            {contactSection.phone && <p>{contactSection.phone}</p>}
            {contactSection.address && <p>{contactSection.address}</p>}
          </div>
        )}
      </div>

      {footerSection && (
        <p className="mt-10 text-xs" style={{ color: colors.secondary }}>
          {footerSection.copyright}
        </p>
      )}
    </footer>
  );
}
