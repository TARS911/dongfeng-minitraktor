"use client";

import { useState, useEffect } from "react";
import "../categories/styles.css";

import { Product } from "../../../types";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: 0,
    brand: "",
    category: "",
    stock_quantity: 0,
    description: "",
    image_url: "",
  });

  // Загрузка товаров и категорий
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Параллельная загрузка товаров и категорий
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      if (productsRes.ok) {
        setProducts(productsData.products || []);
      } else {
        setError(productsData.error || "Failed to load products");
      }

      if (categoriesRes.ok) {
        setCategories(categoriesData.categories || []);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Создание товара
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock_quantity: Number(formData.stock_quantity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Товар создан!");
        setShowAddForm(false);
        resetForm();
        fetchProducts();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  // Обновление товара
  const handleUpdate = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock_quantity: Number(formData.stock_quantity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Товар обновлен!");
        setEditingId(null);
        resetForm();
        fetchProducts();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  // Удаление товара
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Удалить товар "${name}"?`)) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Товар удален!");
        fetchProducts();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      slug: product.slug,
      price: product.price,
      brand: product.brand || "",
      category: product.category || "",
      stock_quantity: product.stock_quantity || 0,
      description: product.description || "",
      image_url: product.image_url || "",
    });
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      price: 0,
      brand: "",
      category: "",
      stock_quantity: 0,
      description: "",
      image_url: "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    resetForm();
  };

  // Фильтрация товаров
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !filterCategory || product.category === filterCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Загрузка товаров...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error">Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Управление товарами</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            resetForm();
          }}
        >
          {showAddForm ? "Отменить" : "+ Добавить товар"}
        </button>
      </div>

      {/* Фильтры */}
      <div className="filters">
        <div className="form-group">
          <label>Поиск по названию, артикулу, бренду</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск..."
          />
        </div>

        <div className="form-group">
          <label>Фильтр по категории</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Форма создания */}
      {showAddForm && (
        <div className="category-form">
          <h2>Новый товар</h2>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Название *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Slug (URL) *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="dongfeng-180"
                  pattern="[a-z0-9-]+"
                  required
                />
                <small>Только строчные буквы, цифры и дефисы</small>
              </div>

              <div className="form-group">
                <label>Бренд</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  placeholder="DongFeng"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Цена (₽) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Количество на складе</label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock_quantity: Number(e.target.value),
                    })
                  }
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Категория *</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Подробное описание товара..."
              />
            </div>

            <div className="form-group">
              <label>URL изображения</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Создать товар
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEdit}
              >
                Отменить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список товаров */}
      <div className="products-stats">
        <p>
          Показано: {filteredProducts.length} из {products.length} товаров
        </p>
      </div>

      <div className="categories-list">
        {filteredProducts.map((product) => (
          <div key={product.id} className="category-card product-card">
            {editingId === product.id ? (
              // Режим редактирования
              <div className="category-form">
                <h3>Редактирование: {product.name}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Название</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Цена (₽)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Количество</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_quantity: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Категория</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleUpdate(product.id)}
                  >
                    Сохранить
                  </button>
                  <button className="btn btn-secondary" onClick={cancelEdit}>
                    Отменить
                  </button>
                </div>
              </div>
            ) : (
              // Режим просмотра
              <>
                <div className="category-info product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">
                    {product.price.toLocaleString("ru-RU")} ₽
                  </p>
                  {product.brand && (
                    <p className="product-brand">Бренд: {product.brand}</p>
                  )}
                  {product.category && (
                    <p className="product-category">
                      Категория: {product.category}
                    </p>
                  )}
                  <p
                    className={`product-stock ${
                      (product.stock_quantity || 0) > 0 ? "in-stock" : "out-of-stock"
                    }`}
                  >
                    {(product.stock_quantity || 0) > 0
                      ? `В наличии: ${product.stock_quantity} шт.`
                      : "Нет в наличии"}
                  </p>
                  {product.description && (
                    <p className="description">{product.description}</p>
                  )}
                  {product.image_url && (
                    <p className="image-url">
                      <a
                        href={product.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Изображение
                      </a>
                    </p>
                  )}
                  <p className="meta">
                    ID: {product.id} | Создано:{" "}
                    {product.created_at ? new Date(product.created_at).toLocaleDateString("ru-RU") : "-"}
                  </p>
                </div>

                <div className="category-actions">
                  <button
                    className="btn btn-edit"
                    onClick={() => startEdit(product)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <p className="empty-state">
            {searchQuery || filterCategory
              ? "Товары не найдены. Попробуйте изменить фильтры."
              : "Нет товаров. Создайте первый!"}
          </p>
        )}
      </div>
    </div>
  );
}
