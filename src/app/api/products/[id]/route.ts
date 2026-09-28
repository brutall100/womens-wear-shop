import { NextResponse } from "next/server";
import { getDb, Product } from "@/lib/db";

// GET /api/products/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM products WHERE id = ? OR slug = ?")
      .get(id, id) as Record<string, unknown> | undefined;

    if (!row) {
      return NextResponse.json(
        { success: false, error: "Prekė nerasta" },
        { status: 404 }
      );
    }

    const product: Product = {
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      category: row.category as string,
      price: Number(row.price),
      originalPrice: row.originalPrice ? Number(row.originalPrice) : null,
      description: row.description as string,
      fabricDetails: row.fabricDetails as string,
      sizes: JSON.parse((row.sizes as string) || "[]"),
      colors: JSON.parse((row.colors as string) || "[]"),
      images: JSON.parse((row.images as string) || "[]"),
      inStock: Boolean(row.inStock),
      stockCount: Number(row.stockCount),
      featured: Boolean(row.featured),
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    };

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Klaida gaunant prekės duomenis" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Admin edit product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as
      | Record<string, unknown>
      | undefined;

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Prekė nerasta" },
        { status: 404 }
      );
    }

    const name = body.name !== undefined ? body.name : existing.name;
    const category = body.category !== undefined ? body.category : existing.category;
    const price = body.price !== undefined ? Number(body.price) : Number(existing.price);
    const originalPrice =
      body.originalPrice !== undefined
        ? body.originalPrice
          ? Number(body.originalPrice)
          : null
        : existing.originalPrice;
    const description =
      body.description !== undefined ? body.description : existing.description;
    const fabricDetails =
      body.fabricDetails !== undefined ? body.fabricDetails : existing.fabricDetails;
    const sizes =
      body.sizes !== undefined
        ? JSON.stringify(body.sizes)
        : (existing.sizes as string);
    const colors =
      body.colors !== undefined
        ? JSON.stringify(body.colors)
        : (existing.colors as string);
    const images =
      body.images !== undefined
        ? JSON.stringify(body.images)
        : (existing.images as string);
    const inStock =
      body.inStock !== undefined ? (body.inStock ? 1 : 0) : existing.inStock;
    const stockCount =
      body.stockCount !== undefined
        ? Number(body.stockCount)
        : Number(existing.stockCount);
    const featured =
      body.featured !== undefined ? (body.featured ? 1 : 0) : existing.featured;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE products SET
        name = ?,
        category = ?,
        price = ?,
        originalPrice = ?,
        description = ?,
        fabricDetails = ?,
        sizes = ?,
        colors = ?,
        images = ?,
        inStock = ?,
        stockCount = ?,
        featured = ?,
        updatedAt = ?
      WHERE id = ?
    `).run(
      name,
      category,
      price,
      originalPrice,
      description,
      fabricDetails,
      sizes,
      colors,
      images,
      inStock,
      stockCount,
      featured,
      now,
      id
    );

    return NextResponse.json({
      success: true,
      message: "Prekė sėkmingai atnaujinta",
    });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Nepavyko atnaujinti prekės" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Admin delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { success: false, error: "Prekė nerasta" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Prekė sėkmingai pašalinta",
    });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Nepavyko ištrinti prekės" },
      { status: 500 }
    );
  }
}
