import { CircleAlert, CircleCheck } from "lucide-react";

type Props = {
  saved?: string;
  deleted?: string;
  error?: string;
  savedText?: string;
  deletedText?: string;
};

/** One-off status banner driven by ?saved=1, ?deleted=1 or ?error=... */
export function Flash({ saved, deleted, error, savedText = "Saved.", deletedText = "Deleted." }: Props) {
  if (error) {
    return (
      <div role="alert" className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
        <CircleAlert className="h-5 w-5 shrink-0" />
        {error}
      </div>
    );
  }
  if (saved || deleted) {
    return (
      <div role="status" className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        <CircleCheck className="h-5 w-5 shrink-0" />
        {saved ? savedText : deletedText}
      </div>
    );
  }
  return null;
}
