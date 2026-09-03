"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FileText, PanelLeft } from "lucide-react";
import { FormPanel } from "@/components/FormPanel";
import { ImportDialog } from "@/components/ImportDialog";
import { SectionRail, SectionStrip, type PanelId } from "@/components/SectionRail";
import { TopBar } from "@/components/TopBar";
import { sampleResume } from "@/lib/sample";
import { useActiveDoc, useHydratedWorkspace, useWorkspace } from "@/lib/store";

const Press = dynamic(() => import("@/components/Press").then((m) => m.Press), {
  ssr: false,
  loading: () => <PressPlaceholder />,
});

export default function Page() {
  const hydrated = useHydratedWorkspace();
  const doc = useActiveDoc();
  const replaceResume = useWorkspace((s) => s.replaceResume);

  const [panel, setPanel] = useState<PanelId>("basics");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [importing, setImporting] = useState(false);

  if (!hydrated || !doc) return <Booting />;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar doc={doc} onImport={() => setImporting(true)} />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[214px] shrink-0 overflow-y-auto border-r border-white/10 bg-ink scroll-slim lg:block">
          <SectionRail resume={doc.resume} active={panel} onSelect={setPanel} />
        </aside>

        <main
          className={`min-w-0 flex-1 flex-col bg-bone ${
            view === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          <SectionStrip
            resume={doc.resume}
            active={panel}
            onSelect={setPanel}
            className="lg:hidden"
          />
          <div className="min-h-0 flex-1 overflow-y-auto scroll-slim">
            <FormPanel resume={doc.resume} panel={panel} />
          </div>
        </main>

        <section
          className={`min-h-0 w-full shrink-0 lg:block lg:w-[54%] lg:max-w-[860px] ${
            view === "edit" ? "hidden" : "block"
          }`}
        >
          <Press
            doc={doc}
            onLoadExample={() => replaceResume(sampleResume(), "Ada Lovelace")}
          />
        </section>
      </div>

      <nav className="flex shrink-0 border-t border-white/10 bg-ink lg:hidden">
        {(
          [
            { id: "edit", label: "Edit", icon: PanelLeft },
            { id: "preview", label: "Proof", icon: FileText },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => setView(id)}
            className={`flex flex-1 items-center justify-center gap-2 py-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              view === id ? "text-white" : "text-white/40"
            }`}
          >
            <Icon size={14} strokeWidth={2} />
            {label}
          </button>
        ))}
      </nav>

      {importing && (
        <ImportDialog
          onClose={() => setImporting(false)}
          onLoad={(resume, name) => {
            replaceResume(resume, name);
            setPanel("basics");
          }}
        />
      )}
    </div>
  );
}

function Booting() {
  return (
    <div className="flex h-dvh items-center justify-center bg-ink">
      <p className="flex items-center gap-2.5">
        <span aria-hidden className="h-4 w-4 bg-mist" />
        <span className="font-display text-[15px] font-extrabold tracking-[-0.02em] text-white">
          Resume<span className="text-white/45">Press</span>
        </span>
      </p>
    </div>
  );
}

function PressPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-blue">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/50">
        Warming the press…
      </p>
    </div>
  );
}
