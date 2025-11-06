// Скрипт для проверки подключения к Supabase
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Загружаем переменные окружения вручную
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Проверка подключения к Supabase...\n");
console.log("URL:", supabaseUrl);
console.log("Key:", supabaseKey ? "✅ Установлен" : "❌ Отсутствует");
console.log("---");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Ошибка: Не установлены переменные окружения");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Проверка подключения
    console.log("\n1️⃣ Проверка категорий...");
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (catError) {
      console.error("❌ Ошибка при получении категорий:", catError.message);
    } else {
      console.log(`✅ Найдено категорий: ${categories?.length || 0}`);
      if (categories && categories.length > 0) {
        categories.forEach((cat) => {
          console.log(`   - ${cat.name} (ID: ${cat.id}, slug: ${cat.slug})`);
        });
      }
    }

    // Проверка товаров
    console.log("\n2️⃣ Проверка товаров...");
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, name, price, category_id, in_stock, is_featured")
      .order("created_at", { ascending: false });

    if (prodError) {
      console.error("❌ Ошибка при получении товаров:", prodError.message);
    } else {
      console.log(`✅ Найдено товаров: ${products?.length || 0}`);
      if (products && products.length > 0) {
        console.log("\nПервые 5 товаров:");
        products.slice(0, 5).forEach((prod) => {
          console.log(
            `   - ${prod.name} (${prod.price}₽, cat: ${prod.category_id}, в наличии: ${prod.in_stock ? "да" : "нет"})`,
          );
        });
      }
    }

    // Статистика
    console.log("\n3️⃣ Статистика:");
    const inStock = products?.filter((p) => p.in_stock).length || 0;
    const featured = products?.filter((p) => p.is_featured).length || 0;
    console.log(`   📦 Товаров в наличии: ${inStock}`);
    console.log(`   ⭐ Рекомендуемых товаров: ${featured}`);

    console.log("\n✅ Проверка завершена успешно!");
  } catch (error) {
    console.error("\n❌ Общая ошибка:", error.message);
    process.exit(1);
  }
}

testConnection();
