"use client";

import { useEffect, useRef, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import { importResumeJson, type Resume } from "@/lib/schema";

type Props = {
  onClose: () => void;
  onLoad: (resume: Resume, name: string) => void;
};

type Pending = { resume: Resume; name: string; warnings: string[] };

/**
 * Accepts any jsonresume.org file, by upload or paste. Conformance is checked
 * with the JSON Resume project's own validator (`@jsonresume/schema`) — a
 * file that fails it still imports, since the failures are usually cosmetic
 * (an empty email, a placeholder URL), but the reader gets to see them first.
 */
export function ImportDialog({ onClose, onLoad }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const commit = (resume: Resume, name: string) => {
    onLoad(resume, name);
    onClose();
  };

  const load = (json: string) => {
    const result = importResumeJson(json);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    if (result.warnings.length > 0) {
      setPending({ resume: result.resume, name: result.name, warnings: result.warnings });
    } else {
      commit(result.resume, result.name);
    }
  };

  const readFile = async (file: File) => {
    setError("");
    load(await file.text());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Import a JSON Resume"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[560px] overflow-hidden rounded-[5px] bg-bone shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        {pending ? (
          <ConformancePanel
            pending={pending}
            onBack={() => setPending(null)}
            onImportAnyway={() => commit(pending.resume, pending.name)}
          />
        ) : (
          <>
            <header className="flex items-center justify-between border-b border-bone-3/70 px-5 py-4">
              <div>
                <h2 className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
                  Import a résumé
                </h2>
                <p className="mt-1 text-[13px] text-ink/55">
                  Any file that follows the JSON Resume schema. It replaces the résumé
                  you have open.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="rounded-[3px] p-1.5 text-ink/45 hover:bg-bone-2 hover:text-ink"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </header>

            <div className="px-5 py-5">
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void readFile(file);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                className="btn btn-paper"
                onClick={() => fileRef.current?.click()}
              >
                Choose a .json file
              </button>

              <p className="eyebrow mt-6 mb-2 text-ink/40">Or paste it</p>
              <textarea
                className="input font-mono text-[12px]"
                rows={8}
                spellCheck={false}
                placeholder='{ "basics": { "name": "Ada Lovelace" } }'
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setError("");
                }}
              />
              {error && <p className="mt-2 text-[13px] font-medium text-ink">{error}</p>}
            </div>

            <footer className="flex items-center justify-end gap-2 border-t border-bone-3/70 px-5 py-4">
              <button type="button" className="btn btn-paper" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!text.trim()}
                onClick={() => load(text)}
              >
                Import
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

/** Shown when the file parses but the official validator flags issues. */
function ConformancePanel({
  pending,
  onBack,
  onImportAnyway,
}: {
  pending: Pending;
  onBack: () => void;
  onImportAnyway: () => void;
}) {
  return (
    <>
      <header className="flex items-start gap-3 border-b border-bone-3/70 px-5 py-4">
        <TriangleAlert size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-ink" />
        <div>
          <h2 className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
            Not quite standard JSON Resume
          </h2>
          <p className="mt-1 text-[13px] text-ink/55">
            Checked against the JSON Resume project&apos;s own validator. This will
            still import — nothing here is a dead end.
          </p>
        </div>
      </header>

      <div className="max-h-[280px] overflow-y-auto scroll-slim px-5 py-4">
        <ul className="space-y-2">
          {pending.warnings.map((warning, i) => (
            <li
              key={i}
              className="rounded-[3px] border border-bone-3 bg-bone-2/50 px-3 py-2 font-mono text-[11.5px] text-ink/70"
            >
              {warning}
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-bone-3/70 px-5 py-4">
        <button type="button" className="btn btn-paper" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={onImportAnyway}>
          Import anyway
        </button>
      </footer>
    </>
  );
}
