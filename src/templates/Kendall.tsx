import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { dateRange, formatDate, joinNonEmpty, shortUrl } from "@/lib/format";
import type { ArraySectionId } from "@/lib/schema";
import {
  FONTS,
  contactParts,
  filled,
  has,
  orderedSections,
  sectionTitle,
  type TemplateProps,
} from "./shared";

/**
 * Kendall — inspired by jsonresume-theme-kendall. The plain academic CV:
 * flush left, sans-serif, no colour blocks or rules — just weight, case and
 * spacing doing the organising. Every section is a simple label over a
 * hairline, the way a hand-typed CV would be laid out.
 */

const s = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 48,
    fontFamily: FONTS.sans,
    fontSize: 9.3,
    lineHeight: 1.48,
    color: "#1c1c1c",
  },
  name: { fontFamily: FONTS.sansBold, fontSize: 20, letterSpacing: -0.2 },
  headline: { fontFamily: FONTS.sansItalic, fontSize: 10, marginTop: 2, color: "#3a3a3a" },
  contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  contactItem: { fontSize: 8.6, marginRight: 14, color: "#4a4a4a" },
  contactLink: { fontSize: 8.6, marginRight: 14, color: "#4a4a4a", textDecoration: "none" },

  sectionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c1c",
  },
  section: { marginTop: 15 },
  entry: { marginTop: 9 },
  entryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  entryTitle: { fontFamily: FONTS.sansBold, fontSize: 10 },
  entryMeta: { fontFamily: FONTS.sansItalic, fontSize: 9.1, color: "#333333" },
  dates: { fontSize: 8.6, color: "#6a6a6a" },
  summary: { marginTop: 2.5 },
  bullet: { flexDirection: "row", marginTop: 2.5 },
  bulletMark: { width: 10, fontSize: 8 },
  keywords: { fontSize: 8.4, color: "#5a5a5a", marginTop: 2.5 },
  link: { color: "#4a4a4a", textDecoration: "none" },
  skillRow: { flexDirection: "row", marginTop: 4 },
  skillLabel: { fontFamily: FONTS.sansBold, width: 130, fontSize: 9 },
  skillValue: { flex: 1, fontSize: 9 },
});

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
      <Text style={[s.sectionTitle, { color: accent, borderBottomColor: accent }]}>{title}</Text>
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

export default function Kendall({ resume, accent, sectionTitles, sectionOrder }: TemplateProps) {
  const { basics } = resume;
  const contact = contactParts(resume);

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

  const blocks: Partial<Record<ArraySectionId, React.ReactNode>> = {
    work: work.length > 0 && (
          <Section title={sectionTitle("work", sectionTitles)} accent={accent}>
            {work.map((job, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{job.position || job.name}</Text>
                  <Text style={s.dates}>{dateRange(job.startDate, job.endDate)}</Text>
                </View>
                <View style={s.entryRow}>
                  <Text style={s.entryMeta}>
                    {joinNonEmpty([job.position ? job.name : "", job.description], " — ")}
                  </Text>
                  <Text style={s.dates}>{job.location}</Text>
                </View>
                {has(job.summary) && <Text style={s.summary}>{job.summary}</Text>}
                <Bullets items={job.highlights} />
              </View>
            ))}
          </Section>
    ),
    education: education.length > 0 && (
          <Section title={sectionTitle("education", sectionTitles)} accent={accent}>
            {education.map((school, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{school.institution}</Text>
                  <Text style={s.dates}>{dateRange(school.startDate, school.endDate)}</Text>
                </View>
                <View style={s.entryRow}>
                  <Text style={s.entryMeta}>
                    {joinNonEmpty([school.studyType, school.area], ", ")}
                  </Text>
                  {has(school.score) && <Text style={s.dates}>{school.score}</Text>}
                </View>
                {school.courses.filter(Boolean).length > 0 && (
                  <Text style={s.keywords}>{school.courses.filter(Boolean).join(", ")}</Text>
                )}
              </View>
            ))}
          </Section>
    ),
    projects: projects.length > 0 && (
          <Section title={sectionTitle("projects", sectionTitles)} accent={accent}>
            {projects.map((project, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>{project.name}</Text>
                  <Text style={s.dates}>{dateRange(project.startDate, project.endDate)}</Text>
                </View>
                {has(project.url) && (
                  <Link src={project.url} style={[s.entryMeta, s.link]}>
                    {shortUrl(project.url)}
                  </Link>
                )}
                {has(project.description) && <Text style={s.summary}>{project.description}</Text>}
                <Bullets items={project.highlights} />
                {project.keywords.filter(Boolean).length > 0 && (
                  <Text style={s.keywords}>{project.keywords.filter(Boolean).join(", ")}</Text>
                )}
              </View>
            ))}
          </Section>
    ),
    skills: skills.length > 0 && (
          <Section title={sectionTitle("skills", sectionTitles)} accent={accent}>
            {skills.map((skill, i) => (
              <View key={i} style={s.skillRow}>
                <Text style={s.skillLabel}>{skill.name}</Text>
                <Text style={s.skillValue}>{skill.keywords.filter(Boolean).join(", ")}</Text>
              </View>
            ))}
          </Section>
    ),
    publications: publications.length > 0 && (
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
    ),
    awards: awards.length > 0 && (
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
    ),
    certificates: certificates.length > 0 && (
          <Section title={sectionTitle("certificates", sectionTitles)} accent={accent}>
            {certificates.map((item, i) => (
              <View key={i} style={s.entryRow}>
                <Text>
                  <Text style={s.entryTitle}>{item.name}</Text>
                  {item.issuer ? `  ${item.issuer}` : ""}
                </Text>
                <Text style={s.dates}>{formatDate(item.date)}</Text>
              </View>
            ))}
          </Section>
    ),
    volunteer: volunteer.length > 0 && (
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
    ),
    languages: languages.length > 0 && (
          <Section title={sectionTitle("languages", sectionTitles)} accent={accent}>
            <Text style={{ marginTop: 6 }}>
              {languages
                .map((l) => joinNonEmpty([l.language, l.fluency], " — "))
                .filter(Boolean)
                .join("   ·   ")}
            </Text>
          </Section>
    ),
    interests: interests.length > 0 && (
          <Section title={sectionTitle("interests", sectionTitles)} accent={accent}>
            {interests.map((item, i) => (
              <View key={i} style={s.skillRow}>
                <Text style={s.skillLabel}>{item.name}</Text>
                <Text style={s.skillValue}>{item.keywords.filter(Boolean).join(", ")}</Text>
              </View>
            ))}
          </Section>
    ),
    references: references.length > 0 && (
          <Section title={sectionTitle("references", sectionTitles)} accent={accent}>
            {references.map((item, i) => (
              <View key={i} style={s.entry}>
                <Text style={s.entryTitle}>{item.name}</Text>
                <Text style={s.entryMeta}>{item.reference}</Text>
              </View>
            ))}
          </Section>
    ),
  };

  return (
    <Document title={basics.name || "Résumé"} author={basics.name}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{basics.name || "Your name"}</Text>
        {has(basics.label) && <Text style={s.headline}>{basics.label}</Text>}
        {(contact.length > 0 || has(basics.url) || basics.profiles.length > 0) && (
          <View style={s.contactRow}>
            {contact.map((line, i) => (
              <Text key={i} style={s.contactItem}>{line}</Text>
            ))}
            {has(basics.url) && (
              <Link src={basics.url} style={s.contactLink}>{shortUrl(basics.url)}</Link>
            )}
            {basics.profiles
              .filter((p) => has(p.username) || has(p.url))
              .map((profile, i) => (
                <Link key={i} src={profile.url || "#"} style={s.contactLink}>
                  {joinNonEmpty([profile.network, profile.username], " ") ||
                    shortUrl(profile.url)}
                </Link>
              ))}
          </View>
        )}

        {has(basics.summary) && (
          <Section title={sectionTitle("profile", sectionTitles)} accent={accent}>
            <Text style={{ marginTop: 6 }}>{basics.summary}</Text>
          </Section>
        )}

        {orderedSections(blocks, sectionOrder)}
      </Page>
    </Document>
  );
}
