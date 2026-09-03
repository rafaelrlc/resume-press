import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { dateRange, formatDate, joinNonEmpty, shortUrl } from "@/lib/format";
import type { ArraySectionId } from "@/lib/schema";
import {
  contactParts,
  filled,
  FONTS,
  has,
  orderedSections,
  sectionTitle,
  type TemplateProps,
} from "./shared";

/**
 * Even — inspired by jsonresume-theme-even. Flush-left header, then a quiet
 * two-column split: a wide column for the narrative (profile, experience,
 * projects), a narrow one for the facts (education, skills, languages). No
 * colour block, just a hairline rule between them.
 */

const ASIDE = "31%";

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 44,
    fontFamily: FONTS.sans,
    fontSize: 9,
    lineHeight: 1.48,
    color: "#1e1e1e",
  },
  name: { fontFamily: FONTS.sansBold, fontSize: 22, letterSpacing: -0.3 },
  headline: { fontSize: 10.5, marginTop: 3, color: "#4a4a4a" },
  contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  contactItem: { fontSize: 8.6, marginRight: 14, color: "#5a5a5a" },
  contactLink: { fontSize: 8.6, marginRight: 14, color: "#5a5a5a", textDecoration: "none" },
  divider: { height: 1, marginTop: 16, marginBottom: 18, backgroundColor: "#e2e2e2" },

  columns: { flexDirection: "row" },
  main: { width: `${100 - 31 - 6}%`, paddingRight: 22 },
  aside: {
    width: ASIDE,
    borderLeftWidth: 1,
    borderLeftColor: "#e2e2e2",
    paddingLeft: 18,
  },

  sectionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  section: { marginBottom: 16 },
  entry: { marginBottom: 11 },
  entryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryTitle: { fontFamily: FONTS.sansBold, fontSize: 10 },
  entryMeta: { fontSize: 8.8, color: "#565656" },
  dates: { fontSize: 8, color: "#8a8a8a" },
  summary: { marginTop: 3 },
  bullet: { flexDirection: "row", marginTop: 2.5 },
  bulletMark: { width: 9, fontSize: 8 },
  keywords: { fontSize: 8.2, color: "#7a7a7a", marginTop: 3 },
  link: { color: "#5a5a5a", textDecoration: "none" },

  asideEntry: { marginBottom: 10 },
  asideTitle: { fontFamily: FONTS.sansBold, fontSize: 8.8 },
  asideMeta: { fontSize: 8.2, color: "#5a5a5a", marginTop: 1 },
  asideDates: { fontSize: 7.6, color: "#8a8a8a", marginTop: 1 },
});

/** Wide-column section: label, rule, stacked entries. */
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
      <Text style={[s.sectionTitle, { color: accent }]}>{title}</Text>
      {children}
    </View>
  );
}

/** Narrow-column section: same label treatment, tighter entries. */
function AsideSection({
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
      <Text style={[s.sectionTitle, { color: accent, fontSize: 8.4 }]}>{title}</Text>
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
            <Text style={[s.bulletMark, { color: accent }]}>–</Text>
            <Text style={{ flex: 1 }}>{highlight}</Text>
          </View>
        ))}
    </>
  );
}

export default function Even({ resume, accent, sectionTitles, sectionOrder }: TemplateProps) {
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

  // The wide and narrow columns are each their own fixed region — a reorder
  // moves a section up or down within its column, not across.
  const mainBlocks: Partial<Record<ArraySectionId, React.ReactNode>> = {
    work: work.length > 0 && (
      <MainSection title={sectionTitle("work", sectionTitles)} accent={accent}>
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
      </MainSection>
    ),
    projects: projects.length > 0 && (
      <MainSection title={sectionTitle("projects", sectionTitles)} accent={accent}>
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
              <Text style={s.keywords}>{project.keywords.filter(Boolean).join(" · ")}</Text>
            )}
          </View>
        ))}
      </MainSection>
    ),
    publications: publications.length > 0 && (
      <MainSection title={sectionTitle("publications", sectionTitles)} accent={accent}>
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
      </MainSection>
    ),
    volunteer: volunteer.length > 0 && (
      <MainSection title={sectionTitle("volunteer", sectionTitles)} accent={accent}>
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
      </MainSection>
    ),
  };

  const asideBlocks: Partial<Record<ArraySectionId, React.ReactNode>> = {
    education: education.length > 0 && (
      <AsideSection title={sectionTitle("education", sectionTitles)} accent={accent}>
        {education.map((school, i) => (
          <View key={i} style={s.asideEntry} wrap={false}>
            <Text style={s.asideTitle}>{school.institution}</Text>
            <Text style={s.asideMeta}>
              {joinNonEmpty([school.studyType, school.area], ", ")}
            </Text>
            <Text style={s.asideDates}>{dateRange(school.startDate, school.endDate)}</Text>
          </View>
        ))}
      </AsideSection>
    ),
    skills: skills.length > 0 && (
      <AsideSection title={sectionTitle("skills", sectionTitles)} accent={accent}>
        {skills.map((skill, i) => (
          <View key={i} style={s.asideEntry}>
            {has(skill.name) && <Text style={s.asideTitle}>{skill.name}</Text>}
            <Text style={s.asideMeta}>{skill.keywords.filter(Boolean).join(", ")}</Text>
          </View>
        ))}
      </AsideSection>
    ),
    languages: languages.length > 0 && (
      <AsideSection title={sectionTitle("languages", sectionTitles)} accent={accent}>
        {languages.map((item, i) => (
          <Text key={i} style={[s.asideMeta, { marginBottom: 3 }]}>
            {joinNonEmpty([item.language, item.fluency], " — ")}
          </Text>
        ))}
      </AsideSection>
    ),
    awards: awards.length > 0 && (
      <AsideSection title={sectionTitle("awards", sectionTitles)} accent={accent}>
        {awards.map((award, i) => (
          <View key={i} style={s.asideEntry}>
            <Text style={s.asideTitle}>{award.title}</Text>
            <Text style={s.asideMeta}>
              {joinNonEmpty([award.awarder, formatDate(award.date)], " · ")}
            </Text>
          </View>
        ))}
      </AsideSection>
    ),
    certificates: certificates.length > 0 && (
      <AsideSection title={sectionTitle("certificates", sectionTitles)} accent={accent}>
        {certificates.map((item, i) => (
          <View key={i} style={s.asideEntry}>
            <Text style={s.asideTitle}>{item.name}</Text>
            <Text style={s.asideMeta}>
              {joinNonEmpty([item.issuer, formatDate(item.date)], " · ")}
            </Text>
          </View>
        ))}
      </AsideSection>
    ),
    interests: interests.length > 0 && (
      <AsideSection title={sectionTitle("interests", sectionTitles)} accent={accent}>
        {interests.map((item, i) => (
          <Text key={i} style={[s.asideMeta, { marginBottom: 3 }]}>
            {joinNonEmpty([item.name, item.keywords.filter(Boolean).join(", ")], ": ")}
          </Text>
        ))}
      </AsideSection>
    ),
    references: references.length > 0 && (
      <AsideSection title={sectionTitle("references", sectionTitles)} accent={accent}>
        {references.map((item, i) => (
          <View key={i} style={s.asideEntry}>
            <Text style={s.asideTitle}>{item.name}</Text>
            <Text style={s.asideMeta}>{item.reference}</Text>
          </View>
        ))}
      </AsideSection>
    ),
  };

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
        <View style={s.divider} />

        <View style={s.columns}>
          <View style={s.main}>
            {has(basics.summary) && (
              <MainSection title={sectionTitle("profile", sectionTitles)} accent={accent}>
                <Text>{basics.summary}</Text>
              </MainSection>
            )}

            {orderedSections(mainBlocks, sectionOrder)}
          </View>

          <View style={s.aside}>
            {orderedSections(asideBlocks, sectionOrder)}
          </View>
        </View>
      </Page>
    </Document>
  );
}
