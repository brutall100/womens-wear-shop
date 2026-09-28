import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function uploadDir() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "./uploads");
}

export async function saveImage(file: File): Promise<string> {
  const ext = EXTENSIONS[file.type];
  if (!ext) throw new Error(`Netinkamas failo formatas: ${file.name}. Leidžiami JPG, PNG, WEBP, AVIF.`);
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`Failas per didelis: ${file.name} (maks. 8 MB).`);

  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.${ext}`;
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function deleteImage(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const name = path.basename(url);
  await unlink(path.join(/*turbopackIgnore: true*/ uploadDir(), name)).catch(() => {});
}
