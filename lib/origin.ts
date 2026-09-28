export function appOrigin(request: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const hostHeader = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protoHeader = request.headers.get("x-forwarded-proto") ?? "http";
  if (hostHeader) {
    const host = hostHeader.split(",")[0]?.trim();
    const proto = protoHeader.split(",")[0]?.trim() || "http";
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

/** Used to limit login attempts per visitor. */
export function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export function formToRecord(form: FormData): Record<string, string> {
  const record: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") record[key] = value;
  }
  return record;
}

/** Order stamps are 16 hex characters. */
export function isStamp(value: string): boolean {
  return /^[a-f0-9]{16}$/.test(value);
}
