"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/actions/auth";
import { EMPTY_FORM_STATE } from "@/lib/types";
import { FormMessage, TextField } from "./fields";
import { SubmitButton } from "./submit-button";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, EMPTY_FORM_STATE);
  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      <TextField label="Current password" name="currentPassword" type="password" autoComplete="current-password" required error={state.errors?.currentPassword} />
      <TextField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 10 characters with letters and numbers."
        error={state.errors?.newPassword}
      />
      <TextField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required error={state.errors?.confirmPassword} />
      <SubmitButton label="Update password" pendingLabel="Updating…" pending={pending} />
    </form>
  );
}
