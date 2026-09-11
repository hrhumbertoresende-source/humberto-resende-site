import { getSiteContent } from "@/lib/site-content";
import { getProjects } from "@/lib/projects";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { ContactSection, FooterSection } from "@/types/site-content";

export default async function PtLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent("pt");
  const projects = await getProjects("pt");
  const { colors } = content.theme;

  const contactSection = content.sections.find((s) => s.type === "contact") as
    | ContactSection
    | undefined;
  const footerSection = content.sections.find((s) => s.type === "footer") as
    | FooterSection
    | undefined;

  const primaryNav = content.nav.filter((l) => l.label.toUpperCase() !== "SOBRE");
  const sobreLink = content.nav.find((l) => l.label.toUpperCase() === "SOBRE");

  return (
    <div className="flex min-h-full flex-1 flex-col" style={{ backgroundColor: colors.background, color: colors.foreground }}>
      {content.placeholderNotice && (
        <div className="bg-neutral-900 px-4 py-1.5 text-center text-[8.8px] text-neutral-300 md:text-[11px]">
          {content.placeholderNotice}
        </div>
      )}

      <SiteHeader
        siteName={content.siteName}
        primaryNav={primaryNav}
        sobreLink={sobreLink}
        primaryColor={colors.primary}
        secondaryColor={colors.secondary}
        locale="pt"
        basePath=""
        contactEmail={contactSection?.email}
        contactPhone={contactSection?.phone}
      />

      <main className="flex flex-1 flex-col">{children}</main>

      <SiteFooter
        siteName={content.siteName}
        contactSection={contactSection}
        footerSection={footerSection}
        colors={colors}
        projects={projects}
        basePath=""
      />
    </div>
  );
}
