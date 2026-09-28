/**
 * Sugeneruoja neutralius prekių nuotraukų pakaitalus (SVG) kataloge `public/prekes`.
 * Naudojami tik demonstraciniams duomenims – tikros nuotraukos keliamos per /admin.
 *
 * Paleidimas: npx tsx scripts/generate-placeholders.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

type Palette = { from: string; to: string; shape: string; accent: string };

const PALETTES: Record<string, Palette> = {
  smelis: { from: "#f3ebe1", to: "#e2d3c3", shape: "#d9c6b2", accent: "#b9a290" },
  rose: { from: "#f7ebe7", to: "#e8cfc6", shape: "#dfbfb4", accent: "#c79a8b" },
  salavijas: { from: "#eef0ea", to: "#d5ddd0", shape: "#c6d1c0", accent: "#9aa892" },
  molis: { from: "#f6e9e3", to: "#dcbfb1", shape: "#cfae9e", accent: "#b06a53" },
  grafitas: { from: "#eceaea", to: "#cfcbc8", shape: "#bdb8b4", accent: "#8b8480" },
  naktis: { from: "#e7e8ec", to: "#c8cbd4", shape: "#b7bbc6", accent: "#7c8091" },
  kremas: { from: "#faf6f1", to: "#eee5d9", shape: "#e3d7c7", accent: "#c3b39f" },
  vynas: { from: "#f3e6e8", to: "#d9bcc2", shape: "#caa7af", accent: "#9c5c68" },
};

function drapeLines(count: number, color: string, width: number, height: number) {
  const lines: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = (width / (count + 1)) * (i + 1);
    const sway = (i % 2 === 0 ? 1 : -1) * (18 + i * 4);
    lines.push(
      `<path d="M${x} 0 C ${x + sway} ${height * 0.35}, ${x - sway} ${height * 0.7}, ${x} ${height}" stroke="${color}" stroke-width="1" fill="none" opacity="0.35" />`,
    );
  }
  return lines.join("\n    ");
}

function productSvg(paletteName: keyof typeof PALETTES, variant: number): string {
  const palette = PALETTES[paletteName];
  const width = 900;
  const height = 1200;
  const cx = width / 2 + (variant % 2 === 0 ? -40 : 40);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="34%" r="62%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer><feFuncA type="linear" slope="0.05" /></feComponentTransfer>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <rect width="${width}" height="${height}" fill="url(#glow)" />

  <g>
    ${drapeLines(7, palette.accent, width, height)}
  </g>

  <path d="M${cx} 250 C ${cx - 210} 430, ${cx - 250} 820, ${cx - 150} 1010 L ${cx + 150} 1010 C ${cx + 250} 820, ${cx + 210} 430, ${cx} 250 Z" fill="${palette.shape}" opacity="0.5" />
  <circle cx="${cx}" cy="205" r="62" fill="${palette.shape}" opacity="0.6" />
  <path d="M0 ${height - 150} C ${width * 0.3} ${height - 230}, ${width * 0.7} ${height - 70}, ${width} ${height - 170} L ${width} ${height} L 0 ${height} Z" fill="${palette.accent}" opacity="0.18" />

  <rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.5" />
</svg>
`;
}

function heroSvg(): string {
  const width = 1800;
  const height = 1100;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <defs>
    <linearGradient id="hbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f6efe6" />
      <stop offset="52%" stop-color="#e7d7c9" />
      <stop offset="100%" stop-color="#cbb3a3" />
    </linearGradient>
    <radialGradient id="hglow" cx="62%" cy="30%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <filter id="hgrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer><feFuncA type="linear" slope="0.045" /></feComponentTransfer>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#hbg)" />
  <rect width="${width}" height="${height}" fill="url(#hglow)" />

  <g opacity="0.4">
    ${drapeLines(11, "#b09984", width, height)}
  </g>

  <path d="M1180 120 C 940 360, 900 760, 1010 1100 L 1420 1100 C 1520 760, 1430 360, 1240 120 Z" fill="#dcc7b5" opacity="0.55" />
  <circle cx="1215" cy="150" r="78" fill="#d6bfab" opacity="0.6" />
  <path d="M0 880 C 420 800, 760 980, 1120 900 C 1440 830, 1640 920, 1800 880 L 1800 1100 L 0 1100 Z" fill="#b8987f" opacity="0.22" />

  <rect width="${width}" height="${height}" filter="url(#hgrain)" opacity="0.5" />
</svg>
`;
}

function editorialSvg(name: string, from: string, to: string, accent: string): string {
  const width = 1200;
  const height = 900;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <defs>
    <linearGradient id="${name}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}" />
      <stop offset="100%" stop-color="${to}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${name}-bg)" />
  <g opacity="0.45">
    ${drapeLines(9, accent, width, height)}
  </g>
  <circle cx="${width * 0.68}" cy="${height * 0.42}" r="${height * 0.3}" fill="${accent}" opacity="0.16" />
  <path d="M0 ${height * 0.78} C ${width * 0.35} ${height * 0.68}, ${width * 0.62} ${height * 0.9}, ${width} ${height * 0.74} L ${width} ${height} L 0 ${height} Z" fill="${accent}" opacity="0.2" />
</svg>
`;
}

const OUT_DIR = path.join(process.cwd(), "public", "prekes");
mkdirSync(OUT_DIR, { recursive: true });

const paletteNames = Object.keys(PALETTES) as Array<keyof typeof PALETTES>;
for (const name of paletteNames) {
  for (const variant of [1, 2]) {
    writeFileSync(
      path.join(OUT_DIR, `${name}-${variant}.svg`),
      productSvg(name, variant),
      "utf8",
    );
  }
}

writeFileSync(path.join(OUT_DIR, "hero.svg"), heroSvg(), "utf8");
writeFileSync(
  path.join(OUT_DIR, "istorija.svg"),
  editorialSvg("istorija", "#f4ece2", "#dcc9b6", "#ad8f76"),
  "utf8",
);
writeFileSync(
  path.join(OUT_DIR, "kolekcija.svg"),
  editorialSvg("kolekcija", "#eef0ea", "#cdd6c6", "#7f8f78"),
  "utf8",
);

console.log(
  `Sugeneruota ${paletteNames.length * 2 + 3} nuotraukų kataloge public/prekes`,
);
