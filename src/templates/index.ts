import type { DocumentProps } from "@react-pdf/renderer";
import Console from "./Console";
import Even from "./Even";
import Flat from "./Flat";
import Kendall from "./Kendall";
import Ledger from "./Ledger";
import Macchiato from "./Macchiato";
import Rule from "./Rule";
import StackOverflow from "./StackOverflow";
import type { TemplateProps } from "./shared";

export type TemplateId =
  | "ledger"
  | "console"
  | "rule"
  | "even"
  | "stackoverflow"
  | "kendall"
  | "flat"
  | "macchiato";

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  description: string;
  render: (props: TemplateProps) => React.ReactElement<DocumentProps>;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "ledger",
    name: "Ledger",
    description: "Centred and serif. The one hiring committees expect.",
    render: Ledger,
  },
  {
    id: "console",
    name: "Console",
    description: "Tinted sidebar for contact and skills, one column for the story.",
    render: Console,
  },
  {
    id: "rule",
    name: "Rule",
    description: "Dense grid with dates in the gutter. Fits a long history on one page.",
    render: Rule,
  },
  {
    id: "even",
    name: "Even",
    description: "Flush-left header over a quiet two-column split. After jsonresume-theme-even.",
    render: Even,
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    description: "A full-width colour band and tagged skills. After the developer-story theme.",
    render: StackOverflow,
  },
  {
    id: "kendall",
    name: "Kendall",
    description: "The plain academic CV — no rules, no colour blocks, just structure.",
    render: Kendall,
  },
  {
    id: "flat",
    name: "Flat",
    description: "No lines anywhere. Spacing and weight carry the whole hierarchy.",
    render: Flat,
  },
  {
    id: "macchiato",
    name: "Macchiato",
    description: "Warm and unhurried, with dotted section labels and italic role lines.",
    render: Macchiato,
  },
];

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);

export const templateById = (id: TemplateId): TemplateMeta =>
  TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

export type { TemplateProps };
