import Image from "next/image";

export function ProductImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-sand to-[#e6d9c8] ${className}`}
        aria-label={alt}
      >
        <span className="font-serif text-4xl text-muted/60">{alt.charAt(0)}</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
