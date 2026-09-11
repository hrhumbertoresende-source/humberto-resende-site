"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/types/site-content";
import { SiteLogo } from "@/components/site-logo";

const STRINGS = {
  pt: { home: "Home", menu: "Menu", close: "Fechar", openMenu: "Abrir menu" },
  en: { home: "Home", menu: "Menu", close: "Close", openMenu: "Open menu" },
} as const;

export function SiteHeader({
  siteName,
  primaryNav,
  sobreLink,
  primaryColor,
  secondaryColor,
  locale = "pt",
  basePath = "",
  contactEmail = "hr.humbertoresende@gmail.com",
  contactPhone = "011 96199-7117",
}: {
  siteName: string;
  primaryNav: NavLink[];
  sobreLink?: NavLink;
  primaryColor: string;
  secondaryColor: string;
  locale?: "pt" | "en";
  basePath?: string;
  contactEmail?: string;
  contactPhone?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = STRINGS[locale];

  const withBase = (href: string) => `${basePath}${href}`;
  const homeHref = basePath || "/";
  const allLinks = sobreLink
    ? [{ href: homeHref, label: t.home }, ...primaryNav.map((l) => ({ ...l, href: withBase(l.href) })), { ...sobreLink, href: withBase(sobreLink.href) }]
    : primaryNav.map((l) => ({ ...l, href: withBase(l.href) }));

  const otherLocaleHref =
    locale === "en"
      ? pathname.replace(/^\/en/, "") || "/"
      : `/en${pathname === "/" ? "" : pathname}`;

  return (
    <header className="relative px-6 py-8 md:px-10 md:py-10">
      <div className="flex items-center justify-between gap-4">
        <a href={homeHref} aria-label={t.home}>
          <SiteLogo siteName={siteName} color={primaryColor} />
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-12 text-[14px] font-medium uppercase tracking-normal md:flex">
          {primaryNav.map((link) => (
            <a
              key={link.href + link.label}
              href={withBase(link.href)}
              className="text-(--nav-c) hover:text-[#191919]"
              style={{ "--nav-c": secondaryColor } as React.CSSProperties}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {sobreLink && (
            <a
              href={withBase(sobreLink.href)}
              className="text-(--nav-c) text-[14px] font-medium uppercase tracking-normal hover:text-[#191919]"
              style={{ "--nav-c": secondaryColor } as React.CSSProperties}
            >
              {sobreLink.label}
            </a>
          )}
          <a
            href={otherLocaleHref}
            className="text-(--nav-c) text-[13px] font-medium uppercase tracking-normal hover:text-[#191919]"
            style={{ "--nav-c": secondaryColor } as React.CSSProperties}
          >
            {locale === "en" ? "PT" : "EN"}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="fixed right-6 top-6 z-50 text-[10.4px] font-medium uppercase tracking-wide md:hidden"
          style={{ color: open ? "#191919" : secondaryColor }}
          aria-expanded={open}
          aria-label={t.openMenu}
        >
          {open ? t.close : t.menu}
        </button>
      </div>

      {open && (
        <nav className="fixed inset-0 z-40 flex flex-col justify-between bg-white px-6 py-24 md:hidden">
          <div className="flex flex-col items-end gap-4 text-right text-2xl font-medium uppercase tracking-wide">
            {allLinks.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-neutral-800 hover:text-neutral-400"
              >
                {link.label}
              </a>
            ))}
            <a
              href={otherLocaleHref}
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              {locale === "en" ? "PT" : "EN"}
            </a>
          </div>

          <div className="flex flex-col items-end gap-1 text-right text-xs text-neutral-400">
            <span>{contactEmail}</span>
            <span>{contactPhone}</span>
          </div>
        </nav>
      )}
    </header>
  );
}
