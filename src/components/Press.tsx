"use client";

import { useEffect, useMemo, useState } from "react";
import { usePDF } from "@react-pdf/renderer";
import { Braces, Download } from "lucide-react";
import { downloadBlob, slugify } from "@/lib/format";
import { toJsonResume } from "@/lib/schema";
import { itemHasContent, SECTIONS } from "@/lib/sections";
import { ACCENTS, useWorkspace, type Doc } from "@/lib/store";
import { TEMPLATES, templateById } from "@/templates";

/**
 * The press. A real PDF is composed in the browser and shown at A4, so the
 * preview and the download are the same artefact — nothing is approximated.
 */
export function Press({ doc, onLoadExample }: { doc: Doc; onLoadExample: () => void }) {
  const setTemplate = useWorkspace((s) => s.setTemplate);
  const setAccent = useWorkspace((s) => s.setAccent);

  // Typing must not re-run the compositor on every keystroke.
  const [settled, setSettled] = useState(doc);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(doc), 420);
    return () => clearTimeout(timer);
  }, [doc]);

  // Keyed on the fields that actually reach the page — renaming the document
  // (or any other change outside these four) must not recompose the PDF.
  const document = useMemo(
    () => templateById(settled.template).render({
      resume: settled.resume,
      accent: settled.accent,
      sectionTitles: settled.sectionTitles,
    }),
    [settled.template, settled.accent, settled.resume, settled.sectionTitles],
  );

  const [instance, update] = usePDF({ document });
  useEffect(() => update(document), [document, update]);

  const isEmpty = useMemo(() => {
    const { resume } = doc;
    if (resume.basics.name.trim() || resume.basics.email.trim()) return false;
    return SECTIONS.every((section) =>
      resume[section.id].every((item) => !itemHasContent(item)),
    );
  }, [doc]);

  const filename = slugify(doc.resume.basics.name || doc.name);

  const downloadPdf = () => {
    if (instance.blob) downloadBlob(instance.blob, `${filename}.pdf`);
  };

  const downloadJson = () => {
    const json = JSON.stringify(toJsonResume(doc.resume), null, 2);
    downloadBlob(new Blob([json], { type: "application/json" }), `${filename}.json`);
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-blue">
      <div className="on-tint flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/15 px-5 py-3">
        <div className="flex items-center gap-1.5">
          {TEMPLATES.map((template) => {
            const isActive = template.id === doc.template;
            return (
              <button
                key={template.id}
                type="button"
                title={template.description}
                aria-pressed={isActive}
                onClick={() => setTemplate(template.id)}
                className={`btn ${
                  isActive
                    ? "bg-white text-blue-deep"
                    : "border-white/25 text-white/75 hover:border-white/50 hover:text-white"
                }`}
              >
                {template.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="eyebrow text-white/45">Ink</span>
          <div className="flex items-center gap-1.5">
            {ACCENTS.map((accent) => (
              <button
                key={accent}
                type="button"
                aria-label={`Ink ${accent}`}
                aria-pressed={doc.accent === accent}
                onClick={() => setAccent(accent)}
                style={{ backgroundColor: accent }}
                className={`h-[18px] w-[18px] rounded-[2px] ring-offset-2 ring-offset-blue transition-all ${
                  doc.accent === accent ? "ring-2 ring-white" : "ring-1 ring-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-9">
        {/* Width-led on narrow screens, height-led once there is room, so the
            sheet never grows past its own frame. */}
        <div
          className="relative mx-auto w-full max-w-full lg:h-full lg:w-auto"
          style={{ aspectRatio: "210 / 297" }}
        >
          <CropMarks />

          <div className="absolute inset-0 overflow-hidden bg-paper shadow-[0_24px_60px_-18px_rgba(0,0,0,0.5)] ring-1 ring-white/20">
            {/* Bled past the frame by an even 2%: that crops the PDF viewer's own
                page border and gutter without reaching the printed margin. */}
            {instance.url && !instance.error && (
              <iframe
                key={doc.template}
                title="Résumé preview"
                src={`${instance.url}#toolbar=0&navpanes=0&statusbar=0&view=FitH`}
                // An iframe carries a default 300x150 size, so the bleed has to be
                // expressed as width/height rather than insets alone.
                style={{
                  position: "absolute",
                  top: "-2%",
                  left: "-2%",
                  width: "104%",
                  height: "104%",
                  border: "none",
                }}
              />
            )}

            {instance.loading && (
              <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden bg-blue/15">
                <div className="press-sweep h-full w-full bg-white" />
              </div>
            )}

            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="max-w-[300px] text-center">
                  <p className="font-display text-[19px] font-bold leading-tight text-ink">
                    A blank sheet.
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/60">
                    Fill in Basics, import a JSON Resume file, or start from a worked
                    example and edit over it.
                  </p>
                  <button type="button" className="btn btn-paper mt-4" onClick={onLoadExample}>
                    Load example
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/15 bg-ink px-5 py-3">
        <p className="flex items-center gap-2.5">
          <span className="bg-mist px-1.5 py-[3px] font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
            Proof
          </span>
          <span className="font-mono text-[10.5px] text-white/50">
            {instance.error
              ? "Could not compose this résumé"
              : instance.loading
                ? "Composing…"
                : `${templateById(doc.template).name} · A4 · saved on this device`}
          </span>
        </p>

        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-quiet" onClick={downloadJson}>
            <Braces size={13} strokeWidth={2} />
            JSON
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={downloadPdf}
            disabled={!instance.blob || Boolean(instance.error)}
          >
            <Download size={13} strokeWidth={2} />
            Download PDF
          </button>
        </div>
      </div>
    </section>
  );
}

/** Printer's corner marks — the sheet reads as stock on a press bed. */
function CropMarks() {
  const corners = [
    "left-0 top-0 border-l border-t",
    "right-0 top-0 border-r border-t",
    "left-0 bottom-0 border-l border-b",
    "right-0 bottom-0 border-r border-b",
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute -inset-[13px]">
      {corners.map((corner) => (
        <span
          key={corner}
          className={`absolute h-4 w-4 border-white/40 ${corner}`}
        />
      ))}
    </div>
  );
}
