/**
 * CartContext.test.tsx
 *
 * Unit-тесты для CartContext провайдера.
 * Тестирует добавление, удаление, обновление количества товаров и очистку корзины.
 */

import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../../app/context/CartContext';
import React from 'react';

// Wrapper для провайдера
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
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

describe('CartContext', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Инициализация', () => {
    it('должен инициализироваться с пустой корзиной', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.items).toEqual([]);
      expect(result.current.total).toBe(0);
    });

    it('должен загружать данные из localStorage', () => {
      const savedCart = [
        { id: 1, name: 'Товар 1', price: 1000, quantity: 2, image_url: '/img1.jpg', slug: 'tovar-1' },
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedCart));

      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.items).toEqual(savedCart);
      expect(result.current.total).toBe(2000);
    });
  });

  describe('addToCart', () => {
    it('должен добавлять новый товар в корзину', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Минитрактор',
          price: 50000,
          image_url: '/images/tractor.jpg',
          slug: 'minitraktor-df-244',
        });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual({
        id: 1,
        name: 'Минитрактор',
        price: 50000,
        image_url: '/images/tractor.jpg',
        slug: 'minitraktor-df-244',
        quantity: 1,
      });
      expect(result.current.total).toBe(50000);
    });

    it('должен увеличивать quantity если товар уже в корзине', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      const product = {
        id: 1,
        name: 'Минитрактор',
        price: 50000,
        image_url: '/images/tractor.jpg',
        slug: 'minitraktor-df-244',
      };

      act(() => {
        result.current.addToCart(product);
        result.current.addToCart(product);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.total).toBe(100000);
    });

    it('должен сохранять в localStorage после добавления', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Товар',
          price: 1000,
          image_url: '/img.jpg',
          slug: 'tovar',
        });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'cart',
        expect.any(String)
      );
    });
  });

  describe('removeFromCart', () => {
    it('должен удалять товар из корзины', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Товар 1',
          price: 1000,
          image_url: '/img.jpg',
          slug: 'tovar-1',
        });
        result.current.addToCart({
          id: 2,
          name: 'Товар 2',
          price: 2000,
          image_url: '/img2.jpg',
          slug: 'tovar-2',
        });
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.removeFromCart(1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe(2);
      expect(result.current.total).toBe(2000);
    });

    it('должен обновлять localStorage после удаления', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Товар',
          price: 1000,
          image_url: '/img.jpg',
          slug: 'tovar',
        });
      });

      mockLocalStorage.setItem.mockClear();

      act(() => {
        result.current.removeFromCart(1);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    it('должен обновлять количество товара', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Товар',
          price: 1000,
          image_url: '/img.jpg',
          slug: 'tovar',
        });
      });

      act(() => {
        result.current.updateQuantity(1, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.total).toBe(5000);
    });

    it('должен удалять товар если quantity <= 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Товар',
          price: 1000,
          image_url: '/img.jpg',
          slug: 'tovar',
        });
      });

      act(() => {
        result.current.updateQuantity(1, 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('должен сохранять изменения в localStorage', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Товар',
          price: 1000,
          image_url: '/img.jpg',
          slug: 'tovar',
        });
      });

      mockLocalStorage.setItem.mockClear();

      act(() => {
        result.current.updateQuantity(1, 3);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('clearCart', () => {
    it('должен очищать всю корзину', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Товар 1',
          price: 1000,
          image_url: '/img.jpg',
          slug: 'tovar-1',
        });
        result.current.addToCart({
          id: 2,
          name: 'Товар 2',
          price: 2000,
          image_url: '/img2.jpg',
          slug: 'tovar-2',
        });
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.total).toBe(0);
    });

    it('должен очищать localStorage', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Товар',
          price: 1000,
          image_url: '/img.jpg',
          slug: 'tovar',
        });
      });

      mockLocalStorage.setItem.mockClear();

      act(() => {
        result.current.clearCart();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('cart', '[]');
    });
  });

  describe('Расчет total', () => {
    it('должен правильно считать total для нескольких товаров', () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addToCart({
          id: 1,
          name: 'Товар 1',
          price: 1000,
          image_url: '/img.jpg',
          slug: 'tovar-1',
        });
        result.current.addToCart({
          id: 2,
          name: 'Товар 2',
          price: 2500,
          image_url: '/img2.jpg',
          slug: 'tovar-2',
        });
      });

      act(() => {
        result.current.updateQuantity(1, 3);
      });

      // (1000 * 3) + (2500 * 1) = 5500
      expect(result.current.total).toBe(5500);
    });
  });
});
