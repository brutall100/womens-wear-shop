import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { deleteProduct, updateProduct } from "@/lib/db";
import { parseProduct } from "@/lib/product-input";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await context.params;
  const parsed = parseProduct(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const product = updateProduct(id, parsed);
  if (!product) return NextResponse.json({ error: "Prekė nerasta." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await context.params;
  deleteProduct(id);
  return NextResponse.json({ ok: true });
}
