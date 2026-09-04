"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  emptyItem,
  emptyResume,
  ResumeSchema,
  type ArraySectionId,
  type Resume,
} from "./schema";
import { TEMPLATE_IDS, type TemplateId } from "@/templates";

/**
 * Everything lives in the browser. `persist` writes the whole workspace to
 * localStorage on every change, so there is no save button and no server.
 */

export const ACCENTS = [
  "#12132B",
  "#2B3AC4",
  "#B0233F",
  "#1B6A4E",
  "#7A3FA8",
  "#B4531A",
] as const;

export type Doc = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  template: TemplateId;
  accent: string;
  resume: Resume;
  /**
   * PDF-only section header overrides, keyed by section id ("work",
   * "education", …) plus "profile" for the summary block. Deliberately kept
   * outside `resume`: the JSON Resume export must stay in the schema's own
   * vocabulary, so a renamed "Experience" heading never leaks into the file.
   * A missing or blank key falls back to the built-in English title.
   */
  sectionTitles: Record<string, string>;
};

type Workspace = {
  docs: Doc[];
  activeId: string | null;
};

type Actions = {
  createDoc: (seed?: { name?: string; resume?: Resume }) => string;
  duplicateDoc: (id: string) => void;
  deleteDoc: (id: string) => void;
  renameDoc: (id: string, name: string) => void;
  selectDoc: (id: string) => void;

  patchBasics: (patch: Record<string, unknown>) => void;
  patchLocation: (patch: Record<string, string>) => void;
  addProfile: () => void;
  patchProfile: (index: number, patch: Record<string, string>) => void;
  removeProfile: (index: number) => void;

  addItem: (section: ArraySectionId) => void;
  patchItem: (section: ArraySectionId, index: number, patch: Record<string, unknown>) => void;
  removeItem: (section: ArraySectionId, index: number) => void;
  moveItem: (section: ArraySectionId, index: number, delta: -1 | 1) => void;

  setTemplate: (template: TemplateId) => void;
  setAccent: (accent: string) => void;
  setSectionTitle: (id: string, title: string) => void;
  replaceResume: (resume: Resume, name?: string) => void;
};

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const makeDoc = (seed?: { name?: string; resume?: Resume }): Doc => ({
  id: newId(),
  name: seed?.name?.trim() || "Untitled résumé",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  template: "ledger",
  accent: ACCENTS[0],
  resume: seed?.resume ?? emptyResume(),
  sectionTitles: {},
});

export const useWorkspace = create<Workspace & Actions>()(
  persist(
    (set) => {
      /** Apply a mutation to the active document and stamp `updatedAt`. */
      const editActive = (mutate: (doc: Doc) => void) =>
        set((state) => {
          const index = state.docs.findIndex((d) => d.id === state.activeId);
          if (index === -1) return state;
          const doc = structuredClone(state.docs[index]);
          mutate(doc);
          doc.updatedAt = Date.now();
          const docs = [...state.docs];
          docs[index] = doc;
          return { docs };
        });

      const editResume = (mutate: (resume: Resume) => void) =>
        editActive((doc) => mutate(doc.resume));

      return {
        docs: [],
        activeId: null,

        createDoc: (seed) => {
          const doc = makeDoc(seed);
          set((state) => ({ docs: [doc, ...state.docs], activeId: doc.id }));
          return doc.id;
        },

        duplicateDoc: (id) =>
          set((state) => {
            const source = state.docs.find((d) => d.id === id);
            if (!source) return state;
            const copy: Doc = {
              ...structuredClone(source),
              id: newId(),
              name: `${source.name} copy`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            return { docs: [copy, ...state.docs], activeId: copy.id };
          }),

        deleteDoc: (id) =>
          set((state) => {
            const docs = state.docs.filter((d) => d.id !== id);
            const activeId =
              state.activeId === id ? (docs[0]?.id ?? null) : state.activeId;
            return { docs, activeId };
          }),

        // Stores exactly what was typed, including "" mid-edit — the title
        // input applies the "Untitled résumé" fallback itself, on blur, so a
        // deleted title doesn't spring back before the next keystroke lands.
        renameDoc: (id, name) =>
          set((state) => ({
            docs: state.docs.map((d) =>
              d.id === id ? { ...d, name, updatedAt: Date.now() } : d,
            ),
          })),

        selectDoc: (id) => set({ activeId: id }),

        patchBasics: (patch) =>
          editResume((resume) => {
            Object.assign(resume.basics, patch);
          }),

        patchLocation: (patch) =>
          editResume((resume) => {
            Object.assign(resume.basics.location, patch);
          }),

        addProfile: () =>
          editResume((resume) => {
            resume.basics.profiles.push({ network: "", username: "", url: "" });
          }),

        patchProfile: (index, patch) =>
          editResume((resume) => {
            const profile = resume.basics.profiles[index];
            if (profile) Object.assign(profile, patch);
          }),

        removeProfile: (index) =>
          editResume((resume) => {
            resume.basics.profiles.splice(index, 1);
          }),

        addItem: (section) =>
          editResume((resume) => {
            (resume[section] as unknown[]).push(emptyItem(section));
          }),

        patchItem: (section, index, patch) =>
          editResume((resume) => {
            const item = (resume[section] as Record<string, unknown>[])[index];
            if (item) Object.assign(item, patch);
          }),

        removeItem: (section, index) =>
          editResume((resume) => {
            (resume[section] as unknown[]).splice(index, 1);
          }),

        moveItem: (section, index, delta) =>
          editResume((resume) => {
            const items = resume[section] as unknown[];
            const target = index + delta;
            if (target < 0 || target >= items.length) return;
            [items[index], items[target]] = [items[target], items[index]];
          }),

        setTemplate: (template) =>
          editActive((doc) => {
            doc.template = template;
          }),

        setAccent: (accent) =>
          editActive((doc) => {
            doc.accent = accent;
          }),

        setSectionTitle: (id, title) =>
          editActive((doc) => {
            if (title.trim()) doc.sectionTitles[id] = title;
            else delete doc.sectionTitles[id];
          }),

        replaceResume: (resume, name) =>
          editActive((doc) => {
            doc.resume = resume;
            if (name) doc.name = name;
          }),
      };
    },
    {
      name: "resume-press/workspace",
      version: 1,
      partialize: (state) => ({ docs: state.docs, activeId: state.activeId }),
      // Storage can hold résumés written by an older build, so every document
      // is re-parsed on the way in: the form assumes all schema keys exist.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Workspace>;
        const docs = (saved.docs ?? []).map((doc) => ({
          ...makeDoc(),
          ...doc,
          template: TEMPLATE_IDS.includes(doc.template) ? doc.template : "ledger",
          accent: doc.accent || ACCENTS[0],
          // A title left empty when the tab closed (before blur could apply
          // the fallback) shouldn't reload into a permanently blank field.
          name: doc.name?.trim() || "Untitled résumé",
          resume: ResumeSchema.parse(doc.resume ?? {}),
        }));
        const activeId = docs.some((d) => d.id === saved.activeId)
          ? saved.activeId!
          : (docs[0]?.id ?? null);
        return { ...current, docs, activeId };
      },
    },
  ),
);

/** The document currently open, or `null` before hydration. */
export const useActiveDoc = (): Doc | null =>
  useWorkspace((state) => state.docs.find((d) => d.id === state.activeId) ?? null);

/**
 * localStorage is read after the first paint, so the UI waits for this before
 * rendering anything document-shaped. Also guarantees one document exists.
 */
export function useHydratedWorkspace(): boolean {
  // The server has no storage, so its snapshot is always "not yet" and the
  // first client render matches it before the saved workspace is swapped in.
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => useWorkspace.persist?.hasHydrated() ?? true,
    () => false,
  );

  useEffect(() => {
    if (!hydrated) return;
    const { docs, createDoc } = useWorkspace.getState();
    if (!docs.length) createDoc();
  }, [hydrated]);

  return hydrated;
}

const subscribeToHydration = (onChange: () => void) =>
  useWorkspace.persist?.onFinishHydration(onChange) ?? (() => {});
