import type { ReactNode } from "react";
import { AdminNav } from "./admin-nav";

export function AdminShell({ notice, children }: { notice?: ReactNode; children: ReactNode }) {
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#valdymas">
        Pereiti prie turinio
      </a>
      <AdminNav />
      <main id="valdymas" className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        {notice}
        {children}
      </main>
    </div>
  );
}
