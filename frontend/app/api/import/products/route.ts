import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { sanitizeString, validateSlug } from "@/app/lib/validation";

/**
 * POST /api/import/products - Массовый импорт товаров
 *
 * Body (JSON):
 * {
 *   "products": [
 *     {
 *       "name": "Товар 1",
 *       "slug": "tovar-1",
 *       "description": "Описание",
 *       "price": 100000,
 *       "old_price": 120000,
 *       "category_slug": "mini-tractors",
 *       "manufacturer": "DONGFENG",
 *       "model": "DF-244",
 *       "image_url": "https://...",
 *       "in_stock": true,
 *       "featured": false,
 *       "specifications": { "power": "24 л.с." }
 *     }
 *   ]
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "imported": 5,
 *   "failed": 1,
 *   "errors": [...]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Products array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Ограничение на количество товаров за раз
    if (products.length > 1000) {
      return NextResponse.json(
        { error: "Maximum 1000 products per import" },
        { status: 400 }
      );
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: [] as Array<{ index: number; product: string; error: string }>,
    };

    // Получаем все категории для мап ping slug -> id
    const { data: categories } = await supabase
      .from("categories")
      .select("id, slug");

    const categoryMap = new Map(
      categories?.map((c) => [c.slug, c.id]) || []
    );

    // Обрабатываем каждый товар
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      try {
        // Валидация обязательных полей
        if (!product.name || !product.slug || !product.price) {
          results.failed++;
          results.errors.push({
            index: i,
            product: product.name || "Unknown",
            error: "Missing required fields: name, slug, price",
          });
          continue;
        }

        // Валидация slug
        if (!validateSlug(product.slug)) {
          results.failed++;
          results.errors.push({
            index: i,
            product: product.name,
            error: "Invalid slug format",
          });
          continue;
        }

        // Поиск категории
        let category_id = null;
        if (product.category_slug) {
          category_id = categoryMap.get(product.category_slug);
          if (!category_id) {
            results.failed++;
            results.errors.push({
              index: i,
              product: product.name,
              error: `Category not found: ${product.category_slug}`,
            });
            continue;
          }
        }

        // Подготовка данных
        const productData = {
          name: sanitizeString(product.name),
          slug: product.slug.toLowerCase().trim(),
          description: product.description
            ? sanitizeString(product.description)
            : null,
          price: parseFloat(product.price),
          old_price: product.old_price ? parseFloat(product.old_price) : null,
          category_id,
          manufacturer: product.manufacturer
            ? sanitizeString(product.manufacturer)
            : null,
          model: product.model ? sanitizeString(product.model) : null,
          image_url: product.image_url
            ? sanitizeString(product.image_url)
            : null,
          in_stock: product.in_stock !== false, // default true
          featured: product.featured === true, // default false
          specifications: product.specifications || null,
        };

        // Вставка товара (с перезаписью при конфликте slug)
        const { error } = await supabase
          .from("products")
          .upsert([productData], {
            onConflict: "slug",
            ignoreDuplicates: false,
          });

        if (error) {
          results.failed++;
          results.errors.push({
            index: i,
            product: product.name,
            error: error.message,
          });
        } else {
          results.imported++;
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push({
          index: i,
          product: product.name || "Unknown",
          error: err.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.imported,
      failed: results.failed,
      total: products.length,
      errors: results.errors,
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Failed to import products", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/import/products - Получить шаблон для импорта
 */
export async function GET() {
  const template = {
    description: "JSON template for bulk product import",
    example: {
      products: [
        {
          name: "DONGFENG DF-244",
          slug: "dongfeng-df-244",
          description: "Компактный мини-трактор 24 л.с.",
          price: 450000,
          old_price: 500000,
          category_slug: "mini-tractors",
          manufacturer: "DONGFENG",
          model: "DF-244",
          image_url: "https://example.com/image.jpg",
          in_stock: true,
          featured: true,
          specifications: {
            power: "24 л.с.",
            engine: "Дизельный",
            transmission: "Механическая",
          },
        },
      ],
    },
    notes: [
      "Maximum 1000 products per request",
      "slug must be unique and URL-friendly (lowercase, numbers, hyphens)",
      "category_slug must match existing category",
      "price is required, old_price is optional",
      "Duplicate slugs will be updated (upsert)",
    ],
  };

  return NextResponse.json(template);
}
