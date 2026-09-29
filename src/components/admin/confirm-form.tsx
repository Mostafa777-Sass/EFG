"use client";

import type { ReactNode } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  children: ReactNode;
  className?: string;
};

/** A form that asks for confirmation before submitting (used for deletes). */
export function ConfirmForm({ action, message, children, className }: Props) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
