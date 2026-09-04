import type { Resume } from "@/lib/schema";
import { itemHasContent, SECTIONS } from "@/lib/sections";

export type TemplateProps = {
  resume: Resume;
  accent: string;
  /** PDF-only header overrides — see `Doc.sectionTitles` for why these live
   * outside the résumé data itself. */
  sectionTitles?: Record<string, string>;
};

/**
 * Every printed section header, in the app's own words. Derived from
 * `SECTIONS` (the form's own titles) rather than duplicated, so the "PDF
 * header" field's placeholder and the unedited PDF always agree.
 */
export const DEFAULT_SECTION_TITLES: Record<string, string> = {
  profile: "Profile",
  ...Object.fromEntries(SECTIONS.map((section) => [section.id, section.title])),
};

/** Resolve a section's printed title: the user's override, or the default. */
export function sectionTitle(id: string, overrides?: Record<string, string>): string {
  return overrides?.[id]?.trim() || DEFAULT_SECTION_TITLES[id] || id;
}

/** Drop items the user started but never filled in, so paper stays clean. */
export function filled<T>(items: T[]): T[] {
  return items.filter((item) => itemHasContent(item as never));
}

export const has = (value?: string) => Boolean(value && value.trim());

/**
 * Standard PDF fonts need no registration and no network, which keeps export
 * working offline. Every template picks a family from here.
 */
export const FONTS = {
  serif: "Times-Roman",
  serifBold: "Times-Bold",
  serifItalic: "Times-Italic",
  sans: "Helvetica",
  sansBold: "Helvetica-Bold",
  sansItalic: "Helvetica-Oblique",
  mono: "Courier",
  monoBold: "Courier-Bold",
} as const;

/** Contact details as one flat list, in the order a reader scans them. */
export function contactParts(resume: Resume): string[] {
  const { basics } = resume;
  const location = [basics.location.city, basics.location.region, basics.location.countryCode]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(", ");
  return [basics.email, basics.phone, location].map((p) => p.trim()).filter(Boolean);
}
