"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import "./checkout.css";

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  street: string;
  postalCode: string;
  paymentMethod: "cash" | "card" | "online";
  deliveryMethod: "pickup" | "delivery";
  comment: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    region: "Белгородская область",
    street: "",
    postalCode: "",
    paymentMethod: "cash",
    deliveryMethod: "delivery",
    comment: "",
  });

  // Проверка пустой корзины
  useEffect(() => {
    if (items.length === 0 && !isSubmitted) {
      router.push("/cart");
    }
  }, [items, router, isSubmitted]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[name as keyof CheckoutForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Введите имя";
    if (!formData.lastName.trim()) newErrors.lastName = "Введите фамилию";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    const phoneRegex = /^\+?[78][\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Формат: +7 (XXX) XXX-XX-XX";
    }

    if (!formData.city.trim()) newErrors.city = "Введите город";
    if (!formData.region.trim()) newErrors.region = "Введите регион";

    if (formData.deliveryMethod === "delivery" && !formData.street.trim()) {
      newErrors.street = "Введите адрес доставки";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          region: formData.region,
          postalCode: formData.postalCode,
          country: "Россия",
        },
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: formData.paymentMethod,
        deliveryMethod: formData.deliveryMethod,
        comment: formData.comment,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при создании заказа");
      }

      // Успешно создан заказ
      setOrderNumber(data.order.orderNumber);
      setIsSubmitted(true);
      clearCart();

      // Прокрутить вверх
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Ошибка при оформлении заказа");
    } finally {
      setIsLoading(false);
    }
  };

  // Успешное оформление
  if (isSubmitted) {
    return (
      <div className="checkout-success">
        <div className="success-icon">✓</div>
        <h1>Заказ успешно оформлен!</h1>
        <p className="order-number">Номер заказа: <strong>{orderNumber}</strong></p>
        <p className="success-message">
          Мы отправили подтверждение на {formData.email}.
          <br />
          Наш менеджер свяжется с вами в ближайшее время.
        </p>
        <div className="success-actions">
          <Link href="/" className="btn btn-primary">
            На главную
          </Link>
          <Link href="/catalog" className="btn btn-secondary">
            Продолжить покупки
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Оформление заказа</h1>

        <div className="checkout-grid">
          {/* Форма */}
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              {/* Контактные данные */}
              <section className="form-section">
                <h2>Контактные данные</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      Имя <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? "error" : ""}
                      required
                    />
                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">
                      Фамилия <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "error" : ""}
                      required
                    />
                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                      placeholder="example@mail.ru"
                      required
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Телефон <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "error" : ""}
                      placeholder="+7 (XXX) XXX-XX-XX"
                      required
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                </div>
              </section>

              {/* Адрес доставки */}
              <section className="form-section">
                <h2>Адрес доставки</h2>

                <div className="form-group">
                  <label htmlFor="deliveryMethod">Способ получения</label>
                  <select
                    id="deliveryMethod"
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleChange}
                  >
                    <option value="delivery">Доставка</option>
                    <option value="pickup">Самовывоз</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">
                      Город <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? "error" : ""}
                      required
                    />
                    {errors.city && <span className="error-text">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="region">
                      Регион <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className={errors.region ? "error" : ""}
                      required
                    />
                    {errors.region && <span className="error-text">{errors.region}</span>}
                  </div>
                </div>

                {formData.deliveryMethod === "delivery" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="street">
                        Улица, дом, квартира <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className={errors.street ? "error" : ""}
                        placeholder="ул. Ленина, д. 10, кв. 5"
                        required
                      />
                      {errors.street && <span className="error-text">{errors.street}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="postalCode">Индекс</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="308000"
                      />
                    </div>
                  </>
                )}
              </section>

              {/* Оплата */}
              <section className="form-section">
                <h2>Способ оплаты</h2>
                <div className="form-group">
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="cash">Наличными при получении</option>
                    <option value="card">Картой при получении</option>
                    <option value="online">Онлайн-оплата</option>
                  </select>
                </div>
              </section>

              {/* Комментарий */}
              <section className="form-section">
                <h2>Комментарий к заказу</h2>
                <div className="form-group">
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Дополнительная информация (опционально)"
                  />
                </div>
              </section>

              <button
                type="submit"
                className="btn btn-primary btn-submit"
                disabled={isLoading}
              >
                {isLoading ? "Оформление..." : "Оформить заказ"}
              </button>
            </form>
          </div>

          {/* Сводка заказа */}
          <div className="order-summary">
            <h2>Ваш заказ</h2>

            <div className="summary-items">
              {items.map((item) => (
                <div key={item.id} className="summary-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">× {item.quantity}</span>
                  </div>
                  <span className="item-price">
                    {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-total">
              <span>Итого:</span>
              <strong>{total.toLocaleString("ru-RU")} ₽</strong>
            </div>

            <div className="summary-info">
              <p>📦 Доставка: рассчитывается индивидуально</p>
              <p>✓ Бесплатная консультация</p>
              <p>✓ Официальная гарантия</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
