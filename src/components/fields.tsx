"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FieldDef } from "@/lib/sections";

/**
 * Form primitives. List-shaped values (highlights, keywords) keep a local
 * draft while focused so re-joining the array never moves the caret.
 */

type Props = {
  def: FieldDef;
  value: unknown;
  onChange: (value: string | string[]) => void;
};

function Label({ def, id }: { def: FieldDef; id: string }) {
  return (
    <label htmlFor={id} className="field-label flex items-baseline gap-2">
      <span>{def.label}</span>
      {def.hint && (
        <span className="normal-case tracking-normal text-ink/40">{def.hint}</span>
      )}
    </label>
  );
}

/** Splits on newlines; each line becomes one bullet. */
function BulletsInput({ def, value, onChange, id }: Props & { id: string }) {
  const items = Array.isArray(value) ? (value as string[]) : [];
  const joined = items.join("\n");
  const [draft, setDraft] = useState(joined);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(joined);
  }, [joined]);

  return (
    <textarea
      id={id}
      className="input"
      rows={Math.min(8, Math.max(3, items.length + 1))}
      placeholder={def.placeholder ?? "One achievement per line"}
      value={draft}
      onFocus={() => (focused.current = true)}
      onBlur={() => {
        focused.current = false;
        setDraft(joined);
      }}
      onChange={(event) => {
        setDraft(event.target.value);
        onChange(event.target.value.split("\n"));
      }}
    />
  );
}

/** Comma-separated single line, stored as an array. */
function TagsInput({ def, value, onChange, id }: Props & { id: string }) {
  const items = Array.isArray(value) ? (value as string[]) : [];
  const joined = items.join(", ");
  const [draft, setDraft] = useState(joined);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(joined);
  }, [joined]);

  return (
    <input
      id={id}
      className="input"
      placeholder={def.placeholder ?? "Comma separated"}
      value={draft}
      onFocus={() => (focused.current = true)}
      onBlur={() => {
        focused.current = false;
        setDraft(joined);
      }}
      onChange={(event) => {
        setDraft(event.target.value);
        onChange(event.target.value.split(",").map((part) => part.trim()));
      }}
    />
  );
}

export function Field({ def, value, onChange }: Props) {
  const id = useId();
  const text = typeof value === "string" ? value : "";

  return (
    <div className={def.span === 2 ? "col-span-2" : "col-span-2 sm:col-span-1"}>
      <Label def={def} id={id} />
      {def.kind === "textarea" ? (
        <textarea
          id={id}
          className="input"
          rows={3}
          placeholder={def.placeholder}
          value={text}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : def.kind === "bullets" ? (
        <BulletsInput def={def} value={value} onChange={onChange} id={id} />
      ) : def.kind === "tags" ? (
        <TagsInput def={def} value={value} onChange={onChange} id={id} />
      ) : (
        <input
          id={id}
          className="input"
          type={def.kind === "date" ? "text" : def.kind}
          inputMode={def.kind === "date" ? "numeric" : undefined}
          placeholder={def.kind === "date" ? "2021-06" : def.placeholder}
          value={text}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
