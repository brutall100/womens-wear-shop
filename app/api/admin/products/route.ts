import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createProduct } from "@/lib/db";
import { parseProduct } from "@/lib/product-input";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = parseProduct(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const product = createProduct(parsed);
  return NextResponse.json({ product });
}
