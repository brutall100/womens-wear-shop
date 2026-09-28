import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getOrder, setOrderStatus } from "@/lib/db";
import { STATUS_LABEL } from "@/lib/labels";
import { formToRecord } from "@/lib/origin";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await context.params;
  const order = getOrder(id);
  if (!order) return NextResponse.json({ error: "Užsakymas nerastas." }, { status: 404 });
  const status = formToRecord(await request.formData()).status ?? "";
  if (!STATUS_LABEL[status]) return NextResponse.json({ error: "Nežinoma būsena." }, { status: 400 });
  setOrderStatus(id, status);
  return NextResponse.redirect(new URL(`/admin/uzsakymai/${id}`, request.url), 303);
}
