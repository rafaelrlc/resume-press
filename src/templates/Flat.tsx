import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { dateRange, formatDate, joinNonEmpty, shortUrl } from "@/lib/format";
import { contactParts, filled, FONTS, has, sectionTitle, type TemplateProps } from "./shared";

/**
 * Flat — inspired by jsonresume-theme-flat. No rules, no borders, no tint
 * blocks anywhere: the only colour on the page is the name and a small
 * square marking each section and bullet. Hierarchy comes purely from
 * weight and the room around things.
 */

const s = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingBottom: 46,
    paddingHorizontal: 50,
    fontFamily: FONTS.sans,
    fontSize: 9.2,
    lineHeight: 1.55,
    color: "#232323",
  },
  name: { fontFamily: FONTS.sansBold, fontSize: 23, letterSpacing: -0.3 },
  headline: { fontSize: 10.5, marginTop: 4, color: "#5c5c5c" },
  contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  contactItem: { fontSize: 8.6, marginRight: 16, color: "#6a6a6a" },
  contactLink: { fontSize: 8.6, marginRight: 16, color: "#6a6a6a", textDecoration: "none" },

  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionMark: { width: 7, height: 7, marginRight: 8 },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  section: { marginTop: 22 },
  entry: { marginBottom: 13 },
  entryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryTitle: { fontFamily: FONTS.sansBold, fontSize: 10.4 },
  entryMeta: { fontSize: 9, color: "#5c5c5c" },
  dates: { fontSize: 8.4, color: "#8f8f8f" },
  summary: { marginTop: 3.5 },
  bullet: { flexDirection: "row", marginTop: 3 },
  bulletMark: { width: 12 },
  bulletDot: { width: 4.5, height: 4.5, marginTop: 3.2 },
  keywords: { fontSize: 8.4, color: "#8f8f8f", marginTop: 3.5 },
  link: { color: "#5c5c5c", textDecoration: "none" },
  skillRow: { marginBottom: 8 },
  skillLabel: { fontFamily: FONTS.sansBold, fontSize: 9.4, marginBottom: 1.5 },
  skillValue: { fontSize: 9 },
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
      <View style={s.sectionTitle}>
        <View style={[s.sectionMark, { backgroundColor: accent }]} />
        <Text style={s.sectionLabel}>{title}</Text>
      </View>
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
            <View style={s.bulletMark}>
              <View style={[s.bulletDot, { backgroundColor: accent }]} />
            </View>
            <Text style={{ flex: 1 }}>{highlight}</Text>
          </View>
        ))}
    </>
  );
}

export default function Flat({ resume, accent, sectionTitles }: TemplateProps) {
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

  return (
    <Document title={basics.name || "Résumé"} author={basics.name}>
      <Page size="A4" style={s.page}>
        <Text style={[s.name, { color: accent }]}>{basics.name || "Your name"}</Text>
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

        {has(basics.summary) && (
          <Section title={sectionTitle("profile", sectionTitles)} accent={accent}>
            <Text>{basics.summary}</Text>
          </Section>
        )}

        {work.length > 0 && (
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
        )}

        {projects.length > 0 && (
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
                {project.keywords.filter(Boolean).length > 0 && (
                  <Text style={s.keywords}>{project.keywords.filter(Boolean).join("   ")}</Text>
                )}
              </View>
            ))}
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
                <Text style={s.entryMeta}>
                  {joinNonEmpty([school.studyType, school.area], ", ")}
                </Text>
                {school.courses.filter(Boolean).length > 0 && (
                  <Text style={s.keywords}>{school.courses.filter(Boolean).join("   ")}</Text>
                )}
              </View>
            ))}
          </Section>
        )}

        {skills.length > 0 && (
          <Section title={sectionTitle("skills", sectionTitles)} accent={accent}>
            {skills.map((skill, i) => (
              <View key={i} style={s.skillRow}>
                <Text style={s.skillLabel}>{skill.name}</Text>
                <Text style={s.skillValue}>{skill.keywords.filter(Boolean).join("   ")}</Text>
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
                  <Text style={s.entryTitle}>{item.name}</Text>
                  {item.issuer ? `   ${item.issuer}` : ""}
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
                <Bullets accent={accent} items={item.highlights} />
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
                .join("     ")}
            </Text>
          </Section>
        )}

        {interests.length > 0 && (
          <Section title={sectionTitle("interests", sectionTitles)} accent={accent}>
            {interests.map((item, i) => (
              <View key={i} style={s.skillRow}>
                <Text style={s.skillLabel}>{item.name}</Text>
                <Text style={s.skillValue}>{item.keywords.filter(Boolean).join("   ")}</Text>
              </View>
            ))}
          </Section>
        )}

        {references.length > 0 && (
          <Section title={sectionTitle("references", sectionTitles)} accent={accent}>
            {references.map((item, i) => (
              <View key={i} style={s.entry}>
                <Text style={s.entryTitle}>{item.name}</Text>
                <Text style={s.entryMeta}>{item.reference}</Text>
              </View>
            ))}
          </Section>
        )}
      </Page>
    </Document>
  );
}
