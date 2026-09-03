import type { DocumentProps } from "@react-pdf/renderer";
import Console from "./Console";
import Ledger from "./Ledger";
import Rule from "./Rule";
import type { TemplateProps } from "./shared";

export type TemplateId = "ledger" | "console" | "rule";

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
];

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);

export const templateById = (id: TemplateId): TemplateMeta =>
  TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

export type { TemplateProps };
