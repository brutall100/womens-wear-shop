const LT_MAP: Record<string, string> = {
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

/** „Vasarinė suknelė ŽALIA“ -> „vasarine-suknele-zalia“ */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (ch) => LT_MAP[ch] ?? ch)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Prideda skaitinę galūnę, kol nuoroda tampa unikali. */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "preke";
  let candidate = root;
  let counter = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${counter}`;
    counter += 1;
  }
  return candidate;
}
