/**
 * Shrinks a photo in the browser before it is saved: max 1200 px wide, WebP when the browser can encode it.
 * Drawing on a canvas also drops EXIF data (phone model, date, GPS).
 */
export async function shrinkImage(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Nuotraukos apdoroti nepavyko.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await encode("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await encode("image/jpeg");
  if (!jpeg) throw new Error("Nuotraukos apdoroti nepavyko.");
  return jpeg;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Nuotraukos perskaityti nepavyko."));
    reader.readAsDataURL(blob);
  });
}
