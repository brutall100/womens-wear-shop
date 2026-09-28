import type { ReactNode } from "react";
import { fontClasses } from "@/app/fonts";
import { asset } from "@/lib/routes";
import { LiveBackground } from "./live-background";
import { UiEffects } from "./ui-effects";

/** <html> for both modes. The theme script runs before paint, so there is no light/dark flash. */
export function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="lt" className={fontClasses} suppressHydrationWarning>
      <head>
        <script src={asset("/js/theme-init.js")} />
      </head>
      <body>
        <LiveBackground />
        <UiEffects />
        {children}
      </body>
    </html>
  );
}
