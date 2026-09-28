import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { addProductImage, getProduct } from "@/lib/db";

export const runtime = "nodejs";

function sniff(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  if (buffer.length > 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
  if (buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "webp";
  }
  return null;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await context.params;
  if (!getProduct(id)) return NextResponse.json({ error: "Prekė nerasta." }, { status: 404 });
  const form = await request.formData();
  const files = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length === 0) return NextResponse.json({ error: "Pasirinkite nuotrauką." }, { status: 400 });
  const dir = path.join(process.cwd(), "public", "uploads");
  mkdirSync(dir, { recursive: true });
  const saved = [];
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Nuotrauka didesnė nei 5 MB." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = sniff(buffer);
    if (!ext) return NextResponse.json({ error: "Tinka JPG, PNG arba WEBP." }, { status: 400 });
    const filename = `${randomUUID()}.${ext}`;
    writeFileSync(path.join(dir, filename), buffer);
    saved.push(addProductImage(id, `/uploads/${filename}`));
  }
  return NextResponse.json({ images: saved });
}
