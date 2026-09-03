"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Field } from "@/components/fields";
import type { PanelId } from "@/components/SectionRail";
import type { Resume, ResumeItem } from "@/lib/schema";
import {
  BASICS_FIELDS,
  itemHeading,
  LOCATION_FIELDS,
  PROFILE_FIELDS,
  SECTION_BY_ID,
  SECTIONS,
  type SectionDef,
} from "@/lib/sections";
import { useWorkspace } from "@/lib/store";

type Props = { resume: Resume; panel: PanelId };

const panelIndex = (panel: PanelId) =>
  panel === "basics" ? 1 : SECTIONS.findIndex((s) => s.id === panel) + 2;

/** "Basics" holds the summary, which prints under a "Profile" heading. */
const pdfSectionId = (panel: PanelId) => (panel === "basics" ? "profile" : panel);
const pdfDefaultTitle = (panel: PanelId) =>
  panel === "basics" ? "Profile" : (SECTION_BY_ID.get(panel)?.title ?? "");

export function FormPanel({ resume, panel }: Props) {
  const title = panel === "basics" ? "Basics" : (SECTION_BY_ID.get(panel)?.title ?? "");

  return (
    <div className="mx-auto w-full max-w-[640px] px-6 py-7 sm:px-8">
      <header className="mb-6">
        <div className="flex items-baseline gap-3">
          <span className="eyebrow text-ink">
            {String(panelIndex(panel)).padStart(2, "0")}
          </span>
          <h2 className="font-display text-[26px] font-bold leading-none tracking-[-0.02em] text-ink">
            {title}
          </h2>
        </div>
        <PdfTitleField
          key={panel}
          sectionId={pdfSectionId(panel)}
          defaultTitle={pdfDefaultTitle(panel)}
        />
      </header>

      {panel === "basics" ? (
        <BasicsForm resume={resume} />
      ) : (
        <ItemsForm
          key={panel}
          section={SECTION_BY_ID.get(panel)!}
          items={resume[panel] as ResumeItem[]}
        />
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[4px] border border-bone-3/70 bg-bone-2/45 p-4 sm:p-5">
      {children}
    </div>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="eyebrow mb-4 text-ink/45">{children}</h3>;
}

function BasicsForm({ resume }: { resume: Resume }) {
  const patchBasics = useWorkspace((s) => s.patchBasics);
  const patchLocation = useWorkspace((s) => s.patchLocation);
  const addProfile = useWorkspace((s) => s.addProfile);
  const patchProfile = useWorkspace((s) => s.patchProfile);
  const removeProfile = useWorkspace((s) => s.removeProfile);
  const { basics } = resume;

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {BASICS_FIELDS.map((def) => (
          <Field
            key={def.key}
            def={def}
            value={(basics as unknown as Record<string, unknown>)[def.key]}
            onChange={(value) => patchBasics({ [def.key]: value })}
          />
        ))}
      </div>

      <div className="mt-7">
        <GroupTitle>Location</GroupTitle>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {LOCATION_FIELDS.map((def) => (
            <Field
              key={def.key}
              def={def}
              value={(basics.location as unknown as Record<string, unknown>)[def.key]}
              onChange={(value) => patchLocation({ [def.key]: String(value) })}
            />
          ))}
        </div>
      </div>

      <div className="mt-7">
        <GroupTitle>Profiles</GroupTitle>
        {basics.profiles.map((profile, index) => (
          <Card key={index}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] tabular-nums text-ink/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <IconButton
                label={`Remove profile ${index + 1}`}
                onClick={() => removeProfile(index)}
              >
                <Trash2 size={14} strokeWidth={1.75} />
              </IconButton>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {PROFILE_FIELDS.map((def) => (
                <Field
                  key={def.key}
                  def={def}
                  value={(profile as unknown as Record<string, unknown>)[def.key]}
                  onChange={(value) => patchProfile(index, { [def.key]: String(value) })}
                />
              ))}
            </div>
          </Card>
        ))}
        <button type="button" className="btn btn-paper" onClick={addProfile}>
          <Plus size={13} strokeWidth={2} />
          Add profile
        </button>
      </div>
    </>
  );
}

function ItemsForm({ section, items }: { section: SectionDef; items: ResumeItem[] }) {
  const addItem = useWorkspace((s) => s.addItem);
  const patchItem = useWorkspace((s) => s.patchItem);
  const removeItem = useWorkspace((s) => s.removeItem);
  const moveItem = useWorkspace((s) => s.moveItem);

  // Collapse is per-section: the panel remounts on a section change, so this
  // starts fresh without an effect.
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggle = (index: number) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  if (items.length === 0) {
    return (
      <div className="rounded-[4px] border border-dashed border-bone-3 bg-bone-2/40 px-6 py-10 text-center">
        <p className="text-[14px] text-ink/60">Nothing here yet.</p>
        <button
          type="button"
          className="btn btn-paper mt-4"
          onClick={() => addItem(section.id)}
        >
          <Plus size={13} strokeWidth={2} />
          Add {section.itemLabel.toLowerCase()}
        </button>
      </div>
    );
  }

  return (
    <>
      {items.map((item, index) => {
        const { title, sub } = itemHeading(section, item, index);
        const isOpen = !collapsed.has(index);
        return (
          <Card key={index}>
            <div className="mb-1 flex items-start gap-2">
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="min-w-0 flex-1 text-left"
              >
                <span className="font-mono text-[10px] tabular-nums text-ink/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="ml-3 text-[14px] font-medium text-ink">{title}</span>
                {sub && <span className="ml-2 text-[13px] text-ink/50">{sub}</span>}
              </button>
              <div className="flex shrink-0 items-center gap-0.5">
                <IconButton
                  label={`Move ${title} up`}
                  disabled={index === 0}
                  onClick={() => moveItem(section.id, index, -1)}
                >
                  <ArrowUp size={14} strokeWidth={1.75} />
                </IconButton>
                <IconButton
                  label={`Move ${title} down`}
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(section.id, index, 1)}
                >
                  <ArrowDown size={14} strokeWidth={1.75} />
                </IconButton>
                <IconButton
                  label={`Remove ${title}`}
                  onClick={() => removeItem(section.id, index)}
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                </IconButton>
              </div>
            </div>

            {isOpen && (
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                {section.fields.map((def) => (
                  <Field
                    key={def.key}
                    def={def}
                    value={(item as unknown as Record<string, unknown>)[def.key]}
                    onChange={(value) => patchItem(section.id, index, { [def.key]: value })}
                  />
                ))}
              </div>
            )}
          </Card>
        );
      })}

      <button
        type="button"
        className="btn btn-paper"
        onClick={() => addItem(section.id)}
      >
        <Plus size={13} strokeWidth={2} />
        Add {section.itemLabel.toLowerCase()}
      </button>
    </>
  );
}

/**
 * Overrides what this section is called in the PDF, without touching the
 * exported JSON — useful for translating headings ("Experience" → "Expe-
 * riência Profissional") while the underlying JSON Resume stays in English.
 */
function PdfTitleField({ sectionId, defaultTitle }: { sectionId: string; defaultTitle: string }) {
  const value = useWorkspace(
    (s) => s.docs.find((d) => d.id === s.activeId)?.sectionTitles[sectionId] ?? "",
  );
  const setSectionTitle = useWorkspace((s) => s.setSectionTitle);

  return (
    <label className="mt-2.5 flex items-center gap-2.5">
      <span className="field-label !mb-0 shrink-0 whitespace-nowrap">PDF header</span>
      <input
        className="input max-w-[260px] !py-1 !text-[13px]"
        placeholder={defaultTitle}
        value={value}
        onChange={(event) => setSectionTitle(sectionId, event.target.value)}
      />
    </label>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-[3px] p-1.5 text-ink/45 transition-colors hover:bg-bone-3/50 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
