/**
 * compare/page.tsx
 *
 * Страница сравнения товаров в табличном формате.
 * Позволяет сравнить характеристики до 4-х товаров одновременно.
 *
 * Интерфейсы:
 * - CompareProductDetails (line 27): Расширенная модель товара с характеристиками
 *
 * Функции:
 * - ComparePage (line 40): Основной компонент страницы сравнения
 * - useEffect (line 46): Инициализация isLoaded для предотвращения hydration mismatch
 * - useEffect (line 50): Загрузка полных данных товаров из API
 *
 * Особенности:
 * - Максимум 4 товара для сравнения (FIFO очередь в Context)
 * - Табличное представление характеристик
 * - Загрузка полных данных из API по ID
 * - Удаление товаров из сравнения
 * - Очистка всего списка сравнения
 *
 * Состояния:
 * - Empty state (line 85): Пустое сравнение с призывом к действию
 * - Loading state (line 77): Индикатор загрузки
 * - Content state (line 102): Таблица сравнения характеристик
 */

"use client";

import { useCompare } from "../context/CompareContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SkeletonTable from "../components/SkeletonTable";
import "./compare.css";

/**
 * CompareProductDetails - Интерфейс расширенных данных товара для сравнения
 *
 * @property {number} id - Уникальный идентификатор товара
 * @property {string} name - Название товара
 * @property {number} price - Цена в рублях
 * @property {string} image_url - URL изображения товара
 * @property {string} slug - URL-friendly идентификатор для роутинга
 * @property {string} [manufacturer] - Производитель товара
 * @property {string} [power] - Мощность (для техники)
 * @property {string} [type] - Тип товара
 * @property {string} [description] - Описание товара
 * @property {any} [key: string] - Дополнительные характеристики
 */
interface CompareProductDetails {
  id: number;
  name: string;
  price: number;
  image_url: string;
  slug: string;
  manufacturer?: string;
  power?: string;
  type?: string;
  description?: string;
  [key: string]: any;
}

/**
 * ComparePage - Компонент страницы сравнения товаров
 *
 * Отображает товары в табличном формате для сравнения:
 * - Загружает полные данные из API по ID из CompareContext
 * - Показывает характеристики товаров в виде таблицы
 * - Позволяет удалить товары из сравнения
 * - Максимум 4 товара одновременно
 * - Отображает empty state если нет товаров для сравнения
 *
 * @returns {JSX.Element} Страница со таблицей сравнения товаров
 */
export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<CompareProductDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (compareItems.length === 0) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    // Получаем все продукты из API и фильтруем нужные
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        // API возвращает { products: [...] }, извлекаем массив
        const productsArray = data.products || [];
        // Фильтруем только те продукты, которые есть в compareItems
        const compareIds = compareItems.map((item) => item.id);
        const filteredProducts = productsArray.filter(
          (product: CompareProductDetails) => compareIds.includes(product.id),
        );
        setProducts(filteredProducts);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке товаров для сравнения:", error);
        // В случае ошибки используем данные из compareItems
        setProducts(compareItems as CompareProductDetails[]);
        setIsLoading(false);
      });
  }, [compareItems]);

  if (!isLoaded) {
    return (
      <div className="compare-container">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (compareItems.length === 0) {
    return (
      <div className="compare-container">
        <h1>Сравнение товаров</h1>
        <div className="empty-compare">
          <p>В сравнении нет товаров</p>
          <p className="empty-hint">
            Добавьте товары для сравнения используя кнопку ⚖️
          </p>
          <Link href="/catalog" className="btn-primary">
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-container">
      <h1>Сравнение товаров ({compareItems.length} из 4)</h1>

      <div className="compare-toolbar">
        <button className="btn-clear" onClick={clearCompare}>
          Очистить сравнение
        </button>
        <Link href="/catalog" className="btn-continue">
          Вернуться в каталог
        </Link>
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : (
        <div className="compare-table-wrapper">
          <table className="compare-table">
            <tbody>
              {/* Product Row */}
              <tr className="product-row">
                <td className="spec-name">Товар</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="product-cell">
                    <div className="product-compare">
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={150}
                          height={150}
                          className="product-image"
                        />
                      )}
                      <Link
                        href={`/products/${item.slug}`}
                        className="product-compare-name"
                      >
                        {item.name}
                      </Link>
                      <button
                        className="btn-remove-compare"
                        onClick={() => removeFromCompare(item.id)}
                        title="Удалить из сравнения"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price Row */}
              <tr className="price-row">
                <td className="spec-name">Цена</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="product-cell">
                    <span className="price-value">
                      {item.price ? item.price.toLocaleString("ru-RU") : "0"} ₽
                    </span>
                  </td>
                ))}
              </tr>

              {/* Add to Cart Row */}
              <tr className="action-row">
                <td className="spec-name">Действие</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="product-cell">
                    <Link
                      href={`/products/${item.slug}`}
                      className="btn-view-product"
                    >
                      Смотреть товар →
                    </Link>
                  </td>
                ))}
              </tr>

              {/* Manufacturer Row */}
              <tr>
                <td className="spec-name">Производитель</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="product-cell">
                    {item.manufacturer || "—"}
                  </td>
                ))}
              </tr>

              {/* Power Row */}
              <tr>
                <td className="spec-name">Мощность</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="product-cell">
                    {item.power || "—"}
                  </td>
                ))}
              </tr>

              {/* Type Row */}
              <tr>
                <td className="spec-name">Тип</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="product-cell">
                    {item.type || "—"}
                  </td>
                ))}
              </tr>

              {/* Description Row */}
              <tr>
                <td className="spec-name">Описание</td>
                {compareItems.map((item) => (
                  <td key={item.id} className="product-cell">
                    <p className="description-text">
                      {item.description || "Нет описания"}
                    </p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
