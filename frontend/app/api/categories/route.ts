import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { validateSlug, sanitizeString } from "@/app/lib/validation";
import { requireAdmin } from "@/app/lib/auth";

/**
 * GET /api/categories - получить все категории
 * Query params:
 *   - search: поиск по названию (опционально)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase.from("categories").select("*").order("name");

    // Поиск по названию (если указан)
    if (search) {
      const sanitizedSearch = sanitizeString(search);
      query = query.ilike("name", `%${sanitizedSearch}%`);
    }

    const { data: categories, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/categories - создать новую категорию
 * Body: { name, slug, description?, image_url? }
 * 🔒 Требует: Admin права
 */
export async function POST(request: Request) {
  // 🔒 Проверка admin прав
  const authCheck = await requireAdmin(request);
  if (authCheck instanceof Response) {
    return authCheck; // Возвращаем 401/403 ошибку
  }

  try {
    const body = await request.json();
    const { name, slug, description, image_url } = body;

    // Валидация обязательных полей
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    // Валидация формата slug
    if (!validateSlug(slug)) {
      return NextResponse.json(
        {
          error:
            "Invalid slug format. Use only lowercase letters, numbers, and hyphens",
        },
        { status: 400 },
      );
    }

    // Санитизация входных данных
    const sanitizedName = sanitizeString(name);
    const sanitizedSlug = slug.toLowerCase().trim();
    const sanitizedDescription = description
      ? sanitizeString(description)
      : null;
    const sanitizedImageUrl = image_url ? sanitizeString(image_url) : null;

    // Проверка существования категории с таким slug
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", sanitizedSlug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 409 },
      );
    }

    // Создание категории
    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: sanitizedName,
          slug: sanitizedSlug,
          description: sanitizedDescription,
          image_url: sanitizedImageUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Category creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { category: data, message: "Category created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
