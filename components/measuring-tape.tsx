import type { CSSProperties, ReactNode } from "react";

const MARKS = Array.from({ length: 48 }, (_, index) => index + 1);

/** The top bar looks like a tailor's measuring tape. */
export function MeasuringTape({ children }: { children: ReactNode }) {
  return (
    <div className="tape">
      <div className="tape__numbers" aria-hidden="true">
        {MARKS.map((mark) => (
          <span key={mark} style={{ "--i": mark } as CSSProperties}>
            {mark}
          </span>
        ))}
      </div>
      <p className="tape__label">{children}</p>
    </div>
  );
}
