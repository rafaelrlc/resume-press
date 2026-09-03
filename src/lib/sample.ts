import { ResumeSchema, type Resume } from "./schema";

/** A filled-in résumé, so a first-time page has something on the paper. */
export const sampleResume = (): Resume =>
  ResumeSchema.parse({
    basics: {
      name: "Ada Lovelace",
      label: "Systems engineer",
      email: "ada@analyticalengine.dev",
      phone: "+44 20 7946 0812",
      url: "https://analyticalengine.dev",
      summary:
        "Systems engineer with nine years on compilers and numerical tooling. I like problems where the hard part is deciding what the machine should be asked to do, not how fast it does it.",
      location: { city: "London", region: "England", countryCode: "GB" },
      profiles: [
        { network: "GitHub", username: "adalovelace", url: "https://github.com/adalovelace" },
        { network: "LinkedIn", username: "adalovelace", url: "https://linkedin.com/in/adalovelace" },
      ],
    },
    work: [
      {
        name: "Analytical Engines",
        position: "Principal engineer",
        location: "London",
        startDate: "2021-03",
        endDate: "",
        summary:
          "Own the compiler backend and the tooling three product teams build on.",
        highlights: [
          "Cut median build time from 6m to 51s by making incremental compilation the default path.",
          "Wrote the migration that moved 240k lines onto the new IR without a release freeze.",
          "Mentor four engineers; two now lead their own areas.",
        ],
      },
      {
        name: "Bernoulli Systems",
        position: "Senior engineer",
        location: "Cambridge",
        startDate: "2017-08",
        endDate: "2021-02",
        summary: "",
        highlights: [
          "Built the numerical library behind the firm's risk models, still in production.",
          "Designed the fuzzing harness that caught 30+ correctness bugs before release.",
        ],
      },
    ],
    education: [
      {
        institution: "University of Cambridge",
        studyType: "MEng",
        area: "Computer Science",
        startDate: "2012",
        endDate: "2016",
        score: "First class",
        courses: ["Compiler construction", "Numerical analysis", "Type theory"],
      },
    ],
    projects: [
      {
        name: "Notation",
        description:
          "A small language for writing numerical kernels that compiles to portable SIMD.",
        url: "https://github.com/adalovelace/notation",
        startDate: "2022",
        endDate: "",
        highlights: ["1.9k stars", "Used in two research groups for lattice simulations"],
        keywords: ["Rust", "LLVM", "SIMD"],
        roles: ["Author"],
      },
    ],
    skills: [
      { name: "Languages", keywords: ["Rust", "C++", "TypeScript", "Python"] },
      { name: "Systems", keywords: ["LLVM", "Compilers", "Distributed tracing"] },
      { name: "Practice", keywords: ["Property testing", "Technical writing", "Mentoring"] },
    ],
    languages: [
      { language: "English", fluency: "Native speaker" },
      { language: "French", fluency: "Professional working" },
    ],
    awards: [
      {
        title: "Turing Prize for Systems Work",
        date: "2023",
        awarder: "British Computer Society",
        summary: "",
      },
    ],
  });
