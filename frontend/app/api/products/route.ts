import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { validateId, sanitizeString } from "@/app/lib/validation";

/**
 * GET /api/products - получить товары с пагинацией и фильтрами
 * Query params:
 *   - page: номер страницы (default: 1)
 *   - limit: количество на странице (default: 20, max: 100)
 *   - category: ID категории (опционально)
 *   - search: поиск по названию (опционально)
 *   - sort: сортировка (price_asc, price_desc, name, newest)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    // Валидация page
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page parameter. Must be >= 1." },
        { status: 400 },
      );
    }

    // Валидация limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be between 1 and 100." },
        { status: 400 },
      );
    }

    // Вычисление offset для пагинации
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Базовый запрос с подсчётом общего количества
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("in_stock", true);

    // Фильтр по категории
    if (category) {
      if (!validateId(category)) {
        return NextResponse.json(
          { error: "Invalid category ID" },
          { status: 400 },
        );
      }
      query = query.eq("category_id", parseInt(category, 10));
    }

    // Поиск по названию или описанию
    if (search) {
      const sanitizedSearch = sanitizeString(search);
      query = query.or(
        `name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`,
      );
    }

    // Сортировка
    switch (sort) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "name":
        query = query.order("name", { ascending: true });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Применение пагинации
    query = query.range(from, to);

    const { data: products, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 },
      );
    }

    // Вычисление метаданных пагинации
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
        from: from + 1,
        to: Math.min(to + 1, totalCount),
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
