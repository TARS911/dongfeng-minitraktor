"use client";

import { useState } from "react";

export interface FilterOptions {
  priceMin: number;
  priceMax: number;
  sortBy: "price_asc" | "price_desc" | "name" | "newest";
  search: string;
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  totalProducts: number;
}

export default function ProductFilters({
  onFilterChange,
  totalProducts,
}: ProductFiltersProps) {
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [sortBy, setSortBy] = useState<FilterOptions["sortBy"]>("newest");
  const [search, setSearch] = useState("");

  const handleApplyFilters = () => {
    onFilterChange({
      priceMin: priceMin ? parseFloat(priceMin) : 0,
      priceMax: priceMax ? parseFloat(priceMax) : Infinity,
      sortBy,
      search: search.trim(),
    });
  };

  const handleReset = () => {
    setPriceMin("");
    setPriceMax("");
    setSortBy("newest");
    setSearch("");
    onFilterChange({
      priceMin: 0,
      priceMax: Infinity,
      sortBy: "newest",
      search: "",
    });
  };

  return (
    <div className="product-filters">
      <div className="filters-header">
        <h3>Фильтры</h3>
        <span className="products-count">{totalProducts} товаров</span>
      </div>

      {/* Поиск */}
      <div className="filter-group">
        <label htmlFor="search">Поиск по названию</label>
        <input
          id="search"
          type="text"
          placeholder="Введите название..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleApplyFilters()}
        />
      </div>

      {/* Цена */}
      <div className="filter-group">
        <label>Цена, ₽</label>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="От"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            min="0"
          />
          <span>—</span>
          <input
            type="number"
            placeholder="До"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            min="0"
          />
        </div>
      </div>

      {/* Сортировка */}
      <div className="filter-group">
        <label htmlFor="sortBy">Сортировка</label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as FilterOptions["sortBy"])
          }
        >
          <option value="newest">Сначала новые</option>
          <option value="price_asc">Сначала дешевле</option>
          <option value="price_desc">Сначала дороже</option>
          <option value="name">По названию</option>
        </select>
      </div>

      {/* Кнопки */}
      <div className="filter-actions">
        <button className="btn btn-primary" onClick={handleApplyFilters}>
          Применить
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          Сбросить
        </button>
      </div>

      <style jsx>{`
        .product-filters {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .filters-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: #333;
        }

        .products-count {
          color: #666;
          font-size: 0.9rem;
        }

        .filter-group {
          margin-bottom: 1.5rem;
        }

        .filter-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .filter-group input,
        .filter-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .filter-group input:focus,
        .filter-group select:focus {
          outline: none;
          border-color: #4a90e2;
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .price-inputs input {
          flex: 1;
        }

        .price-inputs span {
          color: #999;
        }

        .filter-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #4a90e2;
          color: white;
        }

        .btn-primary:hover {
          background: #357abd;
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #666;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        @media (max-width: 768px) {
          .product-filters {
            padding: 1rem;
          }

          .filters-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .filter-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
