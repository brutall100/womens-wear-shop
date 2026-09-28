import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { deleteProductImage } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await context.params;
  deleteProductImage(id);
  return NextResponse.json({ ok: true });
}
