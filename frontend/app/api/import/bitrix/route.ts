import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { sanitizeString } from "@/app/lib/validation";

/**
 * POST /api/import/bitrix - Импорт товаров из 1С-Битрикс
 *
 * Требования:
 * 1. В теле запроса должен быть API ключ для авторизации
 * 2. Данные должны соответствовать формату 1С-Битрикс REST API
 *
 * Body (JSON):
 * {
 *   "bitrix_url": "https://your-site.bitrix24.ru",
 *   "api_key": "your_api_key",
 *   "user_id": "1",
 *   "webhook_code": "xxxxx"
 * }
 *
 * Альтернативно, можно отправить уже подготовленные данные:
 * {
 *   "products": [ ...массив товаров из Битрикс... ]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Вариант 1: Прямой импорт подготовленных данных
    if (body.products && Array.isArray(body.products)) {
      return await importBitrixProducts(body.products);
    }

    // Вариант 2: Подключение к Битрикс24 API
    if (body.bitrix_url && body.webhook_code) {
      return await fetchAndImportFromBitrix(
        body.bitrix_url,
        body.webhook_code,
        body.user_id || "1"
      );
    }

    return NextResponse.json(
      {
        error:
          "Invalid request. Provide either 'products' array or Bitrix credentials",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Bitrix import error:", error);
    return NextResponse.json(
      { error: "Failed to import from Bitrix", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Импорт товаров из массива данных Битрикс
 */
async function importBitrixProducts(bitrixProducts: any[]) {
  const results = {
    imported: 0,
    failed: 0,
    errors: [] as Array<{ product: string; error: string }>,
  };

  // Получаем категории для маппинга
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug");

  const categoryMap = new Map(
    categories?.map((c) => [c.name.toLowerCase(), c.id]) || []
  );

  for (const bitrixProduct of bitrixProducts) {
    try {
      // Маппинг полей Битрикс -> Supabase
      const product = mapBitrixProduct(bitrixProduct, categoryMap);

      // Вставка товара
      const { error } = await supabase.from("products").upsert([product], {
        onConflict: "slug",
        ignoreDuplicates: false,
      });

      if (error) {
        results.failed++;
        results.errors.push({
          product: product.name,
          error: error.message,
        });
      } else {
        results.imported++;
      }
    } catch (err: any) {
      results.failed++;
      results.errors.push({
        product: bitrixProduct.NAME || "Unknown",
        error: err.message,
      });
    }
  }

  return NextResponse.json({
    success: true,
    source: "bitrix",
    imported: results.imported,
    failed: results.failed,
    total: bitrixProducts.length,
    errors: results.errors,
  });
}

/**
 * Получение товаров из Битрикс24 API и импорт
 */
async function fetchAndImportFromBitrix(
  bitrixUrl: string,
  webhookCode: string,
  userId: string
) {
  try {
    // Формируем URL для webhook
    const apiUrl = `${bitrixUrl}/rest/${userId}/${webhookCode}/catalog.product.list`;

    // Запрос к Битрикс API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        select: [
          "ID",
          "NAME",
          "CODE",
          "DETAIL_TEXT",
          "PRICE",
          "SECTION_ID",
          "PREVIEW_PICTURE",
          "DETAIL_PICTURE",
        ],
        filter: {
          ACTIVE: "Y",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Bitrix API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || "Bitrix API error");
    }

    // Импортируем полученные товары
    return await importBitrixProducts(data.result || []);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch from Bitrix",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Маппинг полей Битрикс → Supabase
 */
function mapBitrixProduct(
  bitrixProduct: any,
  categoryMap: Map<string, number>
): any {
  // Генерация slug из названия
  const slug = generateSlug(bitrixProduct.NAME || bitrixProduct.name);

  // Поиск категории
  let category_id = null;
  if (bitrixProduct.SECTION_NAME || bitrixProduct.category) {
    const categoryName = (
      bitrixProduct.SECTION_NAME || bitrixProduct.category
    ).toLowerCase();
    category_id = categoryMap.get(categoryName) || null;
  }

  return {
    name: sanitizeString(bitrixProduct.NAME || bitrixProduct.name),
    slug,
    description: bitrixProduct.DETAIL_TEXT || bitrixProduct.description || null,
    price: parseFloat(
      bitrixProduct.PRICE || bitrixProduct.price || bitrixProduct.CATALOG_PRICE_1 || 0
    ),
    old_price: bitrixProduct.OLD_PRICE
      ? parseFloat(bitrixProduct.OLD_PRICE)
      : null,
    category_id,
    manufacturer: bitrixProduct.MANUFACTURER || null,
    model: bitrixProduct.MODEL || bitrixProduct.CODE || null,
    image_url: bitrixProduct.PREVIEW_PICTURE || bitrixProduct.DETAIL_PICTURE || null,
    in_stock: bitrixProduct.AVAILABLE !== "N",
    featured: false,
    specifications: bitrixProduct.PROPERTIES || null,
  };
}

/**
 * Генерация URL-friendly slug из строки
 */
function generateSlug(text: string): string {
  // Транслитерация русских букв
  const translitMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return text
    .toLowerCase()
    .trim()
    .split("")
    .map((char) => translitMap[char] || char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET /api/import/bitrix - Получить инструкцию по настройке
 */
export async function GET() {
  const instructions = {
    description: "Интеграция с 1С-Битрикс",
    steps: [
      {
        step: 1,
        title: "Создайте Webhook в Битрикс24",
        url: "https://ваш-сайт.bitrix24.ru/devops/webhook/",
        permissions: ["catalog"],
      },
      {
        step: 2,
        title: "Скопируйте код webhook",
        example: "https://ваш-сайт.bitrix24.ru/rest/1/xxxxxxxxxxxxx/",
      },
      {
        step: 3,
        title: "Отправьте POST запрос на /api/import/bitrix",
        body: {
          bitrix_url: "https://ваш-сайт.bitrix24.ru",
          webhook_code: "xxxxxxxxxxxxx",
          user_id: "1",
        },
      },
    ],
    alternative_method: {
      description:
        "Или экспортируйте товары из Битрикс в JSON и отправьте напрямую",
      endpoint: "/api/import/products",
    },
    field_mapping: {
      bitrix_fields: {
        NAME: "Название товара",
        CODE: "Символьный код (slug)",
        PRICE: "Цена",
        DETAIL_TEXT: "Описание",
        SECTION_NAME: "Категория",
        PREVIEW_PICTURE: "Изображение",
      },
      supabase_fields: {
        name: "NAME",
        slug: "CODE or auto-generated from NAME",
        price: "PRICE",
        description: "DETAIL_TEXT",
        category_id: "SECTION_NAME (mapped to category ID)",
        image_url: "PREVIEW_PICTURE",
      },
    },
  };

  return NextResponse.json(instructions);
}
