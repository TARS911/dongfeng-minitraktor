import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import { sanitizeString } from "@/app/lib/validation";

/**
 * POST /api/orders - создать новый заказ
 * Body: {
 *   customer: { firstName, lastName, email, phone },
 *   shippingAddress: { street, city, region, postalCode, country },
 *   items: [{ productId, quantity, price }],
 *   paymentMethod?: string,
 *   deliveryMethod?: string,
 *   comment?: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, shippingAddress, items, paymentMethod, deliveryMethod, comment } = body;

    // Валидация обязательных полей
    if (!customer || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer, shipping address and items are required" },
        { status: 400 }
      );
    }

    // Валидация customer
    if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
      return NextResponse.json(
        { error: "Customer firstName, lastName, email and phone are required" },
        { status: 400 }
      );
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Валидация телефона (российский формат)
    const phoneRegex = /^\+?[78][\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
    if (!phoneRegex.test(customer.phone)) {
      return NextResponse.json(
        { error: "Invalid phone format. Use: +7 (XXX) XXX-XX-XX" },
        { status: 400 }
      );
    }

    // Валидация адреса
    if (!shippingAddress.city || !shippingAddress.region) {
      return NextResponse.json(
        { error: "City and region are required" },
        { status: 400 }
      );
    }

    // Валидация товаров
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: "Each item must have productId, quantity and price" },
          { status: 400 }
        );
      }

      if (item.quantity < 1) {
        return NextResponse.json(
          { error: "Quantity must be at least 1" },
          { status: 400 }
        );
      }
    }

    // Расчёт общей суммы
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // 1. Создать или найти покупателя
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customer.email)
      .maybeSingle();

    let customerId: number;

    if (existingCustomer) {
      customerId = existingCustomer.id;

      // Обновить данные покупателя
      await supabase
        .from("customers")
        .update({
          first_name: sanitizeString(customer.firstName),
          last_name: sanitizeString(customer.lastName),
          phone: sanitizeString(customer.phone),
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId);
    } else {
      // Создать нового покупателя
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert([
          {
            first_name: sanitizeString(customer.firstName),
            last_name: sanitizeString(customer.lastName),
            email: sanitizeString(customer.email),
            phone: sanitizeString(customer.phone),
          },
        ])
        .select()
        .single();

      if (customerError || !newCustomer) {
        console.error("Customer creation error:", customerError);
        return NextResponse.json(
          { error: "Failed to create customer" },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    // 2. Создать заказ
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_id: customerId,
          total_amount: totalAmount,
          status: "pending",
          payment_method: paymentMethod || "cash",
          delivery_method: deliveryMethod || "pickup",
          shipping_address: {
            street: sanitizeString(shippingAddress.street || ""),
            city: sanitizeString(shippingAddress.city),
            region: sanitizeString(shippingAddress.region),
            postalCode: sanitizeString(shippingAddress.postalCode || ""),
            country: sanitizeString(shippingAddress.country || "Россия"),
          },
          comment: comment ? sanitizeString(comment) : null,
        },
      ])
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // 3. Создать позиции заказа
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      // Откатываем заказ
      await supabase.from("orders").delete().eq("id", order.id);

      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    // TODO: Отправить email уведомление

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: `ORD-${order.id.toString().padStart(6, "0")}`,
          totalAmount: order.total_amount,
          status: order.status,
          createdAt: order.created_at,
        },
        message: "Order created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders - получить заказы (для админа)
 * Query params:
 *   - customerId: ID покупателя (опционально)
 *   - status: статус заказа (опционально)
 *   - page: номер страницы (default: 1)
 *   - limit: количество на странице (default: 20)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("orders")
      .select("*, customers(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (customerId) {
      query = query.eq("customer_id", parseInt(customerId, 10));
    }

    if (status) {
      query = query.eq("status", status);
    }

    query = query.range(from, to);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error("Orders fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
