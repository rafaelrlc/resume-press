import { Document, Font, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { dateRange, formatDate, joinNonEmpty, shortUrl } from "@/lib/format";
import { contactParts, filled, has, sectionTitle, type TemplateProps } from "./shared";

/**
 * Ledger — the classic LaTeX academic CV: Latin Modern, a small-caps name,
 * hairline-ruled section headings, bold employer over italic title. Dense by
 * design, so a long history still lands on one page.
 */

const LM = {
  roman: "LM Roman",
  bold: "LM Roman Bold",
  italic: "LM Roman Italic",
  boldItalic: "LM Roman Bold Italic",
  caps: "LM Roman Caps",
} as const;

let registered = false;
function ensureFonts() {
  if (registered) return;
  registered = true;
  Font.register({ family: LM.roman, src: "/fonts/LatinModernRoman-Regular.ttf" });
  Font.register({ family: LM.bold, src: "/fonts/LatinModernRoman-Bold.ttf" });
  Font.register({ family: LM.italic, src: "/fonts/LatinModernRoman-Italic.ttf" });
  Font.register({ family: LM.boldItalic, src: "/fonts/LatinModernRoman-BoldItalic.ttf" });
  // The caps face's lowercase glyphs are drawn as small caps directly — no
  // text-transform needed, typing the name normally is enough.
  Font.register({ family: LM.caps, src: "/fonts/LatinModernRomanCaps-Regular.ttf" });
  Font.registerHyphenationCallback((word) => [word]);
}
ensureFonts();

const s = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 50,
    fontFamily: LM.roman,
    fontSize: 10,
    lineHeight: 1.22,
    color: "#161616",
  },
  name: {
    fontFamily: LM.caps,
    fontSize: 26,
    lineHeight: 1,
    letterSpacing: 0.6,
    textAlign: "center",
    marginBottom: 2,
  },
  headline: {
    fontFamily: LM.italic,
    fontSize: 10,
    textAlign: "center",
  },
  contact: {
    textAlign: "center",
    fontSize: 9.6,
    marginTop: 1,
    color: "#3d3d3d",
  },
  sectionTitle: {
    fontFamily: LM.bold,
    fontSize: 12,
    paddingBottom: 4.5,
    borderBottomWidth: 0.9,
    marginBottom: 4,
  },
  section: { marginTop: 4 },
  entry: { marginBottom: 3 },
  entryRow: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontFamily: LM.bold, fontSize: 10.5 },
  entryMeta: { fontFamily: LM.italic, fontSize: 10, color: "#232323" },
  plainMeta: { fontFamily: LM.roman, fontSize: 9.8, color: "#3d3d3d" },
  dates: { fontFamily: LM.roman, fontSize: 9.6, color: "#3d3d3d" },
  summary: { marginTop: 1.6, textAlign: "justify" },
  bullet: { flexDirection: "row", marginTop: 1.6, paddingRight: 4 },
  bulletMark: { width: 11.5, fontSize: 8.5 },
  inline: { marginTop: 1.6 },
  label: { fontFamily: LM.bold },
  link: { color: "#3d3d3d", textDecoration: "none" },
  skillRow: { flexDirection: "row", marginBottom: 2 },
  skillLabel: { fontFamily: LM.bold, width: 184 },
  skillValue: { flex: 1 },
});

/** A titled block, ruled off in the document's ink. */
function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <Text style={[s.sectionTitle, { borderBottomColor: accent }]}>{title}</Text>
      {children}
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <>
      {items
        .filter((highlight) => highlight.trim())
        .map((highlight, i) => (
          <View key={i} style={s.bullet}>
            <Text style={s.bulletMark}>•</Text>
            <Text style={{ flex: 1 }}>{highlight}</Text>
          </View>
        ))}
    </>
  );
}

export default function Ledger({ resume, accent, sectionTitles }: TemplateProps) {
  const { basics } = resume;
  const contact = contactParts(resume);
  const links = [
    ...(has(basics.url) ? [{ label: shortUrl(basics.url), url: basics.url }] : []),
    ...basics.profiles
      .filter((p) => has(p.url) || has(p.username))
      .map((p) => ({
        label: p.username.trim() ? `${p.network}: ${p.username}` : shortUrl(p.url),
        url: p.url,
      })),
  ];

  const work = filled(resume.work);
  const education = filled(resume.education);
  const projects = filled(resume.projects);
  const skills = filled(resume.skills);
  const awards = filled(resume.awards);
  const certificates = filled(resume.certificates);
  const publications = filled(resume.publications);
  const volunteer = filled(resume.volunteer);
  const languages = filled(resume.languages);
  const interests = filled(resume.interests);
  const references = filled(resume.references);

  return (
    <Document title={basics.name || "Résumé"} author={basics.name}>
      <Page size="A4" style={s.page}>
        <Text style={[s.name, { color: accent }]}>{basics.name || "Your name"}</Text>
        {has(basics.label) && <Text style={s.headline}>{basics.label}</Text>}
        {(contact.length > 0 || links.length > 0) && (
          <Text style={s.contact}>
            {contact.map((line, i) => (
              <Text key={`c${i}`}>
                {i > 0 ? "  ·  " : ""}
                {line}
              </Text>
            ))}
            {links.map((link, i) => (
              <Text key={`l${i}`}>
                {contact.length > 0 || i > 0 ? "  ·  " : ""}
                <Link src={link.url || "#"} style={s.link}>
                  {link.label}
                </Link>
              </Text>
            ))}
          </Text>
        )}

        {has(basics.summary) && (
          <Section title={sectionTitle("profile", sectionTitles)} accent={accent}>
            <Text style={s.summary}>{basics.summary}</Text>
          </Section>
        )}

        {education.length > 0 && (
          <Section title={sectionTitle("education", sectionTitles)} accent={accent}>
            {education.map((school, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{school.institution}</Text>
                  <Text style={s.dates}>{dateRange(school.startDate, school.endDate)}</Text>
                </View>
                <View style={s.entryRow}>
                  <Text style={s.plainMeta}>
                    {joinNonEmpty([school.studyType, school.area], ", ")}
                  </Text>
                  {has(school.score) && <Text style={s.dates}>{school.score}</Text>}
                </View>
                {school.courses.filter(Boolean).length > 0 && (
                  <Text style={s.inline}>
                    <Text style={s.label}>Coursework: </Text>
                    {school.courses.filter(Boolean).join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </Section>
        )}

        {work.length > 0 && (
          <Section title={sectionTitle("work", sectionTitles)} accent={accent}>
            {work.map((job, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{job.name || job.position}</Text>
                  <Text style={s.dates}>{job.location}</Text>
                </View>
                <View style={s.entryRow}>
                  <Text style={s.entryMeta}>
                    {joinNonEmpty([job.name ? job.position : "", job.description], " — ")}
                  </Text>
                  <Text style={s.dates}>{dateRange(job.startDate, job.endDate)}</Text>
                </View>
                {has(job.summary) && <Text style={s.summary}>{job.summary}</Text>}
                <Bullets items={job.highlights} />
              </View>
            ))}
          </Section>
        )}

        {projects.length > 0 && (
          <Section title={sectionTitle("projects", sectionTitles)} accent={accent}>
            {projects.map((project, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>
                    {project.name}
                    {has(project.url) && (
                      <Text style={s.entryMeta}>
                        {"  "}
                        <Link src={project.url} style={s.link}>
                          {shortUrl(project.url)}
                        </Link>
                      </Text>
                    )}
                  </Text>
                  <Text style={s.dates}>{dateRange(project.startDate, project.endDate)}</Text>
                </View>
                {has(project.description) && <Text style={s.summary}>{project.description}</Text>}
                <Bullets items={project.highlights} />
                {project.keywords.filter(Boolean).length > 0 && (
                  <Text style={[s.inline, s.entryMeta]}>
                    {project.keywords.filter(Boolean).join(" · ")}
                  </Text>
                )}
              </View>
            ))}
          </Section>
        )}

        {skills.length > 0 && (
          <Section title={sectionTitle("skills", sectionTitles)} accent={accent}>
            {skills.map((skill, i) => (
              <View key={i} style={s.skillRow} wrap={false}>
                <Text style={s.skillLabel}>{skill.name}</Text>
                <Text style={s.skillValue}>{skill.keywords.filter(Boolean).join(", ")}</Text>
              </View>
            ))}
          </Section>
        )}

        {publications.length > 0 && (
          <Section title={sectionTitle("publications", sectionTitles)} accent={accent}>
            {publications.map((item, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{item.name}</Text>
                  <Text style={s.dates}>{formatDate(item.releaseDate)}</Text>
                </View>
                <Text style={s.entryMeta}>{item.publisher}</Text>
                {has(item.summary) && <Text style={s.summary}>{item.summary}</Text>}
              </View>
            ))}
          </Section>
        )}

        {awards.length > 0 && (
          <Section title={sectionTitle("awards", sectionTitles)} accent={accent}>
            {awards.map((award, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{award.title}</Text>
                  <Text style={s.dates}>{formatDate(award.date)}</Text>
                </View>
                <Text style={s.entryMeta}>{award.awarder}</Text>
                {has(award.summary) && <Text style={s.summary}>{award.summary}</Text>}
              </View>
            ))}
          </Section>
        )}

        {certificates.length > 0 && (
          <Section title={sectionTitle("certificates", sectionTitles)} accent={accent}>
            {certificates.map((item, i) => (
              <View key={i} style={s.entryRow}>
                <Text>
                  <Text style={s.label}>{item.name}</Text>
                  {item.issuer ? ` — ${item.issuer}` : ""}
                </Text>
                <Text style={s.dates}>{formatDate(item.date)}</Text>
              </View>
            ))}
          </Section>
        )}

        {volunteer.length > 0 && (
          <Section title={sectionTitle("volunteer", sectionTitles)} accent={accent}>
            {volunteer.map((item, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{item.position || item.organization}</Text>
                  <Text style={s.dates}>{dateRange(item.startDate, item.endDate)}</Text>
                </View>
                {item.position ? <Text style={s.entryMeta}>{item.organization}</Text> : null}
                {has(item.summary) && <Text style={s.summary}>{item.summary}</Text>}
                <Bullets items={item.highlights} />
              </View>
            ))}
          </Section>
        )}

        {languages.length > 0 && (
          <Section title={sectionTitle("languages", sectionTitles)} accent={accent}>
            <Text>
              {languages
                .map((l) => joinNonEmpty([l.language, l.fluency], " — "))
                .filter(Boolean)
                .join("   ·   ")}
            </Text>
          </Section>
        )}

        {interests.length > 0 && (
          <Section title={sectionTitle("interests", sectionTitles)} accent={accent}>
            {interests.map((item, i) => (
              <Text key={i} style={{ marginBottom: 2 }}>
                <Text style={s.label}>{item.name}{item.name ? ": " : ""}</Text>
                {item.keywords.filter(Boolean).join(", ")}
              </Text>
            ))}
          </Section>
        )}

        {references.length > 0 && (
          <Section title={sectionTitle("references", sectionTitles)} accent={accent}>
            {references.map((item, i) => (
              <View key={i} style={s.entry}>
                <Text style={s.label}>{item.name}</Text>
                <Text style={s.entryMeta}>{item.reference}</Text>
              </View>
            ))}
          </Section>
        )}
      </Page>
    </Document>
  );
}
