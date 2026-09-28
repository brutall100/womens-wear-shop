import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { ADMIN_COOKIE, adminAccess, DEV_PASSWORD, verifyAdminToken } from "@/lib/auth";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Prisijungimas" };

export default async function LoginPage() {
  const jar = await cookies();
  if (verifyAdminToken(jar.get(ADMIN_COOKIE)?.value)) redirect(routes.adminProducts);
  const access = adminAccess();
  return (
    <LoginForm
      disabled={access === "locked"}
      hint={
        access === "dev-default" ? (
          <p className="notice">
            Kūrimo režimas: slaptažodis <span className="price">{DEV_PASSWORD}</span>. Viešai svetainei nustatykite ADMIN_PASSWORD_HASH.
          </p>
        ) : access === "locked" ? (
          <p className="notice notice--danger">
            Prisijungimas išjungtas, nes nenustatytas <strong>ADMIN_PASSWORD_HASH</strong>. Sukurkite jį komanda{" "}
            <span className="price">npm run hash-password</span> ir įrašykite į .env.
          </p>
        ) : null
      }
    />
  );
}
