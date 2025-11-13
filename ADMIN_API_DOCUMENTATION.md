# Admin API Documentation

This document describes all admin endpoints for managing vendors, drivers, users/clients, and viewing statistics.

## Authentication

All admin endpoints require admin authentication. Include the admin JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

The token must have `role: 'admin'` in its payload.

---

## Vendor Management Endpoints

### 1. Get All Vendors

Retrieve a list of all vendors with filtering, search, and pagination options.

**Endpoint:** `GET /admin/vendors`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `status` (optional): Filter by status - `active`, `inactive`, or `suspended`
- `search` (optional): Search by vendor name, email, or phone

**Response:**
```json
{
  "success": true,
  "message": "Vendors retrieved successfully",
  "data": {
    "vendors": [
      {
        "id": "vendor_id",
        "name": "Vendor Name",
        "email": "vendor@example.com",
        "phone": "1234567890",
        "is_active": 1,
        "is_profile_completed": 1,
        "is_phone_verified": 1,
        "is_email_verified": 1,
        "star_rating": 4.5,
        "total_earnings": 50000,
        "amount": 10000,
        "penalty_reason": null,
        "penalty_amount": 0,
        "total_penalties": 0,
        "suspended_by_admin": 0,
        "suspension_reason": null,
        "suspension_date": null,
        "suspension_until": null,
        "created_at": "2024-01-01T00:00:00.000Z",
        "total_vehicles": 5,
        "total_drivers": 3,
        "total_bookings": 100,
        "completed_bookings": 95
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 50,
      "total_pages": 5
    }
  }
}
```

**Example Request:**
```bash
GET /admin/vendors?page=1&limit=10&status=active&search=sharma
```

---

### 2. Get Vendor Details

Get detailed information about a specific vendor including their bookings, vehicles, and drivers.

**Endpoint:** `GET /admin/vendors/:vendorId`

**Path Parameters:**
- `vendorId`: The ID of the vendor

**Response:**
```json
{
  "success": true,
  "message": "Vendor details retrieved successfully",
  "data": {
    "vendor": {
      "id": "vendor_id",
      "name": "Vendor Name",
      "email": "vendor@example.com",
      "phone": "1234567890",
      // ... all vendor fields
      "total_vehicles": 5,
      "total_drivers": 3,
      "total_bookings": 100,
      "completed_bookings": 95,
      "total_booking_revenue": 500000
    },
    "bookings": [
      {
        "id": "booking_id",
        "pickup_location": "Location A",
        "dropoff_location": "Location B",
        "price": 5000,
        "status": "completed",
        "customer_name": "Customer Name",
        "customer_email": "customer@example.com",
        "vehicle_model": "Toyota Innova",
        "driver_name": "Driver Name",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "vehicles": [
      {
        "id": "vehicle_id",
        "model": "Toyota Innova",
        "registration_no": "ABC123",
        "is_active": 1,
        "per_km_charge": 10.50,
        "no_of_seats": 7,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "drivers": [
      {
        "id": "driver_id",
        "name": "Driver Name",
        "phone": "9876543210",
        "dl_number": "DL123456",
        "is_active": 1,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Example Request:**
```bash
GET /admin/vendors/abc123def456
```

---

### 3. Activate/Deactivate Vendor

Enable or disable a vendor account. Deactivating a vendor will also deactivate all their drivers.

**Endpoint:** `PUT /admin/vendors/:vendorId/status`

**Path Parameters:**
- `vendorId`: The ID of the vendor

**Request Body:**
```json
{
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor activated successfully",
  "data": {
    "vendor_id": "vendor_id",
    "is_active": true
  }
}
```

**Example Request:**
```bash
PUT /admin/vendors/abc123def456/status
Content-Type: application/json

{
  "is_active": false
}
```

---

### 4. Apply Penalty to Vendor

Apply a monetary penalty to a vendor for misconduct. The penalty amount is deducted from the vendor's balance.

**Endpoint:** `POST /admin/vendors/:vendorId/penalty`

**Path Parameters:**
- `vendorId`: The ID of the vendor

**Request Body:**
```json
{
  "penalty_amount": 1000,
  "penalty_reason": "Late vehicle registration renewal"
}
```

**Required Fields:**
- `penalty_amount`: Amount to deduct (number, required)
- `penalty_reason`: Reason for the penalty (string, required)

**Response:**
```json
{
  "success": true,
  "message": "Penalty applied to vendor successfully",
  "data": {
    "vendor_id": "vendor_id",
    "penalty_amount": 1000,
    "penalty_reason": "Late vehicle registration renewal",
    "remaining_amount": 9000,
    "payment_id": "payment_id"
  }
}
```

**Example Request:**
```bash
POST /admin/vendors/abc123def456/penalty
Content-Type: application/json

{
  "penalty_amount": 1000,
  "penalty_reason": "Late vehicle registration renewal"
}
```

---

### 5. Suspend/Unsuspend Vendor

Suspend a vendor temporarily or permanently. Suspending a vendor will also deactivate all their drivers.

**Endpoint:** `PUT /admin/vendors/:vendorId/suspend`

**Path Parameters:**
- `vendorId`: The ID of the vendor

**Request Body:**
```json
{
  "suspended": true,
  "suspension_reason": "Multiple customer complaints",
  "suspension_until": "2024-12-31T23:59:59.000Z"
}
```

**Required Fields:**
- `suspended`: Boolean indicating suspension status (required)
- `suspension_reason`: Reason for suspension (required when suspended=true)
- `suspension_until`: Optional date until which vendor is suspended (optional)

**Response:**
```json
{
  "success": true,
  "message": "Vendor suspended successfully",
  "data": {
    "vendor_id": "vendor_id",
    "suspended": true
  }
}
```

**Example Request:**
```bash
PUT /admin/vendors/abc123def456/suspend
Content-Type: application/json

{
  "suspended": true,
  "suspension_reason": "Multiple customer complaints",
  "suspension_until": "2024-12-31T23:59:59.000Z"
}
```

---

### 6. Get Vendor Bookings

Get all bookings for a specific vendor with filtering and pagination.

**Endpoint:** `GET /admin/vendors/:vendorId/bookings`

**Path Parameters:**
- `vendorId`: The ID of the vendor

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 20)
- `status` (optional): Filter by booking status - `completed`, `cancelled`
- `start_date` (optional): Filter bookings from this date (YYYY-MM-DD)
- `end_date` (optional): Filter bookings until this date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Vendor bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "id": "booking_id",
        "pickup_location": "Location A",
        "dropoff_location": "Location B",
        "price": 5000,
        "status": "completed",
        "customer_name": "Customer Name",
        "customer_email": "customer@example.com",
        "customer_phone": "1234567890",
        "vehicle_model": "Toyota Innova",
        "vehicle_registration": "ABC123",
        "driver_name": "Driver Name",
        "driver_phone": "9876543210",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

**Example Request:**
```bash
GET /admin/vendors/abc123def456/bookings?page=1&limit=20&status=completed
```

---

## Driver Management Endpoints

### 7. Get All Drivers

Retrieve a list of all drivers with filtering, search, and pagination options.

**Endpoint:** `GET /admin/drivers`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `status` (optional): Filter by status - `active` or `inactive`
- `vendor_id` (optional): Filter by vendor ID
- `search` (optional): Search by driver name, phone, or DL number

**Response:**
```json
{
  "success": true,
  "message": "Drivers retrieved successfully",
  "data": {
    "drivers": [
      {
        "id": "driver_id",
        "vendor_id": "vendor_id",
        "name": "Driver Name",
        "phone": "9876543210",
        "address": "Driver Address",
        "dl_number": "DL123456",
        "dl_data": "{}",
        "is_active": 1,
        "vehicle_id": "vehicle_id",
        "vendor_name": "Vendor Name",
        "vendor_email": "vendor@example.com",
        "vendor_phone": "1234567890",
        "vehicle_model": "Toyota Innova",
        "vehicle_registration": "ABC123",
        "total_bookings": 50,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

**Example Request:**
```bash
GET /admin/drivers?page=1&limit=10&status=active&vendor_id=abc123
```

---

### 8. Activate/Deactivate Driver

Enable or disable a driver account. Drivers can only be activated if their vendor is active and not suspended.

**Endpoint:** `PUT /admin/drivers/:driverId/status`

**Path Parameters:**
- `driverId`: The ID of the driver

**Request Body:**
```json
{
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Driver activated successfully",
  "data": {
    "driver_id": "driver_id",
    "is_active": true
  }
}
```

**Error Response (if vendor is inactive):**
```json
{
  "success": false,
  "message": "Cannot activate driver because vendor is inactive or suspended"
}
```

**Example Request:**
```bash
PUT /admin/drivers/xyz789abc123/status
Content-Type: application/json

{
  "is_active": false
}
```

---

## User/Client Management Endpoints

### 9. Get All Users/Clients

Retrieve a list of all users/clients with filtering, search, and pagination options.

**Endpoint:** `GET /admin/users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `verified` (optional): Filter by verification status - `phone` or `profile`
- `search` (optional): Search by user name, email, or phone

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "phone": "1234567890",
        "is_phone_verified": 1,
        "is_profile_completed": 1,
        "gender": "Male",
        "age": 25,
        "amount_spent": 50000,
        "total_bookings": 20,
        "completed_bookings": 18,
        "total_spent": 45000,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 500,
      "total_pages": 50
    }
  }
}
```

**Example Request:**
```bash
GET /admin/users?page=1&limit=10&verified=phone&search=john
```

---

### 10. Get User Details

Get detailed information about a specific user including their booking history.

**Endpoint:** `GET /admin/users/:userId`

**Path Parameters:**
- `userId`: The ID of the user

**Response:**
```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "phone": "1234567890",
      // ... all user fields
    },
    "bookings": [
      {
        "id": "booking_id",
        "pickup_location": "Location A",
        "dropoff_location": "Location B",
        "price": 5000,
        "status": "completed",
        "vendor_name": "Vendor Name",
        "vehicle_model": "Toyota Innova",
        "vehicle_registration": "ABC123",
        "driver_name": "Driver Name",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Example Request:**
```bash
GET /admin/users/abc123def456
```

---

### 11. Update User Data

Update user information (admin only).

**Endpoint:** `PUT /admin/users/:userId`

**Path Parameters:**
- `userId`: The ID of the user

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "9876543210",
  "is_phone_verified": true,
  "is_profile_completed": true
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Response:**
```json
{
  "success": true,
  "message": "User data updated successfully"
}
```

**Example Request:**
```bash
PUT /admin/users/abc123def456
Content-Type: application/json

{
  "name": "Updated Name",
  "is_phone_verified": true
}
```

---

### 12. Delete User

Delete a user account. This will cascade delete related records.

**Endpoint:** `DELETE /admin/users/:userId`

**Path Parameters:**
- `userId`: The ID of the user

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Example Request:**
```bash
DELETE /admin/users/abc123def456
```

---

## Statistics & Analytics Endpoints

### 13. Get Annual Bookings Statistics

Get comprehensive booking statistics for a specific year with monthly breakdown.

**Endpoint:** `GET /admin/stats/annual-bookings`

**Query Parameters:**
- `year` (optional): Year to get statistics for (default: current year)

**Response:**
```json
{
  "success": true,
  "message": "Annual bookings statistics retrieved successfully",
  "data": {
    "year": 2024,
    "yearly_summary": {
      "total_bookings": 1000,
      "completed_bookings": 950,
      "cancelled_bookings": 50,
      "total_revenue": 5000000,
      "avg_booking_value": 5263.16,
      "admin_commission": 500000
    },
    "monthly_stats": [
      {
        "month": "2024-01",
        "month_name": "January 2024",
        "total_bookings": 80,
        "completed_bookings": 75,
        "cancelled_bookings": 5,
        "total_revenue": 400000,
        "avg_booking_value": 5333.33
      }
    ],
    "status_breakdown": [
      {
        "status": "completed",
        "count": 950,
        "total_revenue": 4750000
      },
      {
        "status": "cancelled",
        "count": 50,
        "total_revenue": 250000
      }
    ]
  }
}
```

**Example Request:**
```bash
GET /admin/stats/annual-bookings?year=2024
```

---

### 14. Get Website Reach Statistics

Get website reach and leads statistics including user growth, vendor counts, and lead generation.

**Endpoint:** `GET /admin/stats/website-reach`

**Query Parameters:**
- `period` (optional): Time period - `week`, `month`, or `year` (default: `year`)

**Response:**
```json
{
  "success": true,
  "message": "Website reach statistics retrieved successfully",
  "data": {
    "period": "year",
    "total_users": 5000,
    "new_users_in_period": 1000,
    "verified_users": {
      "total": 5000,
      "phone_verified": 4500,
      "profile_completed": 4000
    },
    "vendors": {
      "total": 100,
      "active_vendors": 80,
      "suspended_vendors": 5,
      "new_this_month": 10
    },
    "drivers": {
      "total": 300,
      "active_drivers": 250,
      "new_this_month": 30
    },
    "partners": {
      "total": 50,
      "verified_partners": 45
    },
    "leads": {
      "unique_leads": 200,
      "total_leads": 500
    },
    "user_growth": [
      {
        "month": "2024-01",
        "month_name": "January 2024",
        "new_users": 100
      }
    ]
  }
}
```

**Example Request:**
```bash
GET /admin/stats/website-reach?period=month
```

---

### 15. Get Comprehensive Admin Statistics

Get overall admin statistics including recent activity and top performing vendors.

**Endpoint:** `GET /admin/stats`

**Response:**
```json
{
  "success": true,
  "message": "Admin statistics retrieved successfully",
  "data": {
    "overall": {
      "total_users": 5000,
      "total_vendors": 100,
      "active_vendors": 80,
      "suspended_vendors": 5,
      "total_drivers": 300,
      "active_drivers": 250,
      "total_partners": 50,
      "total_vehicles": 500,
      "active_vehicles": 400,
      "total_bookings": 1000,
      "completed_bookings": 950,
      "cancelled_bookings": 50,
      "total_revenue": 5000000,
      "admin_commission": 500000
    },
    "recent_activity": {
      "new_users": 50,
      "new_vendors": 5,
      "new_bookings": 100,
      "completed_bookings": 95,
      "revenue_7_days": 250000
    },
    "top_vendors": [
      {
        "id": "vendor_id",
        "name": "Top Vendor",
        "email": "vendor@example.com",
        "star_rating": 4.8,
        "total_bookings": 200,
        "completed_bookings": 190,
        "total_earnings": 1000000
      }
    ]
  }
}
```

**Example Request:**
```bash
GET /admin/stats
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```
or
```json
{
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Vendor not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Penalty amount and reason are required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve vendors",
  "error": "Error message details"
}
```

---

## Notes

1. **Pagination**: All list endpoints support pagination. If not specified, defaults are:
   - `page`: 1
   - `limit`: 10 (or 20 for bookings endpoints)

2. **Filtering**: Most endpoints support filtering by status, search terms, and date ranges where applicable.

3. **Cascading Actions**:
   - Deactivating a vendor automatically deactivates all their drivers
   - Suspending a vendor automatically deactivates all their drivers
   - Drivers cannot be activated if their vendor is inactive or suspended

4. **Penalties**: When a penalty is applied to a vendor, it is deducted from their balance and a payment record is created with type `penalty`.

5. **Statistics**: Statistics endpoints provide real-time data and can be filtered by time periods (week, month, year).

---

## Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/vendors` | GET | List all vendors |
| `/admin/vendors/:vendorId` | GET | Get vendor details |
| `/admin/vendors/:vendorId/status` | PUT | Activate/deactivate vendor |
| `/admin/vendors/:vendorId/penalty` | POST | Apply penalty to vendor |
| `/admin/vendors/:vendorId/suspend` | PUT | Suspend/unsuspend vendor |
| `/admin/vendors/:vendorId/bookings` | GET | Get vendor bookings |
| `/admin/drivers` | GET | List all drivers |
| `/admin/drivers/:driverId/status` | PUT | Activate/deactivate driver |
| `/admin/users` | GET | List all users |
| `/admin/users/:userId` | GET | Get user details |
| `/admin/users/:userId` | PUT | Update user data |
| `/admin/users/:userId` | DELETE | Delete user |
| `/admin/stats/annual-bookings` | GET | Get annual booking stats |
| `/admin/stats/website-reach` | GET | Get website reach stats |
| `/admin/stats` | GET | Get comprehensive stats |

