# Admin Cab Category API Documentation

These endpoints allow admin users to perform CRUD operations on cab categories.

**Base Route:** `/api/admin/cab-categories`

All endpoints require admin authentication (JWT with `role: 'admin'`).

---

## 1. Create Cab Category

**POST** `/api/admin/cab-categories`

**Request Body (JSON):**
```json
{
  "category": "Hatchback",
  "price_per_km": 9.5,
  "min_no_of_seats": 4,
  "max_no_of_seats": 5,
  "fuel_charges": 150,
  "driver_charges": 300,
  "night_charges": 200,
  "included_vehicle_types": ["Swift", "WagonR"],
  "base_discount": 10,
  "category_image": "https://url/to/image.jpg",
  "notes": "Popular for city rides",
  "is_active": 1
}
```
**Success Response:**
- `201 Created`
```json
{
  "success": true,
  "message": "Cab category created",
  "cab_category": { ... }
}
```

---

## 2. Update Cab Category

**PUT** `/api/admin/cab-categories/:id`

**Request Body:**
```json
{
  "price_per_km": 10.0,
  "base_discount": 5
}
```

**Success Response:**
- `200 OK`
```json
{
  "success": true,
  "message": "Cab category updated successfully",
  "cab_category": { ... }
}
```

---

## 3. Delete Cab Category

**DELETE** `/api/admin/cab-categories/:id`

**Success Response:**
- `200 OK`
```json
{
  "success": true,
  "message": "Cab category deleted successfully"
}
```

---

## 4. List All Cab Categories

**GET** `/api/admin/cab-categories`

**Success Response:**
- `200 OK`
```json
{
  "success": true,
  "count": 2,
  "cab_categories": [
    {
      "id": "...",
      "category": "Hatchback",
      "price_per_km": 9.5,
      "min_no_of_seats": 4,
      "max_no_of_seats": 5,
      "fuel_charges": 150,
      "driver_charges": 300,
      "night_charges": 200,
      "included_vehicle_types": ["Swift", "WagonR"],
      "base_discount": 10.0,
      "category_image": "https://url/to/image.jpg",
      "notes": "Popular for city rides",
      "is_active": 1
      // ...other fields...
    }
  ]
}
```

---

## 5. Get One Cab Category By ID

**GET** `/api/admin/cab-categories/:id`

**Success Response:**
- `200 OK`
```json
{
  "success": true,
  "cab_category": { ... }
}
```

---

## Common Fields & Notes

Each cab category object can include:
- `id` (string, required)
- `category` (string, e.g. `Hatchback`)
- `price_per_km`, `fuel_charges`, `driver_charges`, `night_charges` (decimal number)
- `min_no_of_seats`, `max_no_of_seats` (integer)
- `included_vehicle_types` (array of strings)
- `base_discount` (decimal, percent)
- `category_image` (string, URL)
- `notes` (optional string)
- `is_active` (0 or 1)

> **Auth:** Pass JWT token as `Authorization: Bearer <token>` with the claim `role: "admin"`.

---

## Error Responses

- **400 Bad Request:** Invalid/missing required fields
- **401 Unauthorized:** No or invalid token, or not admin
- **404 Not Found:** Resource not found
- **409 Conflict:** Duplicate category
- **500 Internal Server Error:** Unexpected errors

---
