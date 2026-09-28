// Builds the static browser demo into `out/` (used by GitHub Pages).
// Works the same on Windows, macOS and Linux, so no `DEMO=1 next build` shell syntax is needed.
// Optional: PAGES_BASE_PATH=/repo-name when the site is served from a sub-folder.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const next = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const result = spawnSync(process.execPath, [next, "build"], {
  stdio: "inherit",
  env: { ...process.env, DEMO: "1" },
});

process.exit(result.status ?? 1);
