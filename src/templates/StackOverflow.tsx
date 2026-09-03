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
 * Stack Overflow — inspired by jsonresume-theme-stackoverflow's "developer
 * story" card. A full-width colour band carries the identity; the body
 * below is plain white, and every keyword list prints as a row of tags
 * rather than a comma-separated line.
 */

const s = StyleSheet.create({
  page: {
    fontFamily: FONTS.sans,
    fontSize: 9,
    lineHeight: 1.46,
    color: "#242424",
  },
  band: { paddingTop: 34, paddingBottom: 22, paddingHorizontal: 44 },
  name: { fontFamily: FONTS.sansBold, fontSize: 22, color: "#ffffff" },
  headline: { fontSize: 10.5, color: "#ffffff", opacity: 0.9, marginTop: 3 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  contactItem: { fontSize: 8.4, color: "#ffffff", opacity: 0.85, marginRight: 14 },
  contactLink: {
    fontSize: 8.4,
    color: "#ffffff",
    opacity: 0.85,
    marginRight: 14,
    textDecoration: "none",
  },

  body: { paddingHorizontal: 44, paddingTop: 22, paddingBottom: 36 },
  sectionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingLeft: 9,
    borderLeftWidth: 2.5,
    marginBottom: 9,
  },
  section: { marginBottom: 15 },
  entry: { marginBottom: 11 },
  entryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryTitle: { fontFamily: FONTS.sansBold, fontSize: 10.2 },
  entryMeta: { fontSize: 8.8, color: "#5c5c5c" },
  dates: { fontSize: 8, color: "#8a8a8a" },
  summary: { marginTop: 3 },
  bullet: { flexDirection: "row", marginTop: 2.5 },
  bulletMark: { width: 9, fontSize: 8 },
  link: { color: "#5c5c5c", textDecoration: "none" },

  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  tag: {
    fontSize: 7.8,
    borderRadius: 3,
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    marginRight: 5,
    marginBottom: 5,
  },
  skillGroupName: { fontFamily: FONTS.sansBold, fontSize: 9, marginBottom: 3 },
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
      <Text style={[s.sectionTitle, { color: accent, borderLeftColor: accent }]}>{title}</Text>
      {children}
    </View>
  );
}

function Bullets({ items, accent }: { items: string[]; accent: string }) {
  return (
    <>
      {items
        .filter((highlight) => highlight.trim())
        .map((highlight, i) => (
          <View key={i} style={s.bullet}>
            <Text style={[s.bulletMark, { color: accent }]}>▸</Text>
            <Text style={{ flex: 1 }}>{highlight}</Text>
          </View>
        ))}
    </>
  );
}

/** Keywords rendered as filled tags — the theme's signature. */
function Tags({ items, accent }: { items: string[]; accent: string }) {
  const words = items.filter((w) => w.trim());
  if (words.length === 0) return null;
  return (
    <View style={s.tagRow}>
      {words.map((word, i) => (
        <Text
          key={i}
          style={[
            s.tag,
            { backgroundColor: `${accent}1a`, color: accent },
          ]}
        >
          {word}
        </Text>
      ))}
    </View>
  );
}

export default function StackOverflow({ resume, accent, sectionTitles, sectionOrder }: TemplateProps) {
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
                  <Text style={s.entryMeta}>
                    {joinNonEmpty([job.position ? job.name : "", job.location])}
                  </Text>
                  {has(job.summary) && <Text style={s.summary}>{job.summary}</Text>}
                  <Bullets accent={accent} items={job.highlights} />
                </View>
              ))}
            </Section>
    ),
    skills: skills.length > 0 && (
            <Section title={sectionTitle("skills", sectionTitles)} accent={accent}>
              {skills.map((skill, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  {has(skill.name) && <Text style={s.skillGroupName}>{skill.name}</Text>}
                  <Tags accent={accent} items={skill.keywords} />
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
                  <Bullets accent={accent} items={project.highlights} />
                  <Tags accent={accent} items={project.keywords} />
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
                  <Text style={s.entryMeta}>
                    {joinNonEmpty([school.studyType, school.area], ", ")}
                  </Text>
                  {school.courses.filter(Boolean).length > 0 && (
                    <Tags accent={accent} items={school.courses} />
                  )}
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
                  <Text style={s.entryTitle}>
                    {item.name}
                    {item.issuer ? ` — ${item.issuer}` : ""}
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
                  <Bullets accent={accent} items={item.highlights} />
                </View>
              ))}
            </Section>
    ),
    languages: languages.length > 0 && (
            <Section title={sectionTitle("languages", sectionTitles)} accent={accent}>
              <Text>
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
                <View key={i} style={{ marginBottom: 6 }}>
                  {has(item.name) && <Text style={s.skillGroupName}>{item.name}</Text>}
                  <Tags accent={accent} items={item.keywords} />
                </View>
              ))}
            </Section>
    ),
    references: references.length > 0 && (
            <Section title={sectionTitle("references", sectionTitles)} accent={accent}>
              {references.map((item, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
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
        <View style={[s.band, { backgroundColor: accent }]}>
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
                    {profile.username.trim() || shortUrl(profile.url)}
                  </Link>
                ))}
            </View>
          )}
        </View>

        <View style={s.body}>
          {has(basics.summary) && (
            <Section title={sectionTitle("profile", sectionTitles)} accent={accent}>
              <Text>{basics.summary}</Text>
            </Section>
          )}

          {orderedSections(blocks, sectionOrder)}
        </View>
      </Page>
    </Document>
  );
}
