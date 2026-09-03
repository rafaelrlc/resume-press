import { z } from "zod";
import { validate as validateOfficial } from "@jsonresume/schema";
import { normalizeDateString } from "./format";

/**
 * JSON Resume v1.0.0 — https://jsonresume.org/schema
 *
 * The shape below is derived from the schema published by `@jsonresume/schema`
 * (the JSON Resume project's own package), kept as a Zod schema so every field
 * is coerced rather than rejected: a résumé imported from another tool should
 * load even when it carries legacy keys, nulls, or a stray wrong type.
 *
 * `@jsonresume/schema` itself is used at import time (see `importResumeJson`)
 * to run the file through the project's own JSON Schema validator, so the
 * "does this actually conform" check comes from the source, not a guess.
 */

const str = z.preprocess(
  (v) => (v == null ? "" : typeof v === "string" ? v : String(v)),
  z.string(),
);

const strList = z.preprocess(
  (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []),
  z.array(z.string()),
);

/**
 * A date field that tolerates whatever another tool exported: "Jan 2025",
 * "Presente", already-ISO, or garbage. See `normalizeDateString`.
 */
const dateStr = z.preprocess((v) => normalizeDateString(v), z.string());

const list = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((v) => (Array.isArray(v) ? v : []), z.array(item));

export const LocationSchema = z.object({
  address: str,
  postalCode: str,
  city: str,
  countryCode: str,
  region: str,
});

export const ProfileSchema = z.object({
  network: str,
  username: str,
  url: str,
});

export const BasicsSchema = z.preprocess(
  (v) => {
    const b = (v ?? {}) as Record<string, unknown>;
    return { ...b, url: b.url ?? b.website };
  },
  z.object({
    name: str,
    label: str,
    image: str,
    email: str,
    phone: str,
    url: str,
    summary: str,
    location: z.preprocess((v) => v ?? {}, LocationSchema),
    profiles: list(ProfileSchema),
  }),
);

export const WorkSchema = z.preprocess(
  (v) => {
    const w = (v ?? {}) as Record<string, unknown>;
    return { ...w, name: w.name ?? w.company, url: w.url ?? w.website };
  },
  z.object({
    name: str,
    position: str,
    location: str,
    description: str,
    url: str,
    startDate: dateStr,
    endDate: dateStr,
    summary: str,
    highlights: strList,
  }),
);

export const VolunteerSchema = z.preprocess(
  (v) => {
    const w = (v ?? {}) as Record<string, unknown>;
    return { ...w, url: w.url ?? w.website };
  },
  z.object({
    organization: str,
    position: str,
    url: str,
    startDate: dateStr,
    endDate: dateStr,
    summary: str,
    highlights: strList,
  }),
);

export const EducationSchema = z.object({
  institution: str,
  url: str,
  area: str,
  studyType: str,
  startDate: dateStr,
  endDate: dateStr,
  score: str,
  courses: strList,
});

export const AwardSchema = z.object({
  title: str,
  date: dateStr,
  awarder: str,
  summary: str,
});

export const CertificateSchema = z.object({
  name: str,
  date: dateStr,
  issuer: str,
  url: str,
});

export const PublicationSchema = z.object({
  name: str,
  publisher: str,
  releaseDate: dateStr,
  url: str,
  summary: str,
});

export const SkillSchema = z.object({
  name: str,
  level: str,
  keywords: strList,
});

export const LanguageSchema = z.object({
  language: str,
  fluency: str,
});

export const InterestSchema = z.object({
  name: str,
  keywords: strList,
});

export const ReferenceSchema = z.object({
  name: str,
  reference: str,
});

export const ProjectSchema = z.object({
  name: str,
  description: str,
  highlights: strList,
  keywords: strList,
  startDate: dateStr,
  endDate: dateStr,
  url: str,
  roles: strList,
  entity: str,
  type: str,
});

export const ResumeSchema = z.object({
  basics: BasicsSchema,
  work: list(WorkSchema),
  volunteer: list(VolunteerSchema),
  education: list(EducationSchema),
  awards: list(AwardSchema),
  certificates: list(CertificateSchema),
  publications: list(PublicationSchema),
  skills: list(SkillSchema),
  languages: list(LanguageSchema),
  interests: list(InterestSchema),
  references: list(ReferenceSchema),
  projects: list(ProjectSchema),
});

export type Resume = z.infer<typeof ResumeSchema>;
export type Basics = Resume["basics"];
export type Profile = z.infer<typeof ProfileSchema>;

/** Keys of `Resume` whose value is an array of items. */
export type ArraySectionId = Exclude<keyof Resume, "basics">;

export type ResumeItem = Resume[ArraySectionId][number];

export const emptyResume = (): Resume => ResumeSchema.parse({});

/** Blank item for a given array section, with every key present as "". */
export const emptyItem = (id: ArraySectionId): ResumeItem => {
  const shapes = {
    work: WorkSchema,
    volunteer: VolunteerSchema,
    education: EducationSchema,
    awards: AwardSchema,
    certificates: CertificateSchema,
    publications: PublicationSchema,
    skills: SkillSchema,
    languages: LanguageSchema,
    interests: InterestSchema,
    references: ReferenceSchema,
    projects: ProjectSchema,
  } as const;
  return shapes[id].parse({}) as ResumeItem;
};

export type ImportResult =
  | { ok: true; resume: Resume; name: string; warnings: string[] }
  | { ok: false; error: string };

/**
 * Conformance against the schema `@jsonresume/schema` actually publishes.
 * Checked against what this app will actually save — after aliases like
 * `company`/`website` are resolved, dates are normalised, and stray `null`s
 * are dropped — not the raw upload. Warning about problems this app already
 * fixes on the way in would just be noise.
 */
function officialWarnings(resume: Resume): string[] {
  let messages: string[] = [];
  validateOfficial(toJsonResume(resume), (errors) => {
    messages = (errors ?? []).map((e) => e.stack.replace(/^instance\.?/, "") || e.message);
  });
  return messages;
}

/** Parse arbitrary JSON text into a résumé. Never throws. */
export function importResumeJson(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, error: "A résumé must be a JSON object." };
  }
  const parsed = ResumeSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "That JSON doesn't match the JSON Resume schema." };
  }
  return {
    ok: true,
    resume: parsed.data,
    name: parsed.data.basics.name.trim() || "Untitled résumé",
    warnings: officialWarnings(parsed.data),
  };
}

/** Serialise for export: drop empty strings and empty arrays, add `meta`. */
export function toJsonResume(resume: Resume): Record<string, unknown> {
  const prune = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      const items = value.map(prune).filter((v) => v !== undefined);
      return items.length ? items : undefined;
    }
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        const pruned = prune(v);
        if (pruned !== undefined) out[k] = pruned;
      }
      return Object.keys(out).length ? out : undefined;
    }
    if (typeof value === "string") return value.trim() ? value.trim() : undefined;
    return value ?? undefined;
  };

  const body = (prune(resume) ?? {}) as Record<string, unknown>;
  return {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    ...body,
    meta: {
      version: "v1.0.0",
      canonical:
        "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
      lastModified: new Date().toISOString().slice(0, 19),
    },
  };
}
