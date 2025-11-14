import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения
dotenv.config({ path: path.join(__dirname, ".env") });

// Проверка наличия обязательных переменных окружения
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ ОШИБКА: Отсутствуют обязательные переменные окружения!");
  console.error("");
  console.error(
    "Создайте файл .env в папке backend/database/ со следующим содержимым:",
  );
  console.error("");
  console.error("SUPABASE_URL=https://your-project.supabase.co");
  console.error("SUPABASE_ANON_KEY=your-anon-key-here");
  console.error("");
  console.error("Пример можно найти в файле .env.example");
  process.exit(1);
}

// Создаем и экспортируем клиент Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Экспортируем конфигурацию
export const config = {
  supabaseUrl: SUPABASE_URL,
};

// Функции валидации данных
export const validators = {
  validateCategory(category) {
    if (!category.name || typeof category.name !== "string") {
      throw new Error(
        `Некорректное имя категории: ${JSON.stringify(category)}`,
      );
    }
    if (!category.slug || typeof category.slug !== "string") {
      throw new Error(
        `Некорректный slug категории: ${JSON.stringify(category)}`,
      );
    }
    return true;
  },

  validateProduct(product) {
    if (!product.name || typeof product.name !== "string") {
      throw new Error(`Некорректное имя товара: ${JSON.stringify(product)}`);
    }
    if (!product.slug || typeof product.slug !== "string") {
      throw new Error(`Некорректный slug товара: ${JSON.stringify(product)}`);
    }
    if (!product.model || typeof product.model !== "string") {
      throw new Error(`Некорректная модель товара ${product.name}`);
    }
    if (!product.price || product.price <= 0) {
      throw new Error(
        `Некорректная цена для ${product.name}: ${product.price}`,
      );
    }
    if (!product.power || product.power <= 0) {
      throw new Error(
        `Некорректная мощность для ${product.name}: ${product.power}`,
      );
    }
    return true;
  },

  validateContact(contact) {
    if (!contact.name || typeof contact.name !== "string") {
      throw new Error(`Некорректное имя контакта: ${JSON.stringify(contact)}`);
    }
    if (!contact.phone || typeof contact.phone !== "string") {
      throw new Error(
        `Некорректный телефон контакта: ${JSON.stringify(contact)}`,
      );
    }
    return true;
  },

  validateDeliveryRequest(request) {
    if (!request.city || typeof request.city !== "string") {
      throw new Error(`Некорректный город: ${JSON.stringify(request)}`);
    }
    if (!request.product_model || typeof request.product_model !== "string") {
      throw new Error(`Некорректная модель товара: ${JSON.stringify(request)}`);
    }
    if (!request.phone || typeof request.phone !== "string") {
      throw new Error(`Некорректный телефон: ${JSON.stringify(request)}`);
    }
    return true;
  },
};

// Проверка существующих данных в Supabase
export async function checkExistingData() {
  try {
    const { count: categoriesCount } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    return {
      categories: categoriesCount || 0,
      products: productsCount || 0,
      isEmpty: (categoriesCount || 0) === 0 && (productsCount || 0) === 0,
    };
  } catch (error) {
    console.error("❌ Ошибка при проверке данных:", error.message);
    throw error;
  }
}

console.log("✅ Конфигурация Supabase загружена успешно");
