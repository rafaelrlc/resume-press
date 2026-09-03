"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { ArraySectionId, Resume } from "@/lib/schema";
import { itemHasContent, SECTION_BY_ID, SECTIONS } from "@/lib/sections";
import { useSectionOrder, useWorkspace } from "@/lib/store";

export type PanelId = "basics" | (typeof SECTIONS)[number]["id"];

type Props = {
  resume: Resume;
  active: PanelId;
  onSelect: (id: PanelId) => void;
};

type Row = { id: PanelId; title: string; count: number; filled: boolean };

/** One row per section, in print order, carrying how much of it would actually print. */
function readRows(resume: Resume, order: ArraySectionId[]): Row[] {
  return [
    {
      id: "basics",
      title: "Basics",
      count: 0,
      filled: Boolean(resume.basics.name.trim() || resume.basics.email.trim()),
    },
    ...order.map((id) => {
      const section = SECTION_BY_ID.get(id)!;
      const count = resume[id].filter((item) => itemHasContent(item)).length;
      return { id, title: section.title, count, filled: count > 0 };
    }),
  ];
}

/**
 * The job ticket. Numbering is the print order (reorderable via the arrows,
 * "Basics" always pinned first), and the notch is a real reading of the
 * document: filled once the section would print something.
 */
export function SectionRail({ resume, active, onSelect }: Props) {
  const order = useSectionOrder();
  const moveSection = useWorkspace((s) => s.moveSection);
  const rows = readRows(resume, order);

  return (
    <nav aria-label="Résumé sections" className="py-4">
      <p className="eyebrow px-5 pb-3 text-white/35">Sections</p>
      <ul>
        {rows.map((row, index) => {
          const isActive = row.id === active;
          const reorderable = row.id !== "basics";
          const orderIndex = reorderable ? order.indexOf(row.id as ArraySectionId) : -1;
          return (
            <li key={row.id} className="group relative">
              <span
                aria-hidden
                className={`absolute left-0 top-0 h-full w-[3px] transition-colors ${
                  isActive ? "bg-mist" : "bg-transparent"
                }`}
              />
              <div
                className={`flex w-full items-center gap-1 pl-5 pr-2 transition-colors ${
                  isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.035]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(row.id)}
                  aria-current={isActive ? "true" : undefined}
                  className="flex min-w-0 flex-1 items-center gap-3 py-[7px] text-left"
                >
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      isActive ? "text-mist" : "text-white/30"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex-1 truncate text-[13px] ${
                      isActive ? "text-white" : "text-white/65 group-hover:text-white/90"
                    }`}
                  >
                    {row.title}
                  </span>
                  {row.count > 0 && (
                    <span className="font-mono text-[10px] tabular-nums text-white/35">
                      {row.count}
                    </span>
                  )}
                  <span
                    aria-hidden
                    className={`h-[7px] w-[7px] shrink-0 ${
                      row.filled
                        ? isActive
                          ? "bg-mist"
                          : "bg-white/55"
                        : "border border-white/25"
                    }`}
                  />
                </button>

                {reorderable && (
                  <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      aria-label={`Move ${row.title} up`}
                      disabled={orderIndex === 0}
                      onClick={() => moveSection(row.id as ArraySectionId, -1)}
                      className="rounded-[3px] p-1 text-white/45 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25"
                    >
                      <ArrowUp size={12} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${row.title} down`}
                      disabled={orderIndex === order.length - 1}
                      onClick={() => moveSection(row.id as ArraySectionId, 1)}
                      className="rounded-[3px] p-1 text-white/45 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25"
                    >
                      <ArrowDown size={12} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The same ticket laid on its side, for viewports too narrow for the rail. */
export function SectionStrip({
  resume,
  active,
  onSelect,
  className = "",
}: Props & { className?: string }) {
  const order = useSectionOrder();
  const rows = readRows(resume, order);

  return (
    <nav
      aria-label="Résumé sections"
      className={`shrink-0 overflow-x-auto border-b border-bone-3 bg-bone-2/60 scroll-slim ${className}`}
    >
      <ul className="flex w-max">
        {rows.map((row, index) => {
          const isActive = row.id === active;
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onSelect(row.id)}
                aria-current={isActive ? "true" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-[13px] transition-colors ${
                  isActive
                    ? "border-ink text-ink"
                    : "border-transparent text-ink/50"
                }`}
              >
                <span className="font-mono text-[10px] tabular-nums text-ink/35">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {row.title}
                {row.count > 0 && (
                  <span className="font-mono text-[10px] tabular-nums text-ink/35">
                    {row.count}
                  </span>
                )}
                <span
                  aria-hidden
                  className={`h-[6px] w-[6px] ${
                    row.filled ? (isActive ? "bg-ink" : "bg-ink/40") : "border border-ink/25"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
