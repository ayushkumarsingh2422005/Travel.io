# 📡 API Changes Reference - Frontend Integration Guide

## 🔄 Breaking Changes

### ⚠️ **CRITICAL: Payment Order Creation Changed**

#### **OLD API (DEPRECATED):**
```javascript
POST /api/payment/create-order

// OLD Request Body
{
  "vehicle_id": "abc123",           // ❌ REMOVED
  "pickup_location": "Location A",
  "dropoff_location": "Location B",
  "pickup_date": "2025-11-10 10:00:00",
  "drop_date": "2025-11-10 18:00:00",
  "path": "route_info",
  "distance": 50,
  "partner_id": "partner_xyz"       // Optional
}

// OLD Response
{
  "success": true,
  "data": {
    "order_id": "order_xxx",
    "amount": 5000,
    "vehicle_details": {              // ❌ REMOVED
      "model": "Toyota Innova",
      "registration_no": "KA01AB1234"
    }
  }
}
```

#### **NEW API (CURRENT):**
```javascript
POST /api/payment/create-order

// NEW Request Body
{
  "cab_category_id": "cat_xyz",      // ✅ REQUIRED (changed from vehicle_id)
  "pickup_location": "Location A",
  "dropoff_location": "Location B",
  "pickup_date": "2025-11-10 10:00:00",
  "drop_date": "2025-11-10 18:00:00",
  "path": "route_info",
  "distance": 50,
  "partner_id": "partner_xyz"        // Optional
}

// NEW Response
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "order_id": "order_xxx",
    "amount": 5000,
    "currency": "INR",
    "payment_id": "payment_yyy",
    "cab_category_details": {        // ✅ NEW
      "id": "cat_xyz",
      "category": "Sedan",
      "price_per_km": 12,
      "min_seats": 4,
      "max_seats": 5
    },
    "booking_details": {
      "pickup_location": "Location A",
      "dropoff_location": "Location B",
      "pickup_date": "2025-11-10 10:00:00",
      "drop_date": "2025-11-10 18:00:00",
      "distance": 50,
      "amount": 5000
    }
  }
}
```

---

## ✨ New Endpoints

### 1️⃣ **Get All Cab Categories (Public)**
```javascript
GET /api/user/cab-categories

// No authentication required
// No request body

// Response
{
  "success": true,
  "count": 5,
  "cab_categories": [
    {
      "id": "cat_123",
      "category": "Sedan",
      "price_per_km": 12.50,
      "min_no_of_seats": 4,
      "max_no_of_seats": 5,
      "fuel_charges": 50.00,
      "driver_charges": 100.00,
      "night_charges": 200.00,
      "base_discount": 5.00,          // Percentage
      "category_image": "https://...",
      "notes": "Standard sedan cars",
      "is_active": 1,
      "included_vehicle_types": ["Sedan", "Compact Sedan"]
    },
    {
      "id": "cat_456",
      "category": "SUV",
      "price_per_km": 18.00,
      "min_no_of_seats": 6,
      "max_no_of_seats": 8,
      // ...
    }
  ]
}
```

**Frontend Usage:**
```javascript
// Fetch cab categories on booking page
const fetchCabCategories = async () => {
  const response = await fetch('/api/user/cab-categories');
  const data = await response.json();
  
  // Display categories to user
  displayCategories(data.cab_categories);
};
```

---

### 2️⃣ **Get Single Cab Category (Public)**
```javascript
GET /api/user/cab-categories/:id

// Example: GET /api/user/cab-categories/cat_123

// Response
{
  "success": true,
  "cab_category": {
    "id": "cat_123",
    "category": "Sedan",
    "price_per_km": 12.50,
    "min_no_of_seats": 4,
    "max_no_of_seats": 5,
    // ... full details
  }
}
```

**Frontend Usage:**
```javascript
// Show category details when user clicks on a category
const showCategoryDetails = async (categoryId) => {
  const response = await fetch(`/api/user/cab-categories/${categoryId}`);
  const data = await response.json();
  
  // Calculate estimated price
  const distance = calculateDistance(pickup, dropoff);
  const estimatedPrice = distance * data.cab_category.price_per_km;
  
  displayPrice(estimatedPrice);
};
```

---

### 3️⃣ **Vendor: Get Pending Booking Requests**
```javascript
GET /api/vendor/pending-requests?page=1&limit=10

// Authentication: Vendor JWT token required
Headers: {
  "Authorization": "Bearer <vendor_token>"
}

// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 10)

// Response
{
  "success": true,
  "message": "Pending booking requests retrieved successfully",
  "data": {
    "bookings": [
      {
        "id": "booking_123",
        "pickup_location": "Location A",
        "dropoff_location": "Location B",
        "pickup_date": "2025-11-10T10:00:00.000Z",
        "drop_date": "2025-11-10T18:00:00.000Z",
        "price": 5000,
        "distance": 50,
        "path": "route_info",
        "status": "waiting",
        "created_at": "2025-11-06T12:00:00.000Z",
        "customer_name": "John Doe",
        "customer_phone": "+919876543210",
        "cab_category_id": "cat_123",
        "cab_category_name": "Sedan",
        "cab_category_price_per_km": 12.50,
        "min_seats": 4,
        "max_seats": 5,
        "cab_category_image": "https://..."
      }
      // ... more bookings
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

**Frontend Usage:**
```javascript
// Vendor dashboard - show pending requests
const fetchPendingRequests = async () => {
  const token = getVendorToken();
  
  const response = await fetch('/api/vendor/pending-requests?page=1&limit=10', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  displayPendingBookings(data.data.bookings);
};
```

---

### 4️⃣ **Vendor: Accept Booking Request**
```javascript
POST /api/vendor/accept-booking

// Authentication: Vendor JWT token required
Headers: {
  "Authorization": "Bearer <vendor_token>",
  "Content-Type": "application/json"
}

// Request Body
{
  "booking_id": "booking_123",
  "driver_id": "driver_456",
  "vehicle_id": "vehicle_789"
}

// Success Response (200)
{
  "success": true,
  "message": "Booking accepted successfully",
  "data": {
    "id": "booking_123",
    "customer_id": "user_xxx",
    "vehicle_id": "vehicle_789",        // Now assigned
    "driver_id": "driver_456",          // Now assigned
    "vendor_id": "vendor_yyy",          // Now assigned
    "cab_category_id": "cat_123",
    "pickup_location": "Location A",
    "dropoff_location": "Location B",
    "pickup_date": "2025-11-10T10:00:00.000Z",
    "drop_date": "2025-11-10T18:00:00.000Z",
    "price": 5000,
    "path": "route_info",
    "distance": 50,
    "status": "approved",               // Changed from 'waiting'
    "created_at": "2025-11-06T12:00:00.000Z",
    "customer_name": "John Doe",
    "customer_phone": "+919876543210",
    "vehicle_model": "Toyota Innova",
    "vehicle_registration": "KA01AB1234",
    "driver_name": "Driver Kumar",
    "driver_phone": "+919988776655",
    "cab_category_name": "Sedan"
  }
}

// Error Responses

// 400 - Missing fields
{
  "success": false,
  "message": "Booking ID, driver ID, and vehicle ID are required"
}

// 404 - Booking already accepted
{
  "success": false,
  "message": "Booking not found or already accepted by another vendor"
}

// 400 - Vehicle doesn't match requirements
{
  "success": false,
  "message": "Vehicle does not meet minimum seat requirement (4 seats required)"
}

// 400 - Vehicle already booked
{
  "success": false,
  "message": "Vehicle is already booked for the requested time period"
}

// 400 - Driver already assigned
{
  "success": false,
  "message": "Driver is already assigned for the requested time period"
}

// 409 - Race condition (another vendor accepted first)
{
  "success": false,
  "message": "Booking was already accepted by another vendor"
}
```

**Frontend Usage:**
```javascript
// Vendor accepts a booking
const acceptBooking = async (bookingId, driverId, vehicleId) => {
  const token = getVendorToken();
  
  try {
    const response = await fetch('/api/vendor/accept-booking', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        booking_id: bookingId,
        driver_id: driverId,
        vehicle_id: vehicleId
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showSuccess('Booking accepted successfully!');
      // Refresh pending requests list
      fetchPendingRequests();
      // Navigate to ongoing bookings
      navigateToOngoingBookings();
    } else {
      // Handle specific errors
      if (response.status === 409) {
        showError('This booking was just accepted by another vendor.');
      } else {
        showError(data.message);
      }
    }
  } catch (error) {
    showError('Failed to accept booking. Please try again.');
  }
};
```

---

## 🔄 Modified Endpoints (Backward Compatible)

### **User Bookings (Enhanced)**
```javascript
GET /api/booking/user/my-bookings?status=waiting&page=1&limit=10

// Response NOW includes cab_category fields
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking_123",
        // ... existing fields ...
        "vehicle_model": null,              // NULL until vendor accepts
        "vendor_name": null,                // NULL until vendor accepts
        "driver_name": null,                // NULL until vendor accepts
        "cab_category_name": "Sedan",       // ✅ NEW
        "cab_category_price_per_km": 12.50, // ✅ NEW
        "cab_category_image": "https://...", // ✅ NEW
        "status": "waiting"
      }
    ]
  }
}
```

### **Vendor Bookings (Enhanced)**
```javascript
GET /api/vendor/ongoing-bookings

// Response NOW includes cab_category fields
// Only shows bookings assigned to this vendor (vendor_id = current vendor)
```

### **Booking Details (Enhanced)**
```javascript
GET /api/booking/user/booking/:bookingId

// Response NOW includes cab_category fields
```

---

## 🎨 Frontend UI Changes Required

### **1. Booking Page Redesign**

#### OLD UI Flow:
```
1. Show list of vehicles (with vendor, driver pre-assigned)
2. User selects vehicle
3. Payment
4. Booking confirmed with vendor/driver
```

#### NEW UI Flow:
```
1. Show list of CAB CATEGORIES (Sedan, SUV, Luxury, etc.)
2. User selects category (show estimated price)
3. Payment
4. Booking created (status: "Waiting for vendor acceptance")
5. Show message: "Your booking is waiting for a vendor to accept"
```

**Example UI:**
```jsx
// Cab Category Selection Component
<div className="category-card">
  <img src={category.category_image} alt={category.category} />
  <h3>{category.category}</h3>
  <p>₹{category.price_per_km}/km</p>
  <p>Seats: {category.min_no_of_seats}-{category.max_no_of_seats}</p>
  <p>Estimated Price: ₹{estimatedPrice}</p>
  <button onClick={() => selectCategory(category.id)}>
    Book Now
  </button>
</div>
```

---

### **2. User Booking Status Display**

**Status: "waiting"**
```jsx
<div className="booking-status waiting">
  <h3>Booking Status: Waiting for Vendor</h3>
  <p>Your booking request has been sent to vendors.</p>
  <p>Cab Category: {booking.cab_category_name}</p>
  <p>You will be notified when a vendor accepts your booking.</p>
  
  {/* Show these as NULL/empty */}
  <p>Vendor: Not assigned yet</p>
  <p>Vehicle: Not assigned yet</p>
  <p>Driver: Not assigned yet</p>
</div>
```

**Status: "approved" (After vendor accepts)**
```jsx
<div className="booking-status approved">
  <h3>Booking Confirmed!</h3>
  <p>Cab Category: {booking.cab_category_name}</p>
  <p>Vendor: {booking.vendor_name}</p>
  <p>Vehicle: {booking.vehicle_model} ({booking.vehicle_registration})</p>
  <p>Driver: {booking.driver_name} - {booking.driver_phone}</p>
</div>
```

---

### **3. Vendor Dashboard - New Section**

**Add "Pending Requests" Tab:**
```jsx
<Tabs>
  <Tab label="Pending Requests" />    {/* ✅ NEW */}
  <Tab label="Ongoing Bookings" />
  <Tab label="Completed Rides" />
</Tabs>

{/* Pending Requests List */}
<div className="pending-requests">
  {pendingBookings.map(booking => (
    <div key={booking.id} className="booking-card">
      <h4>{booking.cab_category_name}</h4>
      <p>Customer: {booking.customer_name}</p>
      <p>Pickup: {booking.pickup_location}</p>
      <p>Dropoff: {booking.dropoff_location}</p>
      <p>Distance: {booking.distance} km</p>
      <p>Price: ₹{booking.price}</p>
      <p>Seats Required: {booking.min_seats}-{booking.max_seats}</p>
      
      {/* Vehicle and Driver Selection */}
      <select onChange={(e) => setSelectedVehicle(e.target.value)}>
        <option>Select Vehicle</option>
        {/* Filter vehicles matching seat requirements */}
        {availableVehicles
          .filter(v => v.no_of_seats >= booking.min_seats 
                    && v.no_of_seats <= booking.max_seats)
          .map(v => (
            <option key={v.id} value={v.id}>
              {v.model} - {v.no_of_seats} seats
            </option>
          ))
        }
      </select>
      
      <select onChange={(e) => setSelectedDriver(e.target.value)}>
        <option>Select Driver</option>
        {availableDrivers.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      
      <button onClick={() => acceptBooking(booking.id, selectedDriver, selectedVehicle)}>
        Accept Booking
      </button>
    </div>
  ))}
</div>
```

---

## ⚠️ Important Notes for Frontend

### **1. Handle NULL Values**
- Before vendor accepts: `vendor_id`, `driver_id`, `vehicle_id` will be NULL
- Don't try to display vehicle/driver info until status is "approved"
- Show "Waiting for vendor" message instead

### **2. Error Handling**
```javascript
// Handle 409 Conflict specially
if (response.status === 409) {
  // Booking was just accepted by another vendor
  showMessage('This booking was just accepted by another vendor. Please select another booking.');
  // Refresh pending list
  refreshPendingRequests();
}
```

### **3. Real-time Updates (Recommended)**
- Implement WebSocket/polling for pending requests
- When a booking is accepted by another vendor, remove it from the list immediately
- Notify user when their booking is accepted by a vendor

### **4. Price Calculation**
```javascript
// Calculate estimated price on frontend
const calculateEstimatedPrice = (category, distance) => {
  let basePrice = distance * category.price_per_km;
  
  // Add charges
  basePrice += (category.fuel_charges || 0);
  basePrice += (category.driver_charges || 0);
  
  // Apply discount
  if (category.base_discount) {
    const discount = (basePrice * category.base_discount) / 100;
    basePrice -= discount;
  }
  
  return Math.round(basePrice);
};
```

---

## 🧪 Testing Checklist for Frontend

- [ ] Cab categories load correctly on booking page
- [ ] Category details display properly
- [ ] Estimated price calculation is accurate
- [ ] Payment flow works with cab_category_id
- [ ] User sees "waiting" status after booking
- [ ] NULL values handled gracefully (no crashes)
- [ ] Vendor sees pending requests tab
- [ ] Vendor can filter vehicles by seat requirements
- [ ] Accept booking API call works
- [ ] Handle 409 error (race condition) properly
- [ ] Booking disappears from pending list after acceptance
- [ ] User notification when booking is accepted
- [ ] All existing booking features still work

---

## 📱 Mobile App Changes

Same API changes apply to mobile apps. Additional considerations:
- Show loading state while fetching categories
- Implement pull-to-refresh for pending requests
- Push notifications when booking is accepted/rejected
- Offline mode: cache cab categories

---

## 🆘 Need Help?

**Common Issues:**

1. **"vehicle_id is required" error**
   - You're still using old API. Change to `cab_category_id`

2. **Booking shows NULL vehicle/driver**
   - This is correct! Wait for vendor to accept
   - Don't try to display these fields in "waiting" status

3. **"Booking not found or already accepted"**
   - Another vendor just accepted it
   - Handle gracefully, refresh pending list

4. **Price mismatch**
   - Check if you're including fuel_charges, driver_charges, and base_discount
   - Backend calculates final price, frontend shows estimate

---

## 📚 Additional Resources

- Full implementation details: See `IMPLEMENTATION_SUMMARY.md`
- Database schema: See `backend/models/bookingModel.js`
- API testing: Use Postman collection (if available)

---

**Last Updated:** November 6, 2025
**Version:** 2.0.0
**Status:** ✅ Ready for Frontend Integration

