import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { validateId } from "@/app/lib/validation";

// GET /api/products - получить все товары
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit") || "20";

    // Валидация limit
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be between 1 and 100." },
        { status: 400 },
      );
    }

    let query = supabase.from("products").select("*").eq("in_stock", true);

    // Валидация category_id
    if (category) {
      if (!validateId(category)) {
        return NextResponse.json(
          { error: "Invalid category ID" },
          { status: 400 },
        );
      }
      query = query.eq("category_id", parseInt(category, 10));
    }

    const { data: products, error } = await query.limit(limitNum);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 },
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
