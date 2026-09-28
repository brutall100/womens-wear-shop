"use client";

export function ConfirmButton({
  message,
  ...props
}: { message: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      {...props}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    />
  );
}
