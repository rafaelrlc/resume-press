import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { dateRange, formatDate, joinNonEmpty, shortUrl } from "@/lib/format";
import { contactParts, filled, FONTS, has, sectionTitle, type TemplateProps } from "./shared";

/** Console — a two-column layout with a tinted sidebar, set in Helvetica. */

const SIDEBAR = "32%";

const s = StyleSheet.create({
  page: {
    fontFamily: FONTS.sans,
    fontSize: 9.2,
    lineHeight: 1.45,
    color: "#1c1c1c",
    flexDirection: "row",
  },
  sidebar: {
    width: SIDEBAR,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 22,
  },
  /** Painted separately and repeated, so the tint survives a page break. */
  sidebarField: { position: "absolute", top: 0, left: 0, bottom: 0, width: SIDEBAR },
  main: {
    width: "68%",
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 24,
    paddingRight: 34,
  },
  name: { fontFamily: FONTS.sansBold, fontSize: 19, lineHeight: 1.15, color: "#ffffff" },
  headline: { fontSize: 9.6, marginTop: 6, color: "#ffffff", opacity: 0.85 },
  sideTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 7.6,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#ffffff",
    opacity: 0.65,
    marginBottom: 5,
  },
  sideBlock: { marginTop: 18 },
  sideText: { color: "#ffffff", fontSize: 8.8, marginBottom: 2.5 },
  sideLink: { color: "#ffffff", fontSize: 8.8, marginBottom: 2.5, textDecoration: "none" },
  sideStrong: { fontFamily: FONTS.sansBold, color: "#ffffff", fontSize: 8.8, marginTop: 5 },
  mainTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 8.4,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 7,
  },
  section: { marginBottom: 16 },
  entry: { marginBottom: 10 },
  entryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryTitle: { fontFamily: FONTS.sansBold, fontSize: 10 },
  entryMeta: { fontSize: 9, color: "#4a4a4a" },
  dates: { fontSize: 8.2, color: "#6a6a6a", textAlign: "right" },
  summary: { marginTop: 3 },
  bullet: { flexDirection: "row", marginTop: 2.5 },
  bulletMark: { width: 9 },
  keywords: { fontSize: 8.4, color: "#6a6a6a", marginTop: 3 },
  rule: { height: 2, marginBottom: 7, width: 22 },
});

/** A titled block, opened by a short bar in the document's ink. */
function MainSection({
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
      <View style={[s.rule, { backgroundColor: accent }]} />
      <Text style={s.mainTitle}>{title}</Text>
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
            <Text style={[s.bulletMark, { color: accent }]}>▪</Text>
            <Text style={{ flex: 1 }}>{highlight}</Text>
          </View>
        ))}
    </>
  );
}

export default function Console({ resume, accent, sectionTitles }: TemplateProps) {
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
        <View fixed style={[s.sidebarField, { backgroundColor: accent }]} />
        <View style={s.sidebar}>
          <Text style={s.name}>{basics.name || "Your name"}</Text>
          {has(basics.label) && <Text style={s.headline}>{basics.label}</Text>}

          {(contact.length > 0 || has(basics.url) || basics.profiles.length > 0) && (
            <View style={s.sideBlock}>
              <Text style={s.sideTitle}>Contact</Text>
              {contact.map((line, i) => (
                <Text key={i} style={s.sideText}>{line}</Text>
              ))}
              {has(basics.url) && (
                <Link src={basics.url} style={s.sideLink}>{shortUrl(basics.url)}</Link>
              )}
              {basics.profiles
                .filter((p) => has(p.username) || has(p.url))
                .map((profile, i) => (
                  <Link key={i} src={profile.url || "#"} style={s.sideLink}>
                    {profile.username.trim()
                      ? `${profile.network || "Profile"} / ${profile.username}`
                      : shortUrl(profile.url)}
                  </Link>
                ))}
            </View>
          )}

          {skills.length > 0 && (
            <View style={s.sideBlock}>
              <Text style={s.sideTitle}>{sectionTitle("skills", sectionTitles)}</Text>
              {skills.map((skill, i) => (
                <View key={i}>
                  {has(skill.name) && <Text style={s.sideStrong}>{skill.name}</Text>}
                  <Text style={s.sideText}>
                    {joinNonEmpty(
                      [skill.keywords.filter(Boolean).join(", "), skill.level],
                      " — ",
                    )}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {languages.length > 0 && (
            <View style={s.sideBlock}>
              <Text style={s.sideTitle}>{sectionTitle("languages", sectionTitles)}</Text>
              {languages.map((item, i) => (
                <Text key={i} style={s.sideText}>
                  {joinNonEmpty([item.language, item.fluency], " — ")}
                </Text>
              ))}
            </View>
          )}

          {certificates.length > 0 && (
            <View style={s.sideBlock}>
              <Text style={s.sideTitle}>{sectionTitle("certificates", sectionTitles)}</Text>
              {certificates.map((item, i) => (
                <View key={i}>
                  <Text style={s.sideStrong}>{item.name}</Text>
                  <Text style={s.sideText}>
                    {joinNonEmpty([item.issuer, formatDate(item.date)], " · ")}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {interests.length > 0 && (
            <View style={s.sideBlock}>
              <Text style={s.sideTitle}>{sectionTitle("interests", sectionTitles)}</Text>
              {interests.map((item, i) => (
                <Text key={i} style={s.sideText}>
                  {joinNonEmpty([item.name, item.keywords.filter(Boolean).join(", ")], ": ")}
                </Text>
              ))}
            </View>
          )}

          {references.length > 0 && (
            <View style={s.sideBlock}>
              <Text style={s.sideTitle}>{sectionTitle("references", sectionTitles)}</Text>
              {references.map((item, i) => (
                <View key={i}>
                  <Text style={s.sideStrong}>{item.name}</Text>
                  <Text style={s.sideText}>{item.reference}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.main}>
          {has(basics.summary) && (
            <MainSection title={sectionTitle("profile", sectionTitles)} accent={accent}>
              <Text>{basics.summary}</Text>
            </MainSection>
          )}

          {work.length > 0 && (
            <MainSection title={sectionTitle("work", sectionTitles)} accent={accent}>
              {work.map((job, i) => (
                <View key={i} style={s.entry} wrap={false}>
                  <View style={s.entryHead}>
                    <Text style={s.entryTitle}>{job.position || job.name}</Text>
                    <Text style={s.dates}>{dateRange(job.startDate, job.endDate)}</Text>
                  </View>
                  <Text style={[s.entryMeta, { color: accent }]}>
                    {joinNonEmpty([job.position ? job.name : "", job.location])}
                  </Text>
                  {has(job.summary) && <Text style={s.summary}>{job.summary}</Text>}
                  <Bullets accent={accent} items={job.highlights} />
                </View>
              ))}
            </MainSection>
          )}

          {projects.length > 0 && (
            <MainSection title={sectionTitle("projects", sectionTitles)} accent={accent}>
              {projects.map((project, i) => (
                <View key={i} style={s.entry} wrap={false}>
                  <View style={s.entryHead}>
                    <Text style={s.entryTitle}>{project.name}</Text>
                    <Text style={s.dates}>{dateRange(project.startDate, project.endDate)}</Text>
                  </View>
                  {has(project.url) && (
                    <Link src={project.url} style={[s.entryMeta, { color: accent, textDecoration: "none" }]}>
                      {shortUrl(project.url)}
                    </Link>
                  )}
                  {has(project.description) && <Text style={s.summary}>{project.description}</Text>}
                  <Bullets accent={accent} items={project.highlights} />
                  {project.keywords.filter(Boolean).length > 0 && (
                    <Text style={s.keywords}>{project.keywords.filter(Boolean).join(" · ")}</Text>
                  )}
                </View>
              ))}
            </MainSection>
          )}

          {education.length > 0 && (
            <MainSection title={sectionTitle("education", sectionTitles)} accent={accent}>
              {education.map((school, i) => (
                <View key={i} style={s.entry} wrap={false}>
                  <View style={s.entryHead}>
                    <Text style={s.entryTitle}>{school.institution}</Text>
                    <Text style={s.dates}>{dateRange(school.startDate, school.endDate)}</Text>
                  </View>
                  <Text style={[s.entryMeta, { color: accent }]}>
                    {joinNonEmpty([school.studyType, school.area], ", ")}
                  </Text>
                  {has(school.score) && <Text style={s.keywords}>Score: {school.score}</Text>}
                  {school.courses.filter(Boolean).length > 0 && (
                    <Text style={s.keywords}>{school.courses.filter(Boolean).join(" · ")}</Text>
                  )}
                </View>
              ))}
            </MainSection>
          )}

          {publications.length > 0 && (
            <MainSection title={sectionTitle("publications", sectionTitles)} accent={accent}>
              {publications.map((item, i) => (
                <View key={i} style={s.entry} wrap={false}>
                  <View style={s.entryHead}>
                    <Text style={s.entryTitle}>{item.name}</Text>
                    <Text style={s.dates}>{formatDate(item.releaseDate)}</Text>
                  </View>
                  <Text style={[s.entryMeta, { color: accent }]}>{item.publisher}</Text>
                  {has(item.summary) && <Text style={s.summary}>{item.summary}</Text>}
                </View>
              ))}
            </MainSection>
          )}

          {awards.length > 0 && (
            <MainSection title={sectionTitle("awards", sectionTitles)} accent={accent}>
              {awards.map((award, i) => (
                <View key={i} style={s.entry} wrap={false}>
                  <View style={s.entryHead}>
                    <Text style={s.entryTitle}>{award.title}</Text>
                    <Text style={s.dates}>{formatDate(award.date)}</Text>
                  </View>
                  <Text style={[s.entryMeta, { color: accent }]}>{award.awarder}</Text>
                  {has(award.summary) && <Text style={s.summary}>{award.summary}</Text>}
                </View>
              ))}
            </MainSection>
          )}

          {volunteer.length > 0 && (
            <MainSection title={sectionTitle("volunteer", sectionTitles)} accent={accent}>
              {volunteer.map((item, i) => (
                <View key={i} style={s.entry} wrap={false}>
                  <View style={s.entryHead}>
                    <Text style={s.entryTitle}>{item.position || item.organization}</Text>
                    <Text style={s.dates}>{dateRange(item.startDate, item.endDate)}</Text>
                  </View>
                  {item.position ? (
                    <Text style={[s.entryMeta, { color: accent }]}>{item.organization}</Text>
                  ) : null}
                  {has(item.summary) && <Text style={s.summary}>{item.summary}</Text>}
                  <Bullets accent={accent} items={item.highlights} />
                </View>
              ))}
            </MainSection>
          )}
        </View>
      </Page>
    </Document>
  );
}
