"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, FilePlus2, FolderOpen, Trash2, Upload } from "lucide-react";
import { useWorkspace, type Doc } from "@/lib/store";

type Props = {
  doc: Doc;
  onImport: () => void;
};

export function TopBar({ doc, onImport }: Props) {
  const docs = useWorkspace((s) => s.docs);
  const renameDoc = useWorkspace((s) => s.renameDoc);
  const createDoc = useWorkspace((s) => s.createDoc);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-30 flex h-12 shrink-0 items-center gap-3 border-b border-white/10 bg-ink px-4 sm:px-5">
      <Wordmark />

      <span aria-hidden className="hidden h-5 w-px bg-white/15 sm:block" />

      <input
        aria-label="Résumé name"
        value={doc.name}
        onChange={(event) => renameDoc(doc.id, event.target.value)}
        onBlur={() => {
          if (!doc.name.trim()) renameDoc(doc.id, "Untitled résumé");
        }}
        className="min-w-0 flex-1 truncate rounded-[3px] bg-transparent px-2 py-1 text-[14px] text-white/90 transition-colors hover:bg-white/5 focus:bg-white/10 focus:outline-none"
      />

      <div className="flex items-center gap-2">
        <button type="button" className="btn btn-quiet" onClick={onImport}>
          <Upload size={13} strokeWidth={2} />
          <span className="hidden sm:inline">Import JSON</span>
        </button>

        <button type="button" className="btn btn-quiet" onClick={() => createDoc()}>
          <FilePlus2 size={13} strokeWidth={2} />
          <span className="hidden sm:inline">New</span>
        </button>

        <div className="relative">
          <button
            type="button"
            className="btn btn-quiet"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <FolderOpen size={13} strokeWidth={2} />
            <span className="tabular-nums">{docs.length}</span>
          </button>
          {menuOpen && <DocsMenu onClose={() => setMenuOpen(false)} activeId={doc.id} />}
        </div>
      </div>
    </header>
  );
}

function Wordmark() {
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <span aria-hidden className="h-4 w-4 bg-mist" />
      <span className="font-display text-[15px] font-extrabold tracking-[-0.02em] text-white">
        Resume<span className="text-white/45">Press</span>
      </span>
    </div>
  );
}

function DocsMenu({ activeId, onClose }: { activeId: string; onClose: () => void }) {
  const docs = useWorkspace((s) => s.docs);
  const selectDoc = useWorkspace((s) => s.selectDoc);
  const deleteDoc = useWorkspace((s) => s.deleteDoc);
  const duplicateDoc = useWorkspace((s) => s.duplicateDoc);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      className="absolute right-0 top-[calc(100%+9px)] w-[286px] overflow-hidden rounded-[4px] border border-bone-3 bg-bone shadow-[0_18px_40px_-12px_rgba(18,19,43,0.55)]"
    >
      <p className="eyebrow border-b border-bone-3/70 px-4 py-3 text-ink/45">
        Saved on this device
      </p>
      <ul className="max-h-[320px] overflow-y-auto scroll-slim">
        {docs.map((entry) => (
          <li
            key={entry.id}
            className="group flex items-center gap-1 border-b border-bone-3/40 last:border-0"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                selectDoc(entry.id);
                onClose();
              }}
              className="flex min-w-0 flex-1 items-center gap-2.5 px-4 py-2.5 text-left hover:bg-bone-2"
            >
              <Check
                size={13}
                strokeWidth={2.5}
                className={entry.id === activeId ? "text-ink" : "text-transparent"}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-ink">{entry.name}</span>
                <span className="block font-mono text-[10px] text-ink/40">
                  {new Date(entry.updatedAt).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
            </button>
            <div className="flex shrink-0 items-center gap-0.5 pr-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                aria-label={`Duplicate ${entry.name}`}
                title="Duplicate"
                onClick={() => duplicateDoc(entry.id)}
                className="rounded-[3px] p-1.5 text-ink/45 hover:bg-bone-3/60 hover:text-ink"
              >
                <Copy size={13} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label={`Delete ${entry.name}`}
                title="Delete"
                onClick={() => deleteDoc(entry.id)}
                className="rounded-[3px] p-1.5 text-ink/45 hover:bg-bone-3/60 hover:text-ink"
                disabled={docs.length === 1}
              >
                <Trash2 size={13} strokeWidth={1.75} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
