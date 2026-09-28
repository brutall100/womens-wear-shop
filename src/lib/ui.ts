export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-cream hover:bg-clay border border-transparent disabled:hover:bg-ink",
  secondary:
    "bg-transparent text-ink border border-ink/25 hover:border-ink hover:bg-ink/[0.03]",
  ghost: "bg-transparent text-muted border border-transparent hover:text-ink",
  danger:
    "bg-transparent text-danger border border-danger/30 hover:bg-danger hover:text-white",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[11px]",
  md: "px-5 py-2.5 text-xs",
  lg: "px-7 py-3.5 text-xs",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra?: string,
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 uppercase tracking-[0.14em] font-medium transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    extra,
  );
}
