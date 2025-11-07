/**
 * CompareContext.test.tsx
 *
 * Unit-тесты для CompareContext провайдера.
 * Тестирует FIFO очередь (максимум 4 товара), добавление, удаление и toggle.
 */

import { renderHook, act } from '@testing-library/react';
import { CompareProvider, useCompare } from '../../app/context/CompareContext';
import React from 'react';

// Wrapper для провайдера
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CompareProvider>{children}</CompareProvider>
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

describe('CompareContext', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  const createProduct = (id: number) => ({
    id,
    name: `Товар ${id}`,
    price: id * 1000,
    image_url: `/images/product${id}.jpg`,
    slug: `tovar-${id}`,
  });

  describe('Инициализация', () => {
    it('должен инициализироваться с пустым списком сравнения', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      expect(result.current.compareItems).toEqual([]);
    });

    it('должен загружать данные из localStorage', () => {
      const savedCompare = [createProduct(1), createProduct(2)];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedCompare));

      const { result } = renderHook(() => useCompare(), { wrapper });

      expect(result.current.compareItems).toEqual(savedCompare);
    });
  });

  describe('addToCompare', () => {
    it('должен добавлять товар в список сравнения', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });
      const product = createProduct(1);

      act(() => {
        result.current.addToCompare(product);
      });

      expect(result.current.compareItems).toHaveLength(1);
      expect(result.current.compareItems[0]).toEqual(product);
      expect(result.current.isInCompare(1)).toBe(true);
    });

    it('не должен добавлять дубликат', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });
      const product = createProduct(1);

      act(() => {
        result.current.addToCompare(product);
        result.current.addToCompare(product);
      });

      expect(result.current.compareItems).toHaveLength(1);
    });

    it('должен добавлять до 4-х товаров', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
        result.current.addToCompare(createProduct(2));
        result.current.addToCompare(createProduct(3));
        result.current.addToCompare(createProduct(4));
      });

      expect(result.current.compareItems).toHaveLength(4);
      expect(result.current.compareItems.map(p => p.id)).toEqual([1, 2, 3, 4]);
    });

    it('должен удалять первый товар при добавлении 5-го (FIFO)', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
        result.current.addToCompare(createProduct(2));
        result.current.addToCompare(createProduct(3));
        result.current.addToCompare(createProduct(4));
        result.current.addToCompare(createProduct(5)); // Должен вытеснить товар 1
      });

      expect(result.current.compareItems).toHaveLength(4);
      expect(result.current.compareItems.map(p => p.id)).toEqual([2, 3, 4, 5]);
      expect(result.current.isInCompare(1)).toBe(false);
      expect(result.current.isInCompare(5)).toBe(true);
    });

    it('должен сохранять в localStorage после добавления', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });
      const product = createProduct(1);

      act(() => {
        result.current.addToCompare(product);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'compare',
        expect.any(String)
      );
    });
  });

  describe('removeFromCompare', () => {
    it('должен удалять товар из списка сравнения', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
        result.current.addToCompare(createProduct(2));
        result.current.addToCompare(createProduct(3));
      });

      expect(result.current.compareItems).toHaveLength(3);

      act(() => {
        result.current.removeFromCompare(2);
      });

      expect(result.current.compareItems).toHaveLength(2);
      expect(result.current.compareItems.map(p => p.id)).toEqual([1, 3]);
      expect(result.current.isInCompare(2)).toBe(false);
    });

    it('не должен падать при удалении несуществующего товара', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
      });

      expect(() => {
        act(() => {
          result.current.removeFromCompare(999);
        });
      }).not.toThrow();

      expect(result.current.compareItems).toHaveLength(1);
    });

    it('должен обновлять localStorage после удаления', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
        result.current.addToCompare(createProduct(2));
      });

      mockLocalStorage.setItem.mockClear();

      act(() => {
        result.current.removeFromCompare(1);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('clearCompare', () => {
    it('должен очищать весь список сравнения', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
        result.current.addToCompare(createProduct(2));
        result.current.addToCompare(createProduct(3));
      });

      expect(result.current.compareItems).toHaveLength(3);

      act(() => {
        result.current.clearCompare();
      });

      expect(result.current.compareItems).toHaveLength(0);
    });

    it('должен очищать localStorage', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
      });

      mockLocalStorage.setItem.mockClear();

      act(() => {
        result.current.clearCompare();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('compare', '[]');
    });
  });

  describe('toggleCompare', () => {
    it('должен добавлять товар если его нет в сравнении', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });
      const product = createProduct(1);

      expect(result.current.isInCompare(1)).toBe(false);

      act(() => {
        result.current.toggleCompare(product);
      });

      expect(result.current.isInCompare(1)).toBe(true);
      expect(result.current.compareItems).toHaveLength(1);
    });

    it('должен удалять товар если он уже в сравнении', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });
      const product = createProduct(1);

      act(() => {
        result.current.addToCompare(product);
      });

      expect(result.current.isInCompare(1)).toBe(true);

      act(() => {
        result.current.toggleCompare(product);
      });

      expect(result.current.isInCompare(1)).toBe(false);
      expect(result.current.compareItems).toHaveLength(0);
    });

    it('должен корректно работать при множественных toggle', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });
      const product = createProduct(1);

      // Добавить
      act(() => {
        result.current.toggleCompare(product);
      });
      expect(result.current.compareItems).toHaveLength(1);

      // Удалить
      act(() => {
        result.current.toggleCompare(product);
      });
      expect(result.current.compareItems).toHaveLength(0);

      // Снова добавить
      act(() => {
        result.current.toggleCompare(product);
      });
      expect(result.current.compareItems).toHaveLength(1);
    });
  });

  describe('isInCompare', () => {
    it('должен возвращать true для товаров в сравнении', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
        result.current.addToCompare(createProduct(2));
      });

      expect(result.current.isInCompare(1)).toBe(true);
      expect(result.current.isInCompare(2)).toBe(true);
    });

    it('должен возвращать false для товаров не в сравнении', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
      });

      expect(result.current.isInCompare(999)).toBe(false);
      expect(result.current.isInCompare(0)).toBe(false);
    });
  });

  describe('FIFO очередь (MAX_COMPARE_ITEMS = 4)', () => {
    it('должен поддерживать очередь строго из 4-х элементов', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        for (let i = 1; i <= 10; i++) {
          result.current.addToCompare(createProduct(i));
        }
      });

      // Должны остаться последние 4: [7, 8, 9, 10]
      expect(result.current.compareItems).toHaveLength(4);
      expect(result.current.compareItems.map(p => p.id)).toEqual([7, 8, 9, 10]);
    });

    it('должен вытеснять самый старый элемент', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
        result.current.addToCompare(createProduct(2));
        result.current.addToCompare(createProduct(3));
        result.current.addToCompare(createProduct(4));
      });

      // Все 4 на месте
      expect(result.current.compareItems.map(p => p.id)).toEqual([1, 2, 3, 4]);

      // Добавляем 5-й - должен вытеснить 1-й
      act(() => {
        result.current.addToCompare(createProduct(5));
      });

      expect(result.current.compareItems.map(p => p.id)).toEqual([2, 3, 4, 5]);

      // Добавляем 6-й - должен вытеснить 2-й
      act(() => {
        result.current.addToCompare(createProduct(6));
      });

      expect(result.current.compareItems.map(p => p.id)).toEqual([3, 4, 5, 6]);
    });
  });

  describe('Persistence', () => {
    it('должен сохранять полные данные товаров (для offline работы)', () => {
      const { result } = renderHook(() => useCompare(), { wrapper });

      act(() => {
        result.current.addToCompare(createProduct(1));
        result.current.addToCompare(createProduct(2));
      });

      const savedData = JSON.parse(
        mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1]
      );

      expect(savedData).toHaveLength(2);
      expect(savedData[0]).toMatchObject({
        id: 1,
        name: 'Товар 1',
        price: 1000,
        image_url: '/images/product1.jpg',
        slug: 'tovar-1',
      });
    });
  });
});
