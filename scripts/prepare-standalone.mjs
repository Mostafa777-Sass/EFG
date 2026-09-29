// Completes the standalone build so `node .next/standalone/server.js` serves
// static assets too. Runs automatically at the end of `pnpm build`.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(root, ".next", "standalone");

try {
  await fs.access(standalone);
} catch {
  console.log("prepare-standalone: no .next/standalone folder, nothing to do");
  process.exit(0);
}

const copies = [
  [path.join(root, "public"), path.join(standalone, "public")],
  [path.join(root, ".next", "static"), path.join(standalone, ".next", "static")],
];

for (const [from, to] of copies) {
  await fs.rm(to, { recursive: true, force: true });
  await fs.cp(from, to, { recursive: true });
  console.log(`prepare-standalone: copied ${path.relative(root, from)} -> ${path.relative(root, to)}`);
}
