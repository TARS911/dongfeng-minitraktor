import { supabase, validators } from "./config.js";

console.log("🚀 Импорт данных в Supabase...\n");

// Категории
const categories = [
  {
    name: "Минитрактора",
    slug: "minitractory",
    description: "Компактные тракторы для дачи и небольших хозяйств",
  },
  {
    name: "Навесное оборудование",
    slug: "equipment",
    description: "Навесное оборудование для минитракторов",
  },
  { name: "Запчасти", slug: "parts", description: "Оригинальные запчасти" },
];

// Товары (сокращенный список - добавлю все 11)
const products = [
  {
    name: "Минитрактор DF-244 с кабиной",
    slug: "df-244-s-kabinoy",
    model: "DF-244",
    category_slug: "minitractory",
    description:
      "Надежный минитрактор DONGFENG DF-244 с комфортабельной кабиной. Защита от непогоды, отопление, удобное рабочее место.",
    price: 320000,
    power: 24,
    drive: "4x4",
    transmission: "8+8",
    engine_type: "Дизельный, 3-цилиндровый",
    fuel_tank: 30,
    weight: 950,
    dimensions: "2800x1300x2150",
    warranty_years: 3,
    in_stock: true,
    is_hit: true,
    is_new: false,
    image_url:
      "https://res.cloudinary.com/drenz1aia/image/upload/v1760698080/dongfeng-minitraktor/df-244-main.jpg",
    specifications: {
      engine: {
        type: "Дизельный",
        cylinders: 3,
        displacement: "1.5 л",
        cooling: "Водяное охлаждение",
        start: "Электростартер",
      },
      transmission: {
        type: "Механическая",
        gears: "8 вперед / 8 назад",
        clutch: "Сухое, однодисковое",
      },
      hydraulics: { lift_capacity: "600 кг", connections: "2 задних вывода" },
      cabin: { heating: "Есть", ventilation: "Есть", windows: "Панорамные" },
      dimensions: {
        length: "2800 мм",
        width: "1300 мм",
        height: "2150 мм (с кабиной)",
        clearance: "300 мм",
      },
    },
  },
  {
    name: "Минитрактор DF-244 без кабины",
    slug: "df-244-bez-kabiny",
    model: "DF-244",
    category_slug: "minitractory",
    description:
      "Минитрактор DONGFENG DF-244 в базовой комплектации без кабины. Отличное соотношение цены и качества.",
    price: 285000,
    power: 24,
    drive: "4x4",
    transmission: "8+8",
    engine_type: "Дизельный, 3-цилиндровый",
    fuel_tank: 30,
    weight: 850,
    dimensions: "2800x1300x1450",
    warranty_years: 3,
    in_stock: true,
    is_hit: false,
    is_new: false,
    image_url:
      "https://res.cloudinary.com/drenz1aia/image/upload/v1760698080/dongfeng-minitraktor/df-244-main.jpg",
    specifications: {
      engine: {
        type: "Дизельный",
        cylinders: 3,
        displacement: "1.5 л",
        cooling: "Водяное охлаждение",
        start: "Электростартер",
      },
      transmission: {
        type: "Механическая",
        gears: "8 вперед / 8 назад",
        clutch: "Сухое, однодисковое",
      },
      hydraulics: { lift_capacity: "600 кг", connections: "2 задних вывода" },
      dimensions: {
        length: "2800 мм",
        width: "1300 мм",
        height: "1450 мм",
        clearance: "300 мм",
      },
    },
  },
  {
    name: "Минитрактор DF-404 с кабиной",
    slug: "df-404-s-kabinoy",
    model: "DF-404",
    category_slug: "minitractory",
    description:
      "Профессиональный минитрактор DONGFENG DF-404 повышенной мощности с комфортабельной кабиной.",
    price: 520000,
    power: 40,
    drive: "4x4",
    transmission: "16+8",
    engine_type: "Дизельный, 4-цилиндровый",
    fuel_tank: 50,
    weight: 1200,
    dimensions: "3200x1500x2200",
    warranty_years: 3,
    in_stock: true,
    is_hit: false,
    is_new: true,
    image_url:
      "https://res.cloudinary.com/drenz1aia/image/upload/v1760698082/dongfeng-minitraktor/df-404-main.jpg",
    specifications: {
      engine: {
        type: "Дизельный",
        cylinders: 4,
        displacement: "2.2 л",
        cooling: "Водяное охлаждение",
        start: "Электростартер",
      },
      transmission: {
        type: "Механическая",
        gears: "16 вперед / 8 назад",
        clutch: "Сухое, двухдисковое усиленное",
      },
      hydraulics: {
        lift_capacity: "1000 кг",
        connections: "4 задних вывода + передний ВОМ",
      },
      cabin: {
        heating: "Есть",
        air_conditioning: "Опция",
        ventilation: "Есть",
        windows: "Панорамные с тонировкой",
      },
      dimensions: {
        length: "3200 мм",
        width: "1500 мм",
        height: "2200 мм (с кабиной)",
        clearance: "350 мм",
      },
    },
  },
];

async function importData() {
  try {
    let categoriesSuccess = 0;
    let categoriesError = 0;

    // Импорт категорий
    console.log("📦 Импорт категорий...");
    for (const cat of categories) {
      try {
        // Валидация
        validators.validateCategory(cat);

        const { error } = await supabase
          .from("categories")
          .upsert(cat, { onConflict: "slug" });

        if (error) {
          console.error(`❌ ${cat.name} - ${error.message}`);
          categoriesError++;
        } else {
          console.log(`✅ ${cat.name}`);
          categoriesSuccess++;
        }
      } catch (validationError) {
        console.error(`❌ Ошибка валидации: ${validationError.message}`);
        categoriesError++;
      }
    }

    console.log(
      `\n📊 Категории: ${categoriesSuccess} успешно, ${categoriesError} ошибок\n`,
    );

    // Получаем ID категорий
    const { data: cats, error: catsError } = await supabase
      .from("categories")
      .select("id, slug");

    if (catsError) {
      throw new Error(`Не удалось получить категории: ${catsError.message}`);
    }

    const categoryMap = {};
    cats.forEach((c) => (categoryMap[c.slug] = c.id));

    let productsSuccess = 0;
    let productsError = 0;

    // Импорт товаров
    console.log("🚜 Импорт товаров...");
    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      console.log(`[${i + 1}/${products.length}] ${prod.name}`);

      try {
        const { category_slug, ...productData } = prod;
        productData.category_id = categoryMap[category_slug];

        if (!productData.category_id) {
          throw new Error(`Категория ${category_slug} не найдена`);
        }

        // Валидация
        validators.validateProduct(productData);

        const { error } = await supabase
          .from("products")
          .upsert(productData, { onConflict: "slug" });

        if (error) {
          console.error(`❌ ${prod.name} - ${error.message}`);
          productsError++;
        } else {
          console.log(`✅ ${prod.name}`);
          productsSuccess++;
        }
      } catch (validationError) {
        console.error(`❌ Ошибка валидации: ${validationError.message}`);
        productsError++;
      }
    }

    console.log(
      `\n📊 Товары: ${productsSuccess} успешно, ${productsError} ошибок`,
    );
    console.log("\n🎉 Импорт завершен! Проверьте данные в Supabase Dashboard.");
  } catch (error) {
    console.error("\n❌ Критическая ошибка:", error);
    console.error("Стек ошибки:", error.stack);
  }
}

importData();
