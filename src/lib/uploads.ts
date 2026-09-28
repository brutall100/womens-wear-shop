import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function uploadDir(): string {
  const configured = process.env.UPLOAD_DIR || "uploads";
  if (path.isAbsolute(configured)) return configured;
  return path.join(/* turbopackIgnore: true */ process.cwd(), configured);
}

export async function saveUploadedImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Leidžiami tik JPG, PNG, WEBP, AVIF arba GIF formatai.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Nuotrauka per didelė (maks. 8 MB).");

  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
