"use client";

import { useState, useEffect } from "react";
import "./styles.css";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
  });

  // Загрузка категорий
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        setError(data.error || "Failed to load categories");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Создание категории
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Категория создана!");
        setShowAddForm(false);
        setFormData({ name: "", slug: "", description: "", image_url: "" });
        fetchCategories();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  // Обновление категории
  const handleUpdate = async (id: number) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Категория обновлена!");
        setEditingId(null);
        setFormData({ name: "", slug: "", description: "", image_url: "" });
        fetchCategories();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  // Удаление категории
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Удалить категорию "${name}"?`)) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Категория удалена!");
        fetchCategories();
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  // Начать редактирование
  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setShowAddForm(false);
  };

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: "", slug: "", description: "", image_url: "" });
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Загрузка...</div>
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
        <h1>Управление категориями</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({ name: "", slug: "", description: "", image_url: "" });
          }}
        >
          {showAddForm ? "Отменить" : "+ Добавить категорию"}
        </button>
      </div>

      {/* Форма создания */}
      {showAddForm && (
        <div className="category-form">
          <h2>Новая категория</h2>
          <form onSubmit={handleCreate}>
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

            <div className="form-group">
              <label>Slug (URL) *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="mini-tractors"
                pattern="[a-z0-9-]+"
                required
              />
              <small>Только строчные буквы, цифры и дефисы</small>
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
                Создать
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

      {/* Список категорий */}
      <div className="categories-list">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            {editingId === category.id ? (
              // Режим редактирования
              <div className="category-form">
                <h3>Редактирование: {category.name}</h3>
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

                <div className="form-group">
                  <label>Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
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

                <div className="form-group">
                  <label>URL изображения</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleUpdate(category.id)}
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
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p className="slug">/catalog/{category.slug}</p>
                  {category.description && (
                    <p className="description">{category.description}</p>
                  )}
                  {category.image_url && (
                    <p className="image-url">
                      <a
                        href={category.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Изображение
                      </a>
                    </p>
                  )}
                  <p className="meta">
                    ID: {category.id} | Создано:{" "}
                    {new Date(category.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>

                <div className="category-actions">
                  <button
                    className="btn btn-edit"
                    onClick={() => startEdit(category)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(category.id, category.name)}
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <p className="empty-state">Нет категорий. Создайте первую!</p>
        )}
      </div>
    </div>
  );
}
