# Booking System API Documentation

## Overview
The booking system handles the complete lifecycle of vehicle bookings from creation to completion. It supports three user types: **Users** (customers), **Vendors** (vehicle owners), and **Drivers**.

## Booking Flow
```
User creates booking → Vendor approves & assigns driver → Driver manages trip → Booking completed
```

## Status Flow
```
waiting → approved → preongoing → ongoing → completed/cancelled
```

## API Endpoints

### Base URL
```
/booking
```

### Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## User Endpoints

### 1. Create Booking
**POST** `/booking/user/create`

Creates a new booking for a vehicle.

**Request Body:**
```json
{
  "vehicle_id": "string (required)",
  "partner_id": "string (optional - if referred by partner)",
  "pickup_location": "string (required)",
  "dropoff_location": "string (required)",
  "pickup_date": "datetime (required)",
  "drop_date": "datetime (required)",
  "path": "string (required - route/path)",
  "distance": "number (required - in km)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking_id",
    "customer_id": "user_id",
    "vehicle_id": "vehicle_id",
    "vendor_id": "vendor_id",
    "partner_id": "partner_id",
    "pickup_location": "pickup_address",
    "dropoff_location": "dropoff_address",
    "pickup_date": "2024-01-01 10:00:00",
    "drop_date": "2024-01-01 12:00:00",
    "price": 500,
    "path": "route_details",
    "distance": 25,
    "status": "waiting",
    "created_at": "2024-01-01 09:00:00",
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "vehicle_model": "Toyota Innova",
    "vehicle_registration": "KA01AB1234",
    "no_of_seats": 7,
    "vendor_name": "ABC Travels",
    "vendor_phone": "+1234567890",
    "partner_name": "Referral Partner"
  }
}
```

### 2. Get User's Bookings
**GET** `/booking/user/my-bookings`

Retrieves all bookings for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (`waiting`, `approved`, `preongoing`, `ongoing`, `completed`, `cancelled`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "bookings": [...],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

### 3. Get Booking Details
**GET** `/booking/user/booking/:bookingId`

Gets detailed information about a specific booking.

**Response:**
```json
{
  "success": true,
  "message": "Booking details retrieved successfully",
  "data": {
    "id": "booking_id",
    "customer_id": "user_id",
    "vehicle_id": "vehicle_id",
    "driver_id": "driver_id",
    "vendor_id": "vendor_id",
    "partner_id": "partner_id",
    "pickup_location": "pickup_address",
    "dropoff_location": "dropoff_address",
    "pickup_date": "2024-01-01 10:00:00",
    "drop_date": "2024-01-01 12:00:00",
    "price": 500,
    "path": "route_details",
    "distance": 25,
    "status": "approved",
    "created_at": "2024-01-01 09:00:00",
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "customer_email": "john@example.com",
    "vehicle_model": "Toyota Innova",
    "vehicle_registration": "KA01AB1234",
    "vehicle_image": "image_url",
    "no_of_seats": 7,
    "per_km_charge": 20.00,
    "vendor_name": "ABC Travels",
    "vendor_phone": "+1234567890",
    "vendor_email": "vendor@example.com",
    "driver_name": "Driver Name",
    "driver_phone": "+1234567890",
    "partner_name": "Referral Partner"
  }
}
```

### 4. Cancel Booking
**PUT** `/booking/user/booking/:bookingId/cancel`

Cancels a booking (only for `waiting` or `approved` status).

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

## Vendor Endpoints

### 1. Get Vendor's Bookings
**GET** `/booking/vendor/my-bookings`

Retrieves all bookings for the authenticated vendor.

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Vendor bookings retrieved successfully",
  "data": {
    "bookings": [...],
    "pagination": {...}
  }
}
```

### 2. Get Booking Details
**GET** `/booking/vendor/booking/:bookingId`

Gets detailed information about a specific booking (vendor's perspective).

### 3. Update Booking Status
**PUT** `/booking/vendor/booking/:bookingId/status`

Updates booking status and assigns driver.

**Request Body:**
```json
{
  "status": "approved|preongoing|ongoing|completed|cancelled",
  "driver_id": "string (required for approved status)"
}
```

**Status Transitions:**
- `waiting` → `approved` (requires driver_id)
- `approved` → `preongoing`
- `preongoing` → `ongoing`
- `ongoing` → `completed`
- Any status → `cancelled`

**Response:**
```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "id": "booking_id",
    "status": "approved",
    "driver_id": "driver_id",
    "driver_name": "Driver Name",
    "driver_phone": "+1234567890",
    ...
  }
}
```

---

## Driver Endpoints

### 1. Get Driver's Bookings
**GET** `/booking/driver/my-bookings`

Retrieves all bookings assigned to the authenticated driver.

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### 2. Get Booking Details
**GET** `/booking/driver/booking/:bookingId`

Gets detailed information about a specific booking (driver's perspective).

### 3. Update Booking Status
**PUT** `/booking/driver/booking/:bookingId/status`

Updates booking status (limited to driver-specific statuses).

**Request Body:**
```json
{
  "status": "preongoing|ongoing|completed"
}
```

**Driver Status Transitions:**
- `approved` → `preongoing`
- `preongoing` → `ongoing`
- `ongoing` → `completed`

**Response:**
```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "id": "booking_id",
    "status": "ongoing",
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "pickup_location": "pickup_address",
    "dropoff_location": "dropoff_address",
    ...
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: vehicle_id, pickup_location, dropoff_location, pickup_date, drop_date, path, distance"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Booking not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create booking",
  "error": "Error details"
}
```

---

## Booking Status Meanings

- **waiting**: Booking created, waiting for vendor approval
- **approved**: Vendor approved and assigned driver
- **preongoing**: Driver is on the way to pickup location
- **ongoing**: Trip is in progress
- **completed**: Trip completed successfully
- **cancelled**: Booking cancelled by user or vendor

---

## Business Rules

1. **Vehicle Availability**: Only one active booking per vehicle at a time
2. **Price Calculation**: `price = distance × per_km_charge`
3. **Status Transitions**: Strict status flow enforcement
4. **Driver Assignment**: Required when approving booking
5. **Cancellation**: Only allowed for `waiting` and `approved` statuses
6. **Historical Data**: Completed/cancelled bookings moved to `prevbookings` table

---

## Integration Notes

- All endpoints require JWT authentication
- User type is determined from JWT token
- Automatic price calculation based on vehicle's per_km_charge
- Database triggers handle moving completed bookings to history
- Foreign key constraints ensure data integrity
- Pagination supported for list endpoints
