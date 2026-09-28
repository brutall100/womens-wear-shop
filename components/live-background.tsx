"use client";

import { useEffect, useState, type CSSProperties } from "react";

type Point = [number, number];
type NotionKind = "button" | "pin" | "needle" | "thread";

type Notion = {
  id: number;
  kind: NotionKind;
  style: CSSProperties;
};

/** The stitch line: two curves across the lower part of the screen, cut into dashes. */
const CURVES: Array<[Point, Point, Point, Point]> = [
  [
    [-40, 700],
    [260, 590],
    [470, 820],
    [760, 680],
  ],
  [
    [760, 680],
    [1050, 540],
    [1180, 560],
    [1480, 630],
  ],
];

function onCurve([p0, p1, p2, p3]: [Point, Point, Point, Point], t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

const DASHES_PER_CURVE = 28;
const STITCH: Array<[Point, Point]> = CURVES.flatMap((curve) =>
  Array.from({ length: DASHES_PER_CURVE }, (_, index) => {
    const from = index / DASHES_PER_CURVE;
    const to = from + 0.55 / DASHES_PER_CURVE;
    return [onCurve(curve, from), onCurve(curve, to)] as [Point, Point];
  }),
);

const TONES = ["var(--accent)", "var(--accent-2)", "var(--surface)", "var(--muted)"];

function between(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Random size, speed, delay, sway and spin, so the notions never move in step. */
function makeNotions(count: number): Notion[] {
  return Array.from({ length: count }, (_, id) => {
    const roll = Math.random();
    const kind: NotionKind = roll < 0.5 ? "button" : roll < 0.72 ? "thread" : roll < 0.88 ? "pin" : "needle";
    const size = kind === "button" ? between(12, 30) : kind === "thread" ? between(60, 110) : between(26, 42);
    const fall = between(26, 54);
    const base = between(-180, 180);
    const spin = kind === "button" ? between(160, 320) : kind === "thread" ? between(50, 110) : between(24, 60);
    return {
      id,
      kind,
      style: {
        "--x": `${between(-2, 98).toFixed(2)}%`,
        "--size": `${size.toFixed(1)}px`,
        "--fall": `${fall.toFixed(1)}s`,
        "--delay": `${(-Math.random() * fall).toFixed(1)}s`,
        "--sway": `${between(8, 34).toFixed(0)}px`,
        "--sway-time": `${between(3.5, 8).toFixed(1)}s`,
        "--rot-from": `${(base - spin / 2).toFixed(0)}deg`,
        "--rot-to": `${(base + spin / 2).toFixed(0)}deg`,
        "--tone": TONES[Math.floor(Math.random() * TONES.length)],
        "--alpha": between(0.5, 0.85).toFixed(2),
      } as CSSProperties,
    };
  });
}

export function LiveBackground() {
  const [notions, setNotions] = useState<Notion[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phone = window.matchMedia("(max-width: 640px)");
    const build = () => setNotions(reduce.matches ? [] : makeNotions(phone.matches ? 9 : 18));
    build();
    reduce.addEventListener("change", build);
    phone.addEventListener("change", build);
    return () => {
      reduce.removeEventListener("change", build);
      phone.removeEventListener("change", build);
    };
  }, []);

  return (
    <div className="live-bg" aria-hidden="true">
      <div className="live-bg__grid" />
      <div className="live-bg__glow live-bg__glow--lamp" />
      <div className="live-bg__glow live-bg__glow--sage" />
      <svg className="live-bg__stitch" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        {STITCH.map(([from, to], index) => (
          <line
            key={index}
            className="stitch-dash"
            x1={from[0].toFixed(1)}
            y1={from[1].toFixed(1)}
            x2={to[0].toFixed(1)}
            y2={to[1].toFixed(1)}
            style={{ "--i": index } as CSSProperties}
          />
        ))}
      </svg>
      {notions.map((notion) => (
        <span key={notion.id} className={`notion notion--${notion.kind}`} style={notion.style}>
          <span className="notion__body">
            {notion.kind === "thread" ? (
              <svg viewBox="0 0 120 50">
                <path d="M4 30 C 14 6, 30 44, 42 24 S 62 4, 70 22 C 76 36, 60 42, 62 28 C 64 14, 92 8, 116 26" />
              </svg>
            ) : null}
          </span>
        </span>
      ))}
    </div>
  );
}
