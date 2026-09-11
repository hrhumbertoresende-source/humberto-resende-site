export interface ThemeTokens {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
  };
  typography: {
    fontFamilyHeading: string;
    fontFamilyBody: string;
    baseFontSize: string;
  };
  spacing: {
    sectionPaddingY: string;
    sectionPaddingX: string;
    gap: string;
  };
}

export interface NavLink {
  label: string;
  href: string;
}

export interface ContactSection {
  type: "contact";
  id: string;
  heading: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: { platform: string; url: string }[];
  backgroundColor?: string;
  textColor?: string;
}

export interface FooterSection {
  type: "footer";
  id: string;
  copyright: string;
  links?: NavLink[];
  backgroundColor?: string;
  textColor?: string;
}

export type Section = ContactSection | FooterSection;

export interface SiteContent {
  siteName: string;
  nav: NavLink[];
  theme: ThemeTokens;
  sections: Section[];
  /** Shown as a dismissable-looking but persistent banner when content is a temporary placeholder. */
  placeholderNotice?: string;
}
