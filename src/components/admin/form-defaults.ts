import type { FormState } from "@/lib/types";

/**
 * Default-value helpers for admin forms. After a failed action the form
 * shows the values the user submitted; otherwise the stored entity values.
 */
export function formDefaults(state: FormState) {
  const v = state.values;
  return {
    /** Text, select and number inputs. */
    text: (name: string, fallback: string | number | null | undefined): string =>
      v?.[name] ?? (fallback === null || fallback === undefined ? "" : String(fallback)),
    /** Checkboxes: absent from a submission means unchecked. */
    checked: (name: string, fallback: boolean): boolean => (v ? v[name] === "on" : fallback),
  };
}
