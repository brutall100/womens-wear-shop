"use client";

export function QuantityControl({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="h-8 w-8 rounded-full text-lg leading-none hover:bg-sand"
        aria-label="Sumažinti kiekį"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="h-8 w-8 rounded-full text-lg leading-none hover:bg-sand disabled:opacity-30"
        aria-label="Padidinti kiekį"
      >
        +
      </button>
    </div>
  );
}
