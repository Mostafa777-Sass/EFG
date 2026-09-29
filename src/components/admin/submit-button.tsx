"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { label: string; pendingLabel?: string; className?: string; pending?: boolean };

export function SubmitButton({ label, pendingLabel = "Saving…", className, pending: forced }: Props) {
  const status = useFormStatus();
  const pending = forced ?? status.pending;
  return (
    <button type="submit" disabled={pending} className={cn("btn-primary", className)}>
      {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {pending ? pendingLabel : label}
    </button>
  );
}
