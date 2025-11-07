"use client";

import { useCompare } from "../context/CompareContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "./compare.css";

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
        // Фильтруем только те продукты, которые есть в compareItems
        const compareIds = compareItems.map((item) => item.id);
        const filteredProducts = data.filter((product: CompareProductDetails) =>
          compareIds.includes(product.id),
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
        <div className="loading">Загрузка деталей товаров...</div>
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
                      {item.price.toLocaleString("ru-RU")} ₽
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
