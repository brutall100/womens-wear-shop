import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function getAdmin() {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  return user ? { id: user.id, email: user.email, name: user.name } : null;
}

/** Naudoti kiekviename admin puslapyje ir serverio veiksme. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/prisijungti");
  return admin;
}
