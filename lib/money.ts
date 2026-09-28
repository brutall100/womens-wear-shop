export function formatEur(cents: number): string {
  return new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("lt-LT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Vilnius",
  }).format(date);
}

/** 18900 -> "189,00" for price inputs. */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function parseEuroToCents(input: string): number | null {
  const cleaned = input.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [euros, fraction = ""] = cleaned.split(".");
  const cents = (fraction + "00").slice(0, 2);
  const value = Number(euros) * 100 + Number(cents);
  if (!Number.isSafeInteger(value) || value < 0) return null;
  return value;
}

export function slugify(input: string): string {
  const map: Record<string, string> = {
    ą: "a",
    č: "c",
    ę: "e",
    ė: "e",
    į: "i",
    š: "s",
    ų: "u",
    ū: "u",
    ž: "z",
  };
  const replaced = Array.from(input.toLowerCase())
    .map((char) => map[char] ?? char)
    .join("")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return replaced
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Lithuanian plural: plural(1, ["modelis", "modeliai", "modelių"]) -> "modelis". */
export function plural(n: number, [one, few, many]: [string, string, string]): string {
  const lastTwo = n % 100;
  const last = n % 10;
  if (last === 1 && lastTwo !== 11) return one;
  if (last >= 2 && last <= 9 && (lastTwo < 12 || lastTwo > 19)) return few;
  return many;
}
