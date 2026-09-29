import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CONTENT_GROUPS } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { ContentForm } from "@/components/admin/content-form";

export const metadata: Metadata = { title: "Page content" };

export default async function ContentAdminPage() {
  const blocks = await prisma.contentBlock.findMany({ orderBy: [{ sortOrder: "asc" }, { key: "asc" }] });
  const groupKeys = [...Object.keys(CONTENT_GROUPS), ...blocks.map((b) => b.group).filter((g) => !(g in CONTENT_GROUPS))];
  const groups = [...new Set(groupKeys)]
    .map((key) => ({ key, label: CONTENT_GROUPS[key] ?? key, blocks: blocks.filter((b) => b.group === key) }))
    .filter((g) => g.blocks.length > 0);

  return (
    <>
      <PageHeader
        title="Page content"
        description="Headline and paragraph text used across the public pages. Arabic fields fall back to English when left empty."
      />
      <ContentForm groups={groups} />
    </>
  );
}
