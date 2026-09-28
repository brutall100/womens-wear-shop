import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadDir } from "@/lib/uploads";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(_req: Request, ctx: RouteContext<"/uploads/[file]">) {
  const { file } = await ctx.params;
  const name = path.basename(file);
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type || name !== file) return new Response("Nerasta", { status: 404 });

  try {
    const data = await readFile(path.join(/*turbopackIgnore: true*/ uploadDir(), name));
    return new Response(data, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Nerasta", { status: 404 });
  }
}
