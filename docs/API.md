# API Documentation

## DONGFENG Minitractors E-commerce API

**Base URL:** `http://localhost:5000` (development) or `https://api.dongfeng.ru` (production)

**Version:** 1.0.0

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Products API](#products-api)
4. [Orders API](#orders-api)
5. [Contact Form API](#contact-form-api)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

---

## Overview

### Response Format

All API responses follow a consistent JSON format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "pagination": { /* optional pagination info */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>  # Only for protected endpoints
```

---

## Authentication

### JWT Token

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload:**
```typescript
{
  userId: number,
  email: string,
  role: "user" | "admin",
  iat: number,      // issued at
  exp: number       // expiration
}
```

### Admin Access

Some endpoints (marked with 🔒) require admin role:
- Creating/updating products
- Viewing/updating orders
- Managing contact forms

---

## Products API

### GET /api/products

Get all products with filtering and pagination.

**Parameters (Query String):**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Items per page (max 100) |
| `search` | string | - | Search by name or description |
| `category_id` | number | - | Filter by category |
| `in_stock` | boolean | - | Only in-stock items |
| `min_price` | number | - | Minimum price (rubles) |
| `max_price` | number | - | Maximum price (rubles) |
| `is_new` | boolean | - | Only new products |
| `is_featured` | boolean | - | Only featured products |
| `sort_by` | string | created_at | Sort field: `price`, `name`, `created_at` |
| `sort_order` | string | desc | Sort direction: `asc`, `desc` |

**Example Request:**
```bash
GET /api/products?search=DONGFENG&in_stock=true&page=1&limit=20
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "DONGFENG DF-244",
      "slug": "df-244",
      "description": "Мини-трактор с кабиной",
      "price": 850000,
      "originalPrice": null,
      "image": "https://example.com/image.jpg",
      "images": ["https://example.com/img1.jpg"],
      "categoryId": 1,
      "inStock": true,
      "isNew": true,
      "isFeatured": true,
      "power": 24,
      "drive": "4WD",
      "transmission": "manual",
      "specifications": { /* JSON */ },
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

### GET /api/products/:slug

Get a single product by slug.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Product slug (URL-friendly name) |

**Example Request:**
```bash
GET /api/products/df-244
```

**Example Response:**
```json
{
  "success": true,
  "data": { /* product object */ }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

### GET /api/categories

Get all product categories.

**Example Request:**
```bash
GET /api/categories
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Мини-тракторы",
      "slug": "mini-tractors",
      "description": "Компактные тракторы для фермерских хозяйств",
      "image": "https://example.com/category.jpg"
    }
  ]
}
```

---

### POST /api/products 🔒

Create a new product (admin only).

**Required Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Request Body:**
```json
{
  "name": "DONGFENG DF-244",
  "slug": "df-244",
  "description": "Мини-трактор с кабиной",
  "price": 850000,
  "originalPrice": 900000,
  "imageUrl": "https://example.com/image.jpg",
  "categoryId": 1,
  "inStock": true,
  "isNew": true,
  "isFeatured": true,
  "power": 24,
  "drive": "4WD",
  "transmission": "manual",
  "specifications": {
    "engine": {
      "type": "4-cylinder",
      "displacement": 2400
    }
  }
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DONGFENG DF-244",
    "slug": "df-244",
    "price": 850000,
    "imageUrl": "https://example.com/image.jpg"
  }'
```

---

## Orders API

### POST /api/orders

Create a new order.

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 1
    },
    {
      "productId": 2,
      "quantity": 2
    }
  ],
  "customer": {
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan@example.com",
    "phone": "+79991234567",
    "company": "ООО Фермерское хозяйство"
  },
  "shippingAddress": {
    "street": "ул. Ленина 10",
    "city": "Москва",
    "region": "Московская",
    "postalCode": "101000",
    "country": "Россия"
  },
  "notes": "Доставить с 9 до 18"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": 1, "quantity": 1}],
    "customer": {
      "firstName": "Иван",
      "lastName": "Петров",
      "email": "ivan@example.com",
      "phone": "+79991234567"
    },
    "shippingAddress": {
      "street": "ул. Ленина 10",
      "city": "Москва",
      "region": "Московская",
      "postalCode": "101000",
      "country": "Россия"
    }
  }'
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-1704110400000",
    "customerId": 1,
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 1,
        "price": 850000
      }
    ],
    "totalPrice": 850000,
    "status": "pending",
    "paymentStatus": "unpaid",
    "shippingAddress": { /* address object */ },
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### GET /api/orders/:id

Get order details by ID.

**Example Request:**
```bash
GET /api/orders/1
```

**Example Response:**
```json
{
  "success": true,
  "data": { /* order object */ }
}
```

---

### PUT /api/orders/:id/status 🔒

Update order status (admin only).

**Required Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Statuses:**
- `pending` - New order, awaiting confirmation
- `confirmed` - Order confirmed
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/orders/1/status \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

---

## Contact Form API

### POST /api/contact

Submit a contact form.

**Request Body:**
```json
{
  "name": "Иван Петров",
  "email": "ivan@example.com",
  "phone": "+79991234567",
  "company": "ООО Фермерское хозяйство",
  "message": "Интересует модель DF-244. Какие условия доставки?"
}
```

**Validation Rules:**
- `name` - Required, minimum 1 character
- `email` - Required, valid email format
- `phone` - Required, minimum 10 digits
- `message` - Required, minimum 10 characters
- `company` - Optional

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "phone": "+79991234567",
    "message": "Интересует модель DF-244"
  }'
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Спасибо за ваше сообщение. Мы свяжемся с вами в ближайшее время."
  }
}
```

---

### GET /api/contact 🔒

Get all contact form submissions (admin only).

**Required Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | string | new | Filter by status: `new`, `read`, `responded`, `archived` |

**Example Request:**
```bash
GET /api/contact?status=new&page=1
```

---

### PUT /api/contact/:id/status 🔒

Update contact form status (admin only).

**Required Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Request Body:**
```json
{
  "status": "responded"
}
```

**Valid Statuses:**
- `new` - New submission
- `read` - Admin has read it
- `responded` - Admin has responded
- `archived` - Archived

---

## Error Handling

### Common Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "error": "Missing required fields: name, email, phone"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized - Missing or invalid token"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal Server Error"  // Production
  // OR
  "error": "Detailed error message"  // Development
}
```

---

## Examples

### JavaScript/Fetch

```javascript
// GET products
const response = await fetch(
  'http://localhost:5000/api/products?page=1&limit=20'
);
const data = await response.json();
console.log(data.data);

// POST order
const orderResponse = await fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{ productId: 1, quantity: 1 }],
    customer: {
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan@example.com',
      phone: '+79991234567'
    },
    shippingAddress: {
      street: 'ул. Ленина 10',
      city: 'Москва',
      region: 'Московская',
      postalCode: '101000',
      country: 'Россия'
    }
  })
});
const order = await orderResponse.json();
console.log(order.data);
```

### TypeScript/Axios

```typescript
import axios from 'axios';
import { Product, Order, ApiResponse } from '@dongfeng/types';

const api = axios.create({
  baseURL: 'http://localhost:5000'
});

// GET products
const products: ApiResponse<Product[]> = await api.get('/api/products');
console.log(products.data.data);

// POST order with auth
const token = localStorage.getItem('jwt_token');
const order: ApiResponse<Order> = await api.post('/api/orders', orderData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get products
curl http://localhost:5000/api/products

# Get single product
curl http://localhost:5000/api/products/df-244

# Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d @order.json

# Admin endpoints (with token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/contact
```

---

## Rate Limiting

Currently, no rate limiting is implemented. It will be added in future versions.

---

## Versioning

API follows semantic versioning:
- `v1.0.0` - Current version
- Breaking changes will increment major version (v2.0.0)
- New features increment minor version (v1.1.0)
- Bug fixes increment patch version (v1.0.1)

---

## Support

For API issues or questions:
1. Check this documentation
2. Review examples in `/examples` directory
3. Check server logs for detailed error information
4. Create an issue on GitHub

---

**Last Updated:** January 2024
**API Version:** 1.0.0
