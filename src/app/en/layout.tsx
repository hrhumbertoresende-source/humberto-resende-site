import { getSiteContent } from "@/lib/site-content";
import { getProjects } from "@/lib/projects";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { ContactSection, FooterSection } from "@/types/site-content";

export default async function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent("en");
  const projects = await getProjects("en");
  const { colors } = content.theme;

  const contactSection = content.sections.find((s) => s.type === "contact") as
    | ContactSection
    | undefined;
  const footerSection = content.sections.find((s) => s.type === "footer") as
    | FooterSection
    | undefined;

  const primaryNav = content.nav.filter((l) => l.label.toUpperCase() !== "ABOUT");
  const sobreLink = content.nav.find((l) => l.label.toUpperCase() === "ABOUT");

  return (
    <div className="flex min-h-full flex-1 flex-col" style={{ backgroundColor: colors.background, color: colors.foreground }}>
      <SiteHeader
        siteName={content.siteName}
        primaryNav={primaryNav}
        sobreLink={sobreLink}
        primaryColor={colors.primary}
        secondaryColor={colors.secondary}
        locale="en"
        basePath="/en"
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
        basePath="/en"
      />
    </div>
  );
}
