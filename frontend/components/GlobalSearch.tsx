"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price?: number;
  image_url: string;
  manufacturer?: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Поиск с debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=8`
        );
        const data = await response.json();
        setResults(data.products || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="global-search" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Поиск товаров..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        {query && (
          <button className="clear-btn" onClick={handleClear}>
            ✕
          </button>
        )}
        <span className="search-icon">🔍</span>
      </div>

      {showResults && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">
              <div className="spinner"></div>
              <span>Поиск...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="results-count">
                Найдено: {results.length} товаров
              </div>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/catalog/product/${product.slug}`}
                  className="search-result-item"
                  onClick={() => setShowResults(false)}
                >
                  <div className="result-image">
                    <Image
                      src={product.image_url || "/images/placeholder.jpg"}
                      alt={product.name}
                      width={60}
                      height={60}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="result-info">
                    <div className="result-name">{product.name}</div>
                    {product.manufacturer && (
                      <div className="result-manufacturer">
                        {product.manufacturer}
                      </div>
                    )}
                    <div className="result-price">
                      {product.old_price && (
                        <span className="old">{product.old_price} ₽</span>
                      )}
                      <span className="current">{product.price} ₽</span>
                    </div>
                  </div>
                </Link>
              ))}
              <Link
                href={`/catalog?search=${encodeURIComponent(query)}`}
                className="view-all-link"
                onClick={() => setShowResults(false)}
              >
                Посмотреть все результаты →
              </Link>
            </>
          ) : (
            <div className="no-results">
              <span>😕</span>
              <p>Ничего не найдено</p>
              <small>Попробуйте изменить запрос</small>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .global-search {
          position: relative;
          width: 100%;
          max-width: 500px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 100%;
          padding: 12px 45px 12px 45px;
          border: 2px solid #e0e0e0;
          border-radius: 24px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          font-size: 18px;
          pointer-events: none;
        }

        .clear-btn {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          font-size: 18px;
          color: #999;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .clear-btn:hover {
          color: #333;
        }

        .search-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          max-height: 500px;
          overflow-y: auto;
          z-index: 1000;
        }

        .search-loading {
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #666;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #4a90e2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .results-count {
          padding: 12px 16px;
          background: #f5f5f5;
          color: #666;
          font-size: 13px;
          font-weight: 500;
          border-bottom: 1px solid #e0e0e0;
        }

        .search-result-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          text-decoration: none;
          color: inherit;
          transition: background 0.2s;
          border-bottom: 1px solid #f0f0f0;
        }

        .search-result-item:hover {
          background: #f9f9f9;
        }

        .result-image {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .result-info {
          flex: 1;
          min-width: 0;
        }

        .result-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .result-manufacturer {
          font-size: 12px;
          color: #999;
          margin-bottom: 4px;
        }

        .result-price {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .result-price .old {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
        }

        .result-price .current {
          font-size: 14px;
          color: #4a90e2;
        }

        .view-all-link {
          display: block;
          padding: 14px 16px;
          text-align: center;
          color: #4a90e2;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s;
        }

        .view-all-link:hover {
          background: #f5f5f5;
        }

        .no-results {
          padding: 40px 20px;
          text-align: center;
          color: #999;
        }

        .no-results span {
          font-size: 48px;
          display: block;
          margin-bottom: 12px;
        }

        .no-results p {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
          color: #666;
        }

        .no-results small {
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .global-search {
            max-width: 100%;
          }

          .search-results {
            max-height: 400px;
          }
        }
      `}</style>
    </div>
  );
}
