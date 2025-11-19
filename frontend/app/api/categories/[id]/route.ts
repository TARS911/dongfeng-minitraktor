import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { validateId, validateSlug, sanitizeString } from "@/app/lib/validation";
import { requireAdmin } from "@/app/lib/auth";

/**
 * GET /api/categories/:id - получить категорию по ID
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const id = parseInt(params.id, 10);

    if (!validateId(id)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 },
      );
    }

    const { data: category, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("GET /api/categories/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/categories/:id - обновить категорию
 * Body: { name?, slug?, description?, image_url? }
 * 🔒 Требует: Admin права
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 🔒 Проверка admin прав
  const authCheck = await requireAdmin(request);
  if (authCheck instanceof Response) {
    return authCheck;
  }

  const params = await context.params;
  try {
    const id = parseInt(params.id, 10);

    if (!validateId(id)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name, slug, description, image_url } = body;

    // Проверка существования категории
    const { data: existing, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Подготовка данных для обновления
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = sanitizeString(name);
    }

    if (slug !== undefined) {
      if (!validateSlug(slug)) {
        return NextResponse.json(
          { error: "Invalid slug format" },
          { status: 400 },
        );
      }

      // Проверка уникальности slug (если он изменился)
      if (slug !== existing.slug) {
        const { data: duplicate } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", slug)
          .single();

        if (duplicate) {
          return NextResponse.json(
            { error: "Category with this slug already exists" },
            { status: 409 },
          );
        }
      }

      updateData.slug = slug.toLowerCase().trim();
    }

    if (description !== undefined) {
      updateData.description = description ? sanitizeString(description) : null;
    }

    if (image_url !== undefined) {
      updateData.image_url = image_url ? sanitizeString(image_url) : null;
    }

    // Обновление категории
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Category update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      category: data,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/categories/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/categories/:id - удалить категорию
 * 🔒 Требует: Admin права
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 🔒 Проверка admin прав
  const authCheck = await requireAdmin(request);
  if (authCheck instanceof Response) {
    return authCheck;
  }

  const params = await context.params;
  try {
    const id = parseInt(params.id, 10);

    if (!validateId(id)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 },
      );
    }

    // Проверка существования категории
    const { data: existing, error: fetchError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Проверка наличия товаров в категории
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (productsError) {
      console.error("Products check error:", productsError);
    }

    if (products && products.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete category with products. Remove products first or reassign them to another category.",
        },
        { status: 409 },
      );
    }

    // Удаление категории
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Category deletion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/categories/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
