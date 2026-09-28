import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { uploadDir } from "@/lib/uploads";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(_req: NextRequest, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: segments } = await ctx.params;
  const dir = uploadDir();
  const filePath = path.join(dir, ...segments);

  if (!filePath.startsWith(dir + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const type = MIME[path.extname(filePath).toLowerCase()];
  if (!type) return new NextResponse("Not found", { status: 404 });

  try {
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
