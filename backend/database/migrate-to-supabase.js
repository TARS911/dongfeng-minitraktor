import Database from "better-sqlite3";
import readline from "readline";
import {
  supabase,
  config,
  validators,
  createBackup,
  checkExistingData,
} from "./config.js";

const db = new Database(config.sqliteDbPath, { readonly: true });

console.log("🚀 Начинаем миграцию данных из SQLite в Supabase...\n");

// Интерактивное подтверждение
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

async function migrateCategories() {
  console.log("📦 Миграция категорий...");

  const categories = db.prepare("SELECT * FROM categories").all();

  if (categories.length === 0) {
    console.log("⚠️  Нет категорий для миграции");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    console.log(
      `[${i + 1}/${categories.length}] Миграция категории: ${category.name}`,
    );

    try {
      // Валидация перед вставкой
      validators.validateCategory(category);

      const { id, ...categoryData } = category;

      const { data, error } = await supabase
        .from("categories")
        .upsert(
          {
            ...categoryData,
            created_at: new Date(category.created_at).toISOString(),
          },
          { onConflict: "slug" },
        )
        .select();

      if (error) {
        console.error(`❌ Ошибка: ${category.name} - ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${category.name} (ID: ${data[0].id})`);
        successCount++;
      }
    } catch (validationError) {
      console.error(`❌ Ошибка валидации: ${validationError.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Категории: ${successCount} успешно, ${errorCount} ошибок`);
}

async function migrateProducts() {
  console.log("\n🚜 Миграция товаров...");

  const products = db.prepare("SELECT * FROM products").all();

  if (products.length === 0) {
    console.log("⚠️  Нет товаров для миграции");
    return;
  }

  // Получаем маппинг старых ID категорий на новые
  const { data: supabaseCategories } = await supabase
    .from("categories")
    .select("id, slug");

  const sqliteCategories = db.prepare("SELECT id, slug FROM categories").all();
  const categoryIdMap = {};

  sqliteCategories.forEach((sqliteCat) => {
    const supabaseCat = supabaseCategories.find(
      (sc) => sc.slug === sqliteCat.slug,
    );
    if (supabaseCat) {
      categoryIdMap[sqliteCat.id] = supabaseCat.id;
    }
  });

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(
      `[${i + 1}/${products.length}] Миграция товара: ${product.name}`,
    );

    try {
      const { id, specifications, ...productData } = product;

      // Парсим specifications из TEXT в JSONB
      let specsJson = null;
      if (specifications) {
        try {
          specsJson = JSON.parse(specifications);
        } catch (e) {
          console.warn(
            `⚠️  Не удалось распарсить specifications для ${product.name}`,
          );
        }
      }

      const productToInsert = {
        ...productData,
        category_id: categoryIdMap[product.category_id] || null,
        specifications: specsJson,
        in_stock: Boolean(product.in_stock),
        is_hit: Boolean(product.is_hit),
        is_new: Boolean(product.is_new),
        created_at: new Date(product.created_at).toISOString(),
        updated_at: new Date(product.updated_at).toISOString(),
      };

      // Валидация перед вставкой
      validators.validateProduct(productToInsert);

      const { data, error } = await supabase
        .from("products")
        .upsert(productToInsert, { onConflict: "slug" })
        .select();

      if (error) {
        console.error(`❌ Ошибка: ${product.name} - ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${product.name} (ID: ${data[0].id})`);
        successCount++;
      }
    } catch (validationError) {
      console.error(`❌ Ошибка валидации: ${validationError.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Товары: ${successCount} успешно, ${errorCount} ошибок`);
}

async function migrateContacts() {
  console.log("\n📧 Миграция контактов...");

  const contacts = db.prepare("SELECT * FROM contacts").all();

  if (contacts.length === 0) {
    console.log("⚠️  Нет контактов для миграции");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    console.log(
      `[${i + 1}/${contacts.length}] Миграция контакта от: ${contact.name}`,
    );

    try {
      // Валидация перед вставкой
      validators.validateContact(contact);

      const { id, ...contactData } = contact;

      const { error } = await supabase.from("contacts").insert({
        ...contactData,
        created_at: new Date(contact.created_at).toISOString(),
      });

      if (error) {
        console.error(`❌ Ошибка: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Контакт от ${contact.name}`);
        successCount++;
      }
    } catch (validationError) {
      console.error(`❌ Ошибка валидации: ${validationError.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Контакты: ${successCount} успешно, ${errorCount} ошибок`);
}

async function migrateDeliveryRequests() {
  console.log("\n🚚 Миграция запросов доставки...");

  const requests = db.prepare("SELECT * FROM delivery_requests").all();

  if (requests.length === 0) {
    console.log("⚠️  Нет запросов доставки для миграции");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    console.log(
      `[${i + 1}/${requests.length}] Миграция запроса в: ${request.city}`,
    );

    try {
      // Валидация перед вставкой
      validators.validateDeliveryRequest(request);

      const { id, ...requestData } = request;

      const { error } = await supabase.from("delivery_requests").insert({
        ...requestData,
        created_at: new Date(request.created_at).toISOString(),
      });

      if (error) {
        console.error(`❌ Ошибка: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Запрос доставки в ${request.city}`);
        successCount++;
      }
    } catch (validationError) {
      console.error(`❌ Ошибка валидации: ${validationError.message}`);
      errorCount++;
    }
  }

  console.log(
    `\n📊 Запросы доставки: ${successCount} успешно, ${errorCount} ошибок`,
  );
}

async function migrate() {
  try {
    // 1. Создаем резервную копию SQLite
    console.log("💾 Создание резервной копии SQLite...");
    await createBackup(config.sqliteDbPath);

    // 2. Проверяем существующие данные в Supabase
    console.log("\n🔍 Проверка существующих данных в Supabase...");
    const existingData = await checkExistingData();

    if (!existingData.isEmpty) {
      console.log(`\n⚠️  ВНИМАНИЕ: В базе данных уже есть записи:`);
      console.log(`   - Категорий: ${existingData.categories}`);
      console.log(`   - Товаров: ${existingData.products}`);
      console.log("");

      const answer = await askQuestion("Продолжить миграцию? (yes/no): ");
      if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
        console.log("❌ Миграция отменена пользователем");
        db.close();
        process.exit(0);
      }
    }

    console.log("\n🚀 Начинаем миграцию...\n");

    // 3. Выполняем миграцию
    await migrateCategories();
    await migrateProducts();
    await migrateContacts();
    await migrateDeliveryRequests();

    console.log("\n🎉 Миграция завершена успешно!");
    console.log("\n📊 Проверьте данные в Supabase Dashboard:");
    console.log(
      `   ${config.supabaseUrl.replace("https://", "https://supabase.com/dashboard/project/")}`,
    );
  } catch (error) {
    console.error("\n❌ Критическая ошибка при миграции:", error);
    console.error("\nСтек ошибки:", error.stack);
  } finally {
    db.close();
  }
}

migrate();
