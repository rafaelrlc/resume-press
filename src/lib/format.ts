/** Shared text helpers used by both the form chrome and the PDF templates. */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * First three letters (English or Portuguese, full name or abbreviation) of
 * every month, mapped to its number. Both languages share most abbreviations,
 * so one table covers "Jan", "Jun", "janeiro" and "June" alike.
 */
const MONTH_BY_PREFIX: Record<string, number> = {
  jan: 1, fev: 2, feb: 2, mar: 3, abr: 4, apr: 4, mai: 5, may: 5,
  jun: 6, jul: 7, ago: 8, aug: 8, set: 9, sep: 9, out: 10, oct: 10,
  nov: 11, dez: 12, dec: 12,
};

const OPEN_ENDED_WORDS = new Set([
  "present", "presente", "current", "atual", "atualmente", "now", "hoje", "ongoing",
]);

const stripDiacritics = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "");

/**
 * A résumé date field in whatever shape another tool exported it. ISO forms
 * (YYYY, YYYY-MM, YYYY-MM-DD) pass through untouched. "Jan 2025" / "janeiro
 * de 2025" become "2025-01". "Present" / "Presente" / "Atual" become "" — this
 * app's own convention for an open end date. Anything else is returned as-is,
 * never dropped: an unrecognised date is still better on the page than gone.
 */
export function normalizeDateString(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (/^\d{4}(-\d{2}(-\d{2})?)?$/.test(raw)) return raw;

  const folded = stripDiacritics(raw).toLowerCase();
  if (OPEN_ENDED_WORDS.has(folded)) return "";

  const match = /^([a-z]{3,})[a-z.]*\s+(?:de\s+)?(\d{4})$/.exec(folded);
  if (match) {
    const month = MONTH_BY_PREFIX[match[1].slice(0, 3)];
    if (month) return `${match[2]}-${String(month).padStart(2, "0")}`;
  }

  const reversed = /^(\d{4})\s+([a-z]{3,})[a-z.]*$/.exec(folded);
  if (reversed) {
    const month = MONTH_BY_PREFIX[reversed[2].slice(0, 3)];
    if (month) return `${reversed[1]}-${String(month).padStart(2, "0")}`;
  }

  return raw;
}

/** "2021-06-01" → "Jun 2021"; "2021" → "2021"; anything else passes through. */
export function formatDate(value: string): string {
  const date = value?.trim();
  if (!date) return "";
  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(date);
  if (!match) return date;
  const [, year, month] = match;
  if (!month) return year;
  const index = Number(month) - 1;
  return MONTHS[index] ? `${MONTHS[index]} ${year}` : year;
}

/** A résumé date range, using "Present" for an open end date. */
export function dateRange(start: string, end: string): string {
  const from = formatDate(start);
  const to = formatDate(end);
  if (!from && !to) return "";
  if (!from) return to;
  return `${from} — ${to || "Present"}`;
}

/** Strip the protocol so links stay short on paper. */
export function shortUrl(url: string): string {
  return url.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Join the parts of a location that are actually filled in. */
export function locationLine(location: {
  city: string;
  region: string;
  countryCode: string;
}): string {
  return [location.city, location.region, location.countryCode]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export function joinNonEmpty(parts: (string | undefined)[], sep = " · "): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(sep);
}

/** Filename-safe slug, e.g. "Ada Lovelace" → "ada-lovelace". */
export function slugify(value: string, fallback = "resume"): string {
  const slug = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || fallback;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
