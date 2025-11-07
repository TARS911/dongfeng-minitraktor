/**
 * FavoritesContext.test.tsx
 *
 * Unit-тесты для FavoritesContext провайдера.
 * Тестирует добавление/удаление товаров в избранное и toggle функционал.
 */

import { renderHook, act } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from '../../app/context/FavoritesContext';
import React from 'react';

// Wrapper для провайдера
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FavoritesProvider>{children}</FavoritesProvider>
);

// Mock для localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('FavoritesContext', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Инициализация', () => {
    it('должен инициализироваться с пустым списком избранного', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      expect(result.current.favorites).toEqual([]);
    });

    it('должен загружать данные из localStorage', () => {
      const savedFavorites = [1, 2, 3];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedFavorites));

      const { result } = renderHook(() => useFavorites(), { wrapper });

      expect(result.current.favorites).toEqual(savedFavorites);
    });
  });

  describe('addFavorite', () => {
    it('должен добавлять ID товара в избранное', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      act(() => {
        result.current.addFavorite(1);
      });

      expect(result.current.favorites).toEqual([1]);
      expect(result.current.isFavorite(1)).toBe(true);
    });

    it('не должен добавлять дубликат', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      act(() => {
        result.current.addFavorite(1);
        result.current.addFavorite(1);
      });

      expect(result.current.favorites).toEqual([1]);
      expect(result.current.favorites).toHaveLength(1);
    });

    it('должен сохранять в localStorage после добавления', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      act(() => {
        result.current.addFavorite(5);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'favorites',
        JSON.stringify([5])
      );
    });
  });

  describe('removeFavorite', () => {
    it('должен удалять товар из избранного', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      act(() => {
        result.current.addFavorite(1);
        result.current.addFavorite(2);
        result.current.addFavorite(3);
      });

      expect(result.current.favorites).toEqual([1, 2, 3]);

      act(() => {
        result.current.removeFavorite(2);
      });

      expect(result.current.favorites).toEqual([1, 3]);
      expect(result.current.isFavorite(2)).toBe(false);
    });

    it('не должен падать при удалении несуществующего товара', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      act(() => {
        result.current.addFavorite(1);
      });

      expect(() => {
        act(() => {
          result.current.removeFavorite(999);
        });
      }).not.toThrow();

      expect(result.current.favorites).toEqual([1]);
    });

    it('должен обновлять localStorage после удаления', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      act(() => {
        result.current.addFavorite(1);
        result.current.addFavorite(2);
      });

      mockLocalStorage.setItem.mockClear();

      act(() => {
        result.current.removeFavorite(1);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'favorites',
        JSON.stringify([2])
      );
    });
  });

  describe('toggleFavorite', () => {
    it('должен добавлять товар если его нет в избранном', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      expect(result.current.isFavorite(1)).toBe(false);

      act(() => {
        result.current.toggleFavorite(1);
      });

      expect(result.current.isFavorite(1)).toBe(true);
      expect(result.current.favorites).toEqual([1]);
    });

    it('должен удалять товар если он уже в избранном', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      act(() => {
        result.current.addFavorite(1);
      });

      expect(result.current.isFavorite(1)).toBe(true);

      act(() => {
        result.current.toggleFavorite(1);
      });

      expect(result.current.isFavorite(1)).toBe(false);
      expect(result.current.favorites).toEqual([]);
    });

    it('должен корректно работать при множественных toggle', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      // Добавить
      act(() => {
        result.current.toggleFavorite(1);
      });
      expect(result.current.favorites).toEqual([1]);

      // Удалить
      act(() => {
        result.current.toggleFavorite(1);
      });
      expect(result.current.favorites).toEqual([]);

      // Снова добавить
      act(() => {
        result.current.toggleFavorite(1);
      });
      expect(result.current.favorites).toEqual([1]);
    });
  });

  describe('isFavorite', () => {
    it('должен возвращать true для товаров в избранном', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      act(() => {
        result.current.addFavorite(1);
        result.current.addFavorite(2);
      });

      expect(result.current.isFavorite(1)).toBe(true);
      expect(result.current.isFavorite(2)).toBe(true);
    });

    it('должен возвращать false для товаров не в избранном', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      act(() => {
        result.current.addFavorite(1);
      });

      expect(result.current.isFavorite(999)).toBe(false);
      expect(result.current.isFavorite(0)).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('должен сохранять только ID товаров (оптимизация памяти)', () => {
      const { result } = renderHook(() => useFavorites(), { wrapper });

      act(() => {
        result.current.addFavorite(1);
        result.current.addFavorite(2);
        result.current.addFavorite(3);
      });

      const savedData = JSON.parse(
        mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1]
      );

      expect(savedData).toEqual([1, 2, 3]);
      expect(savedData).not.toContainEqual(expect.objectContaining({ id: 1 }));
    });
  });
});
