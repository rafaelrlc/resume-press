import type { ArraySectionId, ResumeItem } from "./schema";

/**
 * The form is generated from this table rather than hand-written per section,
 * so adding a JSON Resume field means adding one row here.
 */

export type FieldKind =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "date"
  | "textarea"
  | "bullets"
  | "tags";

export type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  /** 1 = half width, 2 = full width. Full width by default for long text. */
  span?: 1 | 2;
  hint?: string;
};

export type SectionDef = {
  id: ArraySectionId;
  title: string;
  /** Singular noun for the "add" control and item headers. */
  itemLabel: string;
  /** Field whose value titles a collapsed item. */
  headKey: string;
  /** Field shown beneath the title of a collapsed item. */
  subKey?: string;
  fields: FieldDef[];
};

export const BASICS_FIELDS: FieldDef[] = [
  { key: "name", label: "Full name", kind: "text", span: 1, placeholder: "Ada Lovelace" },
  { key: "label", label: "Headline", kind: "text", span: 1, placeholder: "Systems engineer" },
  { key: "email", label: "Email", kind: "email", span: 1, placeholder: "ada@example.com" },
  { key: "phone", label: "Phone", kind: "tel", span: 1, placeholder: "+55 11 90000-0000" },
  { key: "url", label: "Website", kind: "url", span: 2, placeholder: "https://ada.dev" },
  {
    key: "summary",
    label: "Summary",
    kind: "textarea",
    span: 2,
    placeholder: "Two or three lines on what you do and what you are looking for.",
  },
];

export const LOCATION_FIELDS: FieldDef[] = [
  { key: "city", label: "City", kind: "text", span: 1 },
  { key: "region", label: "Region", kind: "text", span: 1 },
  { key: "countryCode", label: "Country code", kind: "text", span: 1, placeholder: "BR" },
  { key: "postalCode", label: "Postal code", kind: "text", span: 1 },
  { key: "address", label: "Address", kind: "text", span: 2 },
];

export const PROFILE_FIELDS: FieldDef[] = [
  { key: "network", label: "Network", kind: "text", span: 1, placeholder: "GitHub" },
  { key: "username", label: "Username", kind: "text", span: 1, placeholder: "adalovelace" },
  { key: "url", label: "URL", kind: "url", span: 2, placeholder: "https://github.com/adalovelace" },
];

export const SECTIONS: SectionDef[] = [
  {
    id: "work",
    title: "Experience",
    itemLabel: "Position",
    headKey: "position",
    subKey: "name",
    fields: [
      { key: "position", label: "Position", kind: "text", span: 1, placeholder: "Staff engineer" },
      { key: "name", label: "Company", kind: "text", span: 1, placeholder: "Analytical Engines" },
      { key: "location", label: "Location", kind: "text", span: 1 },
      { key: "url", label: "Company website", kind: "url", span: 1 },
      { key: "startDate", label: "Start", kind: "date", span: 1 },
      { key: "endDate", label: "End", kind: "date", span: 1, hint: "Leave blank for Present" },
      { key: "summary", label: "Summary", kind: "textarea", span: 2 },
      { key: "highlights", label: "Highlights", kind: "bullets", span: 2 },
    ],
  },
  {
    id: "education",
    title: "Education",
    itemLabel: "Degree",
    headKey: "institution",
    subKey: "area",
    fields: [
      { key: "institution", label: "Institution", kind: "text", span: 2 },
      { key: "studyType", label: "Degree", kind: "text", span: 1, placeholder: "BSc" },
      { key: "area", label: "Field of study", kind: "text", span: 1, placeholder: "Mathematics" },
      { key: "startDate", label: "Start", kind: "date", span: 1 },
      { key: "endDate", label: "End", kind: "date", span: 1 },
      { key: "score", label: "Score", kind: "text", span: 1, placeholder: "3.9 GPA" },
      { key: "url", label: "Website", kind: "url", span: 1 },
      { key: "courses", label: "Courses", kind: "tags", span: 2 },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    itemLabel: "Project",
    headKey: "name",
    subKey: "description",
    fields: [
      { key: "name", label: "Name", kind: "text", span: 1 },
      { key: "url", label: "URL", kind: "url", span: 1 },
      { key: "description", label: "Description", kind: "textarea", span: 2 },
      { key: "startDate", label: "Start", kind: "date", span: 1 },
      { key: "endDate", label: "End", kind: "date", span: 1 },
      { key: "entity", label: "Entity", kind: "text", span: 1 },
      { key: "type", label: "Type", kind: "text", span: 1, placeholder: "application" },
      { key: "roles", label: "Roles", kind: "tags", span: 2 },
      { key: "keywords", label: "Keywords", kind: "tags", span: 2 },
      { key: "highlights", label: "Highlights", kind: "bullets", span: 2 },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    itemLabel: "Skill group",
    headKey: "name",
    subKey: "level",
    fields: [
      { key: "name", label: "Group", kind: "text", span: 1, placeholder: "Languages" },
      { key: "level", label: "Level", kind: "text", span: 1, placeholder: "Advanced" },
      { key: "keywords", label: "Keywords", kind: "tags", span: 2, placeholder: "TypeScript, Go, Rust" },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    itemLabel: "Language",
    headKey: "language",
    subKey: "fluency",
    fields: [
      { key: "language", label: "Language", kind: "text", span: 1, placeholder: "Portuguese" },
      { key: "fluency", label: "Fluency", kind: "text", span: 1, placeholder: "Native speaker" },
    ],
  },
  {
    id: "awards",
    title: "Awards",
    itemLabel: "Award",
    headKey: "title",
    subKey: "awarder",
    fields: [
      { key: "title", label: "Title", kind: "text", span: 1 },
      { key: "awarder", label: "Awarder", kind: "text", span: 1 },
      { key: "date", label: "Date", kind: "date", span: 1 },
      { key: "summary", label: "Summary", kind: "textarea", span: 2 },
    ],
  },
  {
    id: "certificates",
    title: "Certificates",
    itemLabel: "Certificate",
    headKey: "name",
    subKey: "issuer",
    fields: [
      { key: "name", label: "Name", kind: "text", span: 1 },
      { key: "issuer", label: "Issuer", kind: "text", span: 1 },
      { key: "date", label: "Date", kind: "date", span: 1 },
      { key: "url", label: "URL", kind: "url", span: 1 },
    ],
  },
  {
    id: "publications",
    title: "Publications",
    itemLabel: "Publication",
    headKey: "name",
    subKey: "publisher",
    fields: [
      { key: "name", label: "Name", kind: "text", span: 1 },
      { key: "publisher", label: "Publisher", kind: "text", span: 1 },
      { key: "releaseDate", label: "Released", kind: "date", span: 1 },
      { key: "url", label: "URL", kind: "url", span: 1 },
      { key: "summary", label: "Summary", kind: "textarea", span: 2 },
    ],
  },
  {
    id: "volunteer",
    title: "Volunteering",
    itemLabel: "Role",
    headKey: "position",
    subKey: "organization",
    fields: [
      { key: "position", label: "Position", kind: "text", span: 1 },
      { key: "organization", label: "Organization", kind: "text", span: 1 },
      { key: "url", label: "Website", kind: "url", span: 2 },
      { key: "startDate", label: "Start", kind: "date", span: 1 },
      { key: "endDate", label: "End", kind: "date", span: 1 },
      { key: "summary", label: "Summary", kind: "textarea", span: 2 },
      { key: "highlights", label: "Highlights", kind: "bullets", span: 2 },
    ],
  },
  {
    id: "interests",
    title: "Interests",
    itemLabel: "Interest",
    headKey: "name",
    fields: [
      { key: "name", label: "Name", kind: "text", span: 2 },
      { key: "keywords", label: "Keywords", kind: "tags", span: 2 },
    ],
  },
  {
    id: "references",
    title: "References",
    itemLabel: "Reference",
    headKey: "name",
    fields: [
      { key: "name", label: "Name", kind: "text", span: 2 },
      { key: "reference", label: "Reference", kind: "textarea", span: 2 },
    ],
  },
];

export const SECTION_BY_ID = new Map(SECTIONS.map((s) => [s.id, s]));

/** Text shown for a collapsed item, falling back to the item's position. */
export function itemHeading(
  section: SectionDef,
  item: ResumeItem,
  index: number,
): { title: string; sub: string } {
  const read = (key?: string) => {
    if (!key) return "";
    const value = (item as Record<string, unknown>)[key];
    if (typeof value === "string") return value.trim();
    if (Array.isArray(value)) return value.filter(Boolean).join(", ");
    return "";
  };
  return {
    title: read(section.headKey) || `${section.itemLabel} ${index + 1}`,
    sub: read(section.subKey),
  };
}

/** True when the item has at least one value the reader would see. */
export function itemHasContent(item: ResumeItem): boolean {
  return Object.values(item as Record<string, unknown>).some((value) =>
    Array.isArray(value)
      ? value.some((v) => typeof v === "string" && v.trim())
      : typeof value === "string" && value.trim() !== "",
  );
}
