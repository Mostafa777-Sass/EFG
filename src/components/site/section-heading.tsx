import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "start" | "center";
  light?: boolean;
  as?: "h1" | "h2" | "h3";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "start",
  light = false,
  as: Tag = "h2",
  className,
}: Props) {
  const centered = align === "center";
  return (
    <div className={cn(centered && "mx-auto max-w-3xl text-center", className)}>
      {eyebrow && <p className={cn("eyebrow", light && "text-brand-gold")}>{eyebrow}</p>}
      <Tag
        className={cn(
          "mt-3 text-3xl sm:text-4xl",
          light ? "text-white" : "text-navy-900",
        )}
      >
        {title}
      </Tag>
      <div className={cn("red-rule", centered && "mx-auto")} />
      {intro && (
        <p className={cn("mt-5 text-base leading-relaxed sm:text-lg", light ? "text-white/75" : "text-ink-500")}>
          {intro}
        </p>
      )}
    </div>
  );
}
