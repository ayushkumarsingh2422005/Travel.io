# Razorpay Payment Integration API Documentation

## Overview
The payment system integrates Razorpay for secure payment processing before booking creation. Users must complete payment before a booking is created.

## Payment Flow
```
1. User creates payment order → 2. User pays via Razorpay → 3. Payment verification → 4. Booking created
```

## Environment Variables Required
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## API Endpoints

### Base URL
```
/payment
```

### Authentication
All endpoints (except webhook) require JWT authentication via `Authorization: Bearer <token>` header.

---

## Payment Endpoints

### 1. Create Payment Order
**POST** `/payment/create-order`

Creates a Razorpay payment order for booking.

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
  "message": "Payment order created successfully",
  "data": {
    "order_id": "order_razorpay_id",
    "amount": 500,
    "currency": "INR",
    "payment_id": "internal_payment_id",
    "vehicle_details": {
      "model": "Toyota Innova",
      "registration_no": "KA01AB1234",
      "vendor_name": "ABC Travels"
    },
    "booking_details": {
      "pickup_location": "Airport",
      "dropoff_location": "Hotel",
      "pickup_date": "2024-01-01 10:00:00",
      "drop_date": "2024-01-01 12:00:00",
      "distance": 25,
      "amount": 500
    }
  }
}
```

### 2. Verify Payment and Create Booking
**POST** `/payment/verify`

Verifies Razorpay payment and creates booking if successful.

**Request Body:**
```json
{
  "payment_id": "internal_payment_id",
  "razorpay_order_id": "order_razorpay_id",
  "razorpay_payment_id": "payment_razorpay_id",
  "razorpay_signature": "razorpay_signature"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and booking created successfully",
  "data": {
    "booking": {
      "id": "booking_id",
      "customer_id": "user_id",
      "vehicle_id": "vehicle_id",
      "vendor_id": "vendor_id",
      "partner_id": "partner_id",
      "pickup_location": "Airport",
      "dropoff_location": "Hotel",
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
    },
    "payment": {
      "payment_id": "internal_payment_id",
      "razorpay_payment_id": "payment_razorpay_id",
      "amount": 500,
      "status": "success"
    }
  }
}
```

### 3. Get Payment Status
**GET** `/payment/status/:payment_id`

Gets the status of a specific payment.

**Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved successfully",
  "data": {
    "payment_id": "internal_payment_id",
    "status": "success",
    "amount": 500,
    "razorpay_order_id": "order_razorpay_id",
    "razorpay_payment_id": "payment_razorpay_id",
    "booking_id": "booking_id",
    "booking_status": "waiting",
    "vehicle_model": "Toyota Innova",
    "vendor_name": "ABC Travels",
    "booking_details": {
      "vehicle_id": "vehicle_id",
      "pickup_location": "Airport",
      "dropoff_location": "Hotel",
      "pickup_date": "2024-01-01 10:00:00",
      "drop_date": "2024-01-01 12:00:00",
      "path": "route_details",
      "distance": 25,
      "vehicle_model": "Toyota Innova",
      "vendor_name": "ABC Travels"
    },
    "created_at": "2024-01-01 09:00:00"
  }
}
```

### 4. Get Payment History
**GET** `/payment/history`

Gets user's payment history.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`pending`, `success`, `failed`)

**Response:**
```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "payment_id",
        "customer_id": "user_id",
        "vendor_id": "vendor_id",
        "booking_id": "booking_id",
        "partner_id": "partner_id",
        "payment_id": "razorpay_order_id",
        "razorpay_order_id": "order_razorpay_id",
        "razorpay_payment_id": "payment_razorpay_id",
        "amount": 500,
        "status": "success",
        "payment_data": "{\"vehicle_id\":\"...\",\"pickup_location\":\"...\"}",
        "created_at": "2024-01-01 09:00:00",
        "updated_at": "2024-01-01 09:05:00",
        "booking_status": "waiting",
        "pickup_location": "Airport",
        "dropoff_location": "Hotel",
        "pickup_date": "2024-01-01 10:00:00",
        "drop_date": "2024-01-01 12:00:00",
        "vehicle_model": "Toyota Innova",
        "vehicle_registration": "KA01AB1234",
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

### 5. Razorpay Webhook
**POST** `/payment/webhook`

Handles Razorpay webhook events (no authentication required).

**Headers:**
```
x-razorpay-signature: webhook_signature
```

**Request Body:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "payment_razorpay_id",
        "order_id": "order_razorpay_id",
        "status": "captured",
        "amount": 50000
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Frontend Integration Example

### 1. Create Payment Order
```javascript
const createPaymentOrder = async (bookingData) => {
  const response = await fetch('/payment/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });
  
  const result = await response.json();
  return result.data;
};
```

### 2. Initialize Razorpay
```javascript
const initializeRazorpay = (orderData) => {
  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    amount: orderData.amount * 100, // Convert to paise
    currency: 'INR',
    name: 'Travel.io',
    description: `Booking for ${orderData.vehicle_details.model}`,
    order_id: orderData.order_id,
    handler: async function (response) {
      // Verify payment
      await verifyPayment({
        payment_id: orderData.payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });
    },
    prefill: {
      name: user.name,
      email: user.email,
      contact: user.phone
    },
    theme: {
      color: '#3399cc'
    }
  };
  
  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

### 3. Verify Payment
```javascript
const verifyPayment = async (paymentData) => {
  const response = await fetch('/payment/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentData)
  });
  
  const result = await response.json();
  if (result.success) {
    // Booking created successfully
    console.log('Booking created:', result.data.booking);
  }
};
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
  "message": "Vehicle not found or not available"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create payment order",
  "error": "Error details"
}
```

---

## Database Schema Updates

### Transactions Table
```sql
CREATE TABLE transactions (
    id CHAR(64) PRIMARY KEY,
    customer_id CHAR(64) NOT NULL,
    vendor_id CHAR(64) NOT NULL,
    booking_id CHAR(64),
    partner_id CHAR(64),
    payment_id CHAR(64) NOT NULL UNIQUE,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    amount BIGINT NOT NULL,
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    payment_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## Business Rules

1. **Payment Required**: All bookings must be paid before creation
2. **Price Calculation**: `amount = distance × per_km_charge`
3. **Vehicle Availability**: Checked before payment order creation
4. **Partner Commission**: 5% commission for partner referrals
5. **Webhook Security**: Signature verification required
6. **Transaction Atomicity**: Payment verification and booking creation in single transaction

---

## Security Features

- JWT authentication for all endpoints
- Razorpay signature verification
- Webhook signature validation
- Database transactions for data consistency
- Input validation and sanitization
- SQL injection prevention with parameterized queries
