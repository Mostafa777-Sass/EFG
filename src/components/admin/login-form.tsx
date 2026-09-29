"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { EMPTY_FORM_STATE } from "@/lib/types";
import { FormMessage, TextField } from "./fields";
import { SubmitButton } from "./submit-button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, EMPTY_FORM_STATE);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={state.values?.next ?? next ?? ""} />
      <FormMessage state={state} />
      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="username"
        required
        dir="ltr"
        defaultValue={state.values?.email ?? ""}
        error={state.errors?.email}
      />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required error={state.errors?.password} />
      <SubmitButton label="Sign in" pendingLabel="Signing in…" className="w-full" pending={pending} />
    </form>
  );
}
