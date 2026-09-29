import fs from "node:fs/promises";
import path from "node:path";
import { resolveUploadPath } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

/** Serves admin-uploaded images from UPLOAD_DIR (outside the build output). */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const abs = resolveUploadPath(segments.join("/"));
  if (!abs) return new Response("Not found", { status: 404 });

  const type = CONTENT_TYPES[path.extname(abs).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const data = await fs.readFile(abs);
    return new Response(new Uint8Array(data.buffer, data.byteOffset, data.byteLength), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(data.byteLength),
        // File names are random, so they can be cached forever.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
