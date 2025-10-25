# Comprehensive API Documentation - Travel.io Platform

## Overview
This document covers all the new endpoints for vendors, partners, and admin payment management system. The platform follows a commission-based model where:
- **Admin** receives 10% commission from all bookings
- **Vendors** receive 90% of booking amount (after admin commission)
- **Partners** receive 5% commission for successful referrals

## Base URLs
- **Vendor API**: `/vendor`
- **Partner API**: `/partner`
- **Admin API**: `/admin`

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## Vendor Endpoints

### 1. Get Vendor Dashboard
**GET** `/vendor/dashboard`

Returns comprehensive dashboard statistics for vendors.

**Response:**
```json
{
  "success": true,
  "message": "Vendor dashboard data retrieved successfully",
  "data": {
    "ongoing_bookings": 5,
    "completed_rides": 45,
    "total_earnings": 125000,
    "pending_payments": 25000,
    "paid_amount": 100000,
    "recent_rides": [
      {
        "id": "booking_id",
        "pickup_location": "Airport",
        "dropoff_location": "Hotel",
        "pickup_date": "2024-01-01 10:00:00",
        "price": 500,
        "status": "completed",
        "customer_name": "John Doe",
        "customer_phone": "+1234567890",
        "vehicle_model": "Toyota Innova"
      }
    ]
  }
}
```

### 2. Get Ongoing Bookings
**GET** `/vendor/ongoing-bookings`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`waiting`, `approved`, `preongoing`, `ongoing`)

**Response:**
```json
{
  "success": true,
  "message": "Ongoing bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "id": "booking_id",
        "pickup_location": "Airport",
        "dropoff_location": "Hotel",
        "pickup_date": "2024-01-01 10:00:00",
        "drop_date": "2024-01-01 12:00:00",
        "price": 500,
        "status": "approved",
        "created_at": "2024-01-01 09:00:00",
        "customer_name": "John Doe",
        "customer_phone": "+1234567890",
        "vehicle_model": "Toyota Innova",
        "vehicle_registration": "KA01AB1234",
        "driver_name": "Driver Name",
        "driver_phone": "+1234567890"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

### 3. Get Completed Rides
**GET** `/vendor/completed-rides`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "message": "Completed rides retrieved successfully",
  "data": {
    "rides": [
      {
        "id": "booking_id",
        "pickup_location": "Airport",
        "dropoff_location": "Hotel",
        "pickup_date": "2024-01-01 10:00:00",
        "drop_date": "2024-01-01 12:00:00",
        "price": 500,
        "status": "completed",
        "created_at": "2024-01-01 09:00:00",
        "customer_name": "John Doe",
        "customer_phone": "+1234567890",
        "vehicle_model": "Toyota Innova",
        "vehicle_registration": "KA01AB1234",
        "driver_name": "Driver Name",
        "driver_phone": "+1234567890",
        "payment_status": "paid"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 45,
      "total_pages": 5
    }
  }
}
```

### 4. Get Vendor Earnings
**GET** `/vendor/earnings`

**Query Parameters:**
- `period` (optional): Time period (`all`, `month`, `week`)

**Response:**
```json
{
  "success": true,
  "message": "Vendor earnings retrieved successfully",
  "data": {
    "period": "all",
    "total_earnings": 125000,
    "paid_amount": 100000,
    "pending_amount": 25000,
    "monthly_breakdown": [
      {
        "month": "2024-01",
        "rides_count": 15,
        "total_earnings": 25000
      }
    ]
  }
}
```

---

## Partner Endpoints

### 1. Get Partner Dashboard
**GET** `/partner/dashboard`

**Response:**
```json
{
  "success": true,
  "message": "Partner dashboard data retrieved successfully",
  "data": {
    "total_referrals": 25,
    "total_commission": 12500,
    "pending_commission": 2500,
    "paid_commission": 10000,
    "recent_referrals": [
      {
        "id": "booking_id",
        "pickup_location": "Airport",
        "dropoff_location": "Hotel",
        "pickup_date": "2024-01-01 10:00:00",
        "price": 500,
        "status": "completed",
        "customer_name": "John Doe",
        "customer_phone": "+1234567890",
        "vehicle_model": "Toyota Innova",
        "vendor_name": "ABC Travels",
        "commission_amount": 25,
        "commission_status": "completed"
      }
    ]
  }
}
```

### 2. Get Commission History
**GET** `/partner/commission-history`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`pending`, `completed`, `failed`)
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "message": "Commission history retrieved successfully",
  "data": {
    "commissions": [
      {
        "id": "transaction_id",
        "commission_amount": 25,
        "status": "completed",
        "created_at": "2024-01-01 09:00:00",
        "booking_id": "booking_id",
        "pickup_location": "Airport",
        "dropoff_location": "Hotel",
        "pickup_date": "2024-01-01 10:00:00",
        "booking_amount": 500,
        "customer_name": "John Doe",
        "customer_phone": "+1234567890",
        "vehicle_model": "Toyota Innova",
        "vendor_name": "ABC Travels"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

### 3. Get Partner Earnings
**GET** `/partner/earnings`

**Query Parameters:**
- `period` (optional): Time period (`all`, `month`, `week`)

**Response:**
```json
{
  "success": true,
  "message": "Partner earnings retrieved successfully",
  "data": {
    "period": "all",
    "total_commission": 12500,
    "pending_commission": 2500,
    "monthly_breakdown": [
      {
        "month": "2024-01",
        "referrals_count": 5,
        "total_commission": 2500
      }
    ]
  }
}
```

### 4. Get Referral Statistics
**GET** `/partner/referral-stats`

**Response:**
```json
{
  "success": true,
  "message": "Partner referral statistics retrieved successfully",
  "data": {
    "overview": {
      "total_referrals": 25,
      "completed_referrals": 20,
      "cancelled_referrals": 5,
      "total_booking_value": 100000,
      "total_commission_earned": 5000
    },
    "monthly_breakdown": [
      {
        "month": "2024-01",
        "referrals_count": 5,
        "completed_count": 4,
        "booking_value": 2000,
        "commission_earned": 100
      }
    ]
  }
}
```

---

## Admin Endpoints

### 1. Get Admin Dashboard
**GET** `/admin/dashboard`

**Response:**
```json
{
  "success": true,
  "message": "Admin dashboard data retrieved successfully",
  "data": {
    "total_revenue": 500000,
    "admin_commission": 50000,
    "total_vendor_payments": 400000,
    "total_partner_payments": 25000,
    "pending_vendor_payments": 45000,
    "pending_partner_payments": 2500,
    "remaining_amount_to_pay": 47500,
    "total_bookings": 1000,
    "completed_bookings": 800,
    "active_vendors": 50,
    "active_partners": 25
  }
}
```

### 2. Get Pending Vendor Payments
**GET** `/admin/pending-vendor-payments`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Pending vendor payments retrieved successfully",
  "data": {
    "payments": [
      {
        "booking_id": "booking_id",
        "pickup_location": "Airport",
        "dropoff_location": "Hotel",
        "pickup_date": "2024-01-01 10:00:00",
        "amount": 450,
        "created_at": "2024-01-01 09:00:00",
        "vendor_id": "vendor_id",
        "vendor_name": "ABC Travels",
        "vendor_email": "vendor@example.com",
        "vendor_phone": "+1234567890",
        "customer_name": "John Doe",
        "vehicle_model": "Toyota Innova"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 15,
      "total_pages": 2
    }
  }
}
```

### 3. Get Pending Partner Payments
**GET** `/admin/pending-partner-payments`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Pending partner payments retrieved successfully",
  "data": {
    "payments": [
      {
        "transaction_id": "transaction_id",
        "commission_amount": 25,
        "created_at": "2024-01-01 09:00:00",
        "partner_id": "partner_id",
        "partner_name": "Partner Name",
        "partner_email": "partner@example.com",
        "partner_phone": "+1234567890",
        "company_name": "Partner Company",
        "booking_id": "booking_id",
        "pickup_location": "Airport",
        "dropoff_location": "Hotel",
        "pickup_date": "2024-01-01 10:00:00",
        "booking_amount": 500,
        "customer_name": "John Doe",
        "vehicle_model": "Toyota Innova"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 8,
      "total_pages": 1
    }
  }
}
```

### 4. Pay Vendor
**POST** `/admin/pay-vendor`

**Request Body:**
```json
{
  "booking_id": "booking_id",
  "vendor_id": "vendor_id",
  "amount": 450,
  "payment_method": "bank_transfer",
  "notes": "Payment for completed ride"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor payment completed successfully",
  "data": {
    "payment_id": "payment_id",
    "booking_id": "booking_id",
    "vendor_id": "vendor_id",
    "amount": 450,
    "payment_method": "bank_transfer",
    "notes": "Payment for completed ride"
  }
}
```

### 5. Pay Partner
**POST** `/admin/pay-partner`

**Request Body:**
```json
{
  "transaction_id": "transaction_id",
  "partner_id": "partner_id",
  "amount": 25,
  "payment_method": "bank_transfer",
  "notes": "Commission payment for referral"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partner payment completed successfully",
  "data": {
    "payment_id": "payment_id",
    "transaction_id": "transaction_id",
    "partner_id": "partner_id",
    "amount": 25,
    "payment_method": "bank_transfer",
    "notes": "Commission payment for referral"
  }
}
```

### 6. Get All Payments
**GET** `/admin/all-payments`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by type (`withdrawal`, `penalty`)
- `status` (optional): Filter by status (`pending`, `completed`, `failed`)
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "message": "All payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "payment_id",
        "vendor_id": "vendor_id",
        "partner_id": null,
        "amount": 450,
        "status": "completed",
        "type": "withdrawal",
        "created_at": "2024-01-01 09:00:00",
        "vendor_name": "ABC Travels",
        "vendor_email": "vendor@example.com",
        "partner_name": null,
        "partner_email": null,
        "company_name": null
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

### 7. Get Financial Analytics
**GET** `/admin/financial-analytics`

**Query Parameters:**
- `period` (optional): Time period (`week`, `month`, `year`)

**Response:**
```json
{
  "success": true,
  "message": "Financial analytics retrieved successfully",
  "data": {
    "period": "month",
    "revenue_breakdown": {
      "total_revenue": 100000,
      "admin_commission": 10000,
      "vendor_earnings": 90000,
      "partner_commissions": 5000
    },
    "monthly_trend": [
      {
        "month": "2024-01",
        "bookings_count": 20,
        "revenue": 10000,
        "admin_commission": 1000,
        "vendor_earnings": 9000
      }
    ],
    "top_vendors": [
      {
        "id": "vendor_id",
        "name": "ABC Travels",
        "email": "vendor@example.com",
        "completed_rides": 50,
        "total_earnings": 25000,
        "vendor_share": 22500
      }
    ],
    "top_partners": [
      {
        "id": "partner_id",
        "name": "Partner Name",
        "email": "partner@example.com",
        "company_name": "Partner Company",
        "referrals_count": 10,
        "total_commission": 500
      }
    ]
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Status Codes
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Commission Structure
- **Admin Commission**: 10% of total booking amount
- **Vendor Share**: 90% of total booking amount
- **Partner Commission**: 5% of total booking amount (when referral is used)

## Payment Flow
1. Customer makes payment → Admin receives 100%
2. Ride completes → Admin calculates commissions
3. Admin pays vendor (90% of booking amount)
4. Admin pays partner (5% commission if referral used)
5. Admin keeps 10% commission

This system ensures transparent financial management and fair distribution of earnings across all stakeholders.
