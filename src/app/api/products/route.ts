import { NextResponse } from "next/server";
import { getDb, Product } from "@/lib/db";

// GET /api/products - list products with optional category and search filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("q");
    const featured = searchParams.get("featured");

    const db = getDb();
    let query = "SELECT * FROM products WHERE 1=1";
    const params: (string | number)[] = [];

    if (category && category !== "Visi") {
      query += " AND category = ?";
      params.push(category);
    }

    if (featured === "true" || featured === "1") {
      query += " AND featured = 1";
    }

    if (search) {
      query += " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY featured DESC, createdAt DESC";

    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];

    const products: Product[] = rows.map((row) => ({
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
    }));

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: unknown) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Nepavyko gauti prekių sąrašo" },
      { status: 500 }
    );
  }
}

// POST /api/products - Admin adds new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      price,
      originalPrice,
      description,
      fabricDetails,
      sizes,
      colors,
      images,
      inStock = true,
      stockCount = 10,
      featured = false,
    } = body;

    if (!name || !category || price === undefined || !description) {
      return NextResponse.json(
        { success: false, error: "Trūksta privalomų laukų (pavadinimas, kategorija, kaina, aprašymas)" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[ąčęėįšųūž]/g, (c: string) => {
        const map: Record<string, string> = {
          ą: "a", č: "c", ę: "e", ė: "e", į: "i",
          š: "s", ų: "u", ū: "u", ž: "z"
        };
        return map[c] || c;
      })
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const id = "prod-" + Date.now();
    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO products (
        id, name, slug, category, price, originalPrice, description,
        fabricDetails, sizes, colors, images, inStock, stockCount, featured,
        createdAt, updatedAt
      ) VALUES (
        @id, @name, @slug, @category, @price, @originalPrice, @description,
        @fabricDetails, @sizes, @colors, @images, @inStock, @stockCount, @featured,
        @createdAt, @updatedAt
      )
    `);

    const now = new Date().toISOString();
    insert.run({
      id,
      name,
      slug,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      description,
      fabricDetails: fabricDetails || "Kokybiški audiniai.",
      sizes: JSON.stringify(Array.isArray(sizes) ? sizes : ["S", "M", "L"]),
      colors: JSON.stringify(Array.isArray(colors) ? colors : ["Klasikinė"]),
      images: JSON.stringify(
        Array.isArray(images) && images.length > 0
          ? images
          : ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"]
      ),
      inStock: inStock ? 1 : 0,
      stockCount: Number(stockCount) || 10,
      featured: featured ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Prekė sėkmingai sukurta",
      productId: id,
      slug,
    });
  } catch (error: unknown) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Nepavyko sukurti prekės" },
      { status: 500 }
    );
  }
}
