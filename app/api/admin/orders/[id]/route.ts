import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getOrder, setOrderStatus } from "@/lib/db";
import { STATUS_LABEL } from "@/lib/labels";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await context.params;
  if (!getOrder(id)) return NextResponse.json({ error: "Užsakymas nerastas." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = typeof body?.status === "string" ? body.status : "";
  if (!STATUS_LABEL[status]) return NextResponse.json({ error: "Nežinoma būsena." }, { status: 400 });
  setOrderStatus(id, status);
  return NextResponse.json({ ok: true });
}
