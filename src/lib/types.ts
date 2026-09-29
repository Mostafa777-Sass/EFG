export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /**
   * Submitted text values, echoed back when an action fails. React 19 resets a
   * form after its action runs, so forms use these as defaultValue to keep
   * what the user typed.
   */
  values?: Record<string, string>;
};

export const EMPTY_FORM_STATE: FormState = {};
