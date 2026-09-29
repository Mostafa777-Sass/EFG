"use client";

import { useActionState } from "react";
import type { ContentBlock } from "@prisma/client";
import { saveContentBlocks } from "@/lib/actions/content";
import { EMPTY_FORM_STATE } from "@/lib/types";
import { FieldError, FormMessage } from "./fields";
import { SubmitButton } from "./submit-button";

type Group = { key: string; label: string; blocks: ContentBlock[] };

export function ContentForm({ groups }: { groups: Group[] }) {
  const [state, action, pending] = useActionState(saveContentBlocks, EMPTY_FORM_STATE);
  const e = state.errors ?? {};
  // Failed submissions keep what was typed; successful ones show the saved values.
  const v = state.ok ? undefined : state.values;

  return (
    <form action={action} className="space-y-8">
      <div className="sticky top-0 z-10 -mx-2 flex items-center justify-between gap-4 rounded-xl bg-mist-100/95 px-2 py-3 backdrop-blur">
        <FormMessage state={state} />
        <SubmitButton label="Save all content" pending={pending} className="ms-auto" />
      </div>

      {groups.map((group) => (
        <section key={group.key} className="rounded-2xl border border-mist-200 bg-white p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-navy-900">{group.label}</h2>
          <div className="mt-5 space-y-6">
            {group.blocks.map((block) => {
              const Field = block.multiline ? "textarea" : "input";
              const enName = `en:${block.key}`;
              const arName = `ar:${block.key}`;
              return (
                <div key={block.key} className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor={enName} className="label">
                      {block.label} <span className="font-normal text-ink-300">(English)</span>
                    </label>
                    <Field
                      id={enName}
                      name={enName}
                      defaultValue={v?.[enName] ?? block.textEn}
                      className="input"
                      {...(block.multiline ? { rows: 4 } : {})}
                    />
                    <FieldError error={e[enName]} />
                  </div>
                  <div>
                    <label htmlFor={arName} className="label">
                      {block.label} <span className="font-normal text-ink-300">(Arabic)</span>
                    </label>
                    <Field
                      id={arName}
                      name={arName}
                      defaultValue={v?.[arName] ?? block.textAr ?? ""}
                      dir="rtl"
                      className="input"
                      {...(block.multiline ? { rows: 4 } : {})}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <SubmitButton label="Save all content" pending={pending} />
    </form>
  );
}
