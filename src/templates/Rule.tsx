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
 * Rule — dense and gridded. A narrow left gutter carries section names and
 * dates; everything else sits in one measured column on the right.
 */

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 46,
    fontFamily: FONTS.sans,
    fontSize: 8.9,
    lineHeight: 1.5,
    color: "#141414",
  },
  masthead: { flexDirection: "row", alignItems: "flex-end", marginBottom: 4 },
  name: { fontFamily: FONTS.sansBold, fontSize: 17, letterSpacing: -0.4, flex: 1 },
  headline: { fontFamily: FONTS.mono, fontSize: 8, textTransform: "uppercase", letterSpacing: 0.8 },
  hairline: { height: 1.6, marginTop: 6, marginBottom: 5 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  contactItem: { fontFamily: FONTS.mono, fontSize: 7.6, marginRight: 12, color: "#454545" },
  contactLink: {
    fontFamily: FONTS.mono,
    fontSize: 7.6,
    marginRight: 12,
    color: "#454545",
    textDecoration: "none",
  },

  block: { flexDirection: "row", marginBottom: 13 },
  gutter: { width: 92, paddingRight: 12 },
  gutterTitle: {
    fontFamily: FONTS.monoBold,
    fontSize: 7.6,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  body: { flex: 1 },

  entry: { flexDirection: "row", marginBottom: 8 },
  entryDates: { width: 92, paddingRight: 12, fontFamily: FONTS.mono, fontSize: 7.4, color: "#5c5c5c" },
  entryBody: { flex: 1 },
  entryTitle: { fontFamily: FONTS.sansBold, fontSize: 9.6 },
  entryMeta: { fontSize: 8.6, color: "#4c4c4c" },
  summary: { marginTop: 2 },
  bullet: { flexDirection: "row", marginTop: 2 },
  bulletMark: { width: 12, fontSize: 8 },
  keywords: { fontFamily: FONTS.mono, fontSize: 7.4, color: "#5c5c5c", marginTop: 2.5 },
  link: { color: "#4c4c4c", textDecoration: "none" },
});

/** A section: name in the gutter, content in the measure. */
function Block({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.block}>
      <View style={s.gutter}>
        <Text style={[s.gutterTitle, { color: accent }]}>{title}</Text>
      </View>
      <View style={s.body}>{children}</View>
    </View>
  );
}

/** A dated entry: the range sits in its own column, aligned down the page. */
function Entry({ dates, children }: { dates: string; children: React.ReactNode }) {
  return (
    <View style={s.entry} wrap={false}>
      <Text style={s.entryDates}>{dates}</Text>
      <View style={s.entryBody}>{children}</View>
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
            <Text style={[s.bulletMark, { color: accent }]}>—</Text>
            <Text style={{ flex: 1 }}>{highlight}</Text>
          </View>
        ))}
    </>
  );
}

export default function Rule({ resume, accent, sectionTitles, sectionOrder }: TemplateProps) {
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
          <Block title={sectionTitle("work", sectionTitles)} accent={accent}>
            {work.map((job, i) => (
              <Entry key={i} dates={dateRange(job.startDate, job.endDate)}>
                <Text style={s.entryTitle}>{job.position || job.name}</Text>
                <Text style={s.entryMeta}>
                  {joinNonEmpty([job.position ? job.name : "", job.location, job.description])}
                </Text>
                {has(job.summary) && <Text style={s.summary}>{job.summary}</Text>}
                <Bullets accent={accent} items={job.highlights} />
              </Entry>
            ))}
          </Block>
    ),
    projects: projects.length > 0 && (
          <Block title={sectionTitle("projects", sectionTitles)} accent={accent}>
            {projects.map((project, i) => (
              <Entry key={i} dates={dateRange(project.startDate, project.endDate)}>
                <Text style={s.entryTitle}>{project.name}</Text>
                {has(project.url) && (
                  <Link src={project.url} style={[s.entryMeta, s.link]}>
                    {shortUrl(project.url)}
                  </Link>
                )}
                {has(project.description) && <Text style={s.summary}>{project.description}</Text>}
                <Bullets accent={accent} items={project.highlights} />
                {project.keywords.filter(Boolean).length > 0 && (
                  <Text style={s.keywords}>{project.keywords.filter(Boolean).join(" / ")}</Text>
                )}
              </Entry>
            ))}
          </Block>
    ),
    education: education.length > 0 && (
          <Block title={sectionTitle("education", sectionTitles)} accent={accent}>
            {education.map((school, i) => (
              <Entry key={i} dates={dateRange(school.startDate, school.endDate)}>
                <Text style={s.entryTitle}>{school.institution}</Text>
                <Text style={s.entryMeta}>
                  {joinNonEmpty(
                    [joinNonEmpty([school.studyType, school.area], ", "), school.score],
                  )}
                </Text>
                {school.courses.filter(Boolean).length > 0 && (
                  <Text style={s.keywords}>{school.courses.filter(Boolean).join(" / ")}</Text>
                )}
              </Entry>
            ))}
          </Block>
    ),
    skills: skills.length > 0 && (
          <Block title={sectionTitle("skills", sectionTitles)} accent={accent}>
            {skills.map((skill, i) => (
              <View key={i} style={s.entry}>
                <Text style={[s.entryDates, { fontFamily: FONTS.monoBold, color: "#141414" }]}>
                  {skill.name}
                </Text>
                <Text style={s.entryBody}>
                  {joinNonEmpty(
                    [skill.keywords.filter(Boolean).join(", "), skill.level],
                    " — ",
                  )}
                </Text>
              </View>
            ))}
          </Block>
    ),
    languages: languages.length > 0 && (
          <Block title={sectionTitle("languages", sectionTitles)} accent={accent}>
            {languages.map((item, i) => (
              <View key={i} style={s.entry}>
                <Text style={[s.entryDates, { fontFamily: FONTS.monoBold, color: "#141414" }]}>
                  {item.language}
                </Text>
                <Text style={s.entryBody}>{item.fluency}</Text>
              </View>
            ))}
          </Block>
    ),
    publications: publications.length > 0 && (
          <Block title={sectionTitle("publications", sectionTitles)} accent={accent}>
            {publications.map((item, i) => (
              <Entry key={i} dates={formatDate(item.releaseDate)}>
                <Text style={s.entryTitle}>{item.name}</Text>
                <Text style={s.entryMeta}>{item.publisher}</Text>
                {has(item.summary) && <Text style={s.summary}>{item.summary}</Text>}
              </Entry>
            ))}
          </Block>
    ),
    awards: awards.length > 0 && (
          <Block title={sectionTitle("awards", sectionTitles)} accent={accent}>
            {awards.map((award, i) => (
              <Entry key={i} dates={formatDate(award.date)}>
                <Text style={s.entryTitle}>{award.title}</Text>
                <Text style={s.entryMeta}>{award.awarder}</Text>
                {has(award.summary) && <Text style={s.summary}>{award.summary}</Text>}
              </Entry>
            ))}
          </Block>
    ),
    certificates: certificates.length > 0 && (
          <Block title={sectionTitle("certificates", sectionTitles)} accent={accent}>
            {certificates.map((item, i) => (
              <Entry key={i} dates={formatDate(item.date)}>
                <Text style={s.entryTitle}>{item.name}</Text>
                <Text style={s.entryMeta}>{item.issuer}</Text>
              </Entry>
            ))}
          </Block>
    ),
    volunteer: volunteer.length > 0 && (
          <Block title={sectionTitle("volunteer", sectionTitles)} accent={accent}>
            {volunteer.map((item, i) => (
              <Entry key={i} dates={dateRange(item.startDate, item.endDate)}>
                <Text style={s.entryTitle}>{item.position || item.organization}</Text>
                {item.position ? <Text style={s.entryMeta}>{item.organization}</Text> : null}
                {has(item.summary) && <Text style={s.summary}>{item.summary}</Text>}
                <Bullets accent={accent} items={item.highlights} />
              </Entry>
            ))}
          </Block>
    ),
    interests: interests.length > 0 && (
          <Block title={sectionTitle("interests", sectionTitles)} accent={accent}>
            {interests.map((item, i) => (
              <View key={i} style={s.entry}>
                <Text style={[s.entryDates, { fontFamily: FONTS.monoBold, color: "#141414" }]}>
                  {item.name}
                </Text>
                <Text style={s.entryBody}>{item.keywords.filter(Boolean).join(", ")}</Text>
              </View>
            ))}
          </Block>
    ),
    references: references.length > 0 && (
          <Block title={sectionTitle("references", sectionTitles)} accent={accent}>
            {references.map((item, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={s.entryTitle}>{item.name}</Text>
                <Text style={s.entryMeta}>{item.reference}</Text>
              </View>
            ))}
          </Block>
    ),
  };

  return (
    <Document title={basics.name || "Résumé"} author={basics.name}>
      <Page size="A4" style={s.page}>
        <View style={s.masthead}>
          <Text style={s.name}>{basics.name || "Your name"}</Text>
          {has(basics.label) && (
            <Text style={[s.headline, { color: accent }]}>{basics.label}</Text>
          )}
        </View>
        <View style={[s.hairline, { backgroundColor: accent }]} />
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
                {joinNonEmpty([profile.network, profile.username], "/") ||
                  shortUrl(profile.url)}
              </Link>
            ))}
        </View>

        {has(basics.summary) && (
          <Block title={sectionTitle("profile", sectionTitles)} accent={accent}>
            <Text>{basics.summary}</Text>
          </Block>
        )}

        {orderedSections(blocks, sectionOrder)}
      </Page>
    </Document>
  );
}
