# Travel.io Booking System - Complete Implementation Guide

## Overview
This document outlines the comprehensive booking system with add-ons, dynamic pricing, and admin commission structure.

## Database Changes

### 1. Bookings Table Enhancements
**Migration File**: `migrate_bookings_add_trip_type.js`

#### New Fields Added:
- `trip_type` ENUM('one_way', 'round_trip')
- `micro_category` ENUM('same_day', 'multi_day')
- `service_category` ENUM('outstation', 'hourly_rental')
- `package_hours` INT (for hourly rentals)
- `package_km` INT (for hourly rentals)
- `base_fare` DECIMAL(10,2)
- `toll_charges` DECIMAL(10,2)
- `state_tax` DECIMAL(10,2)
- `parking_charges` DECIMAL(10,2)
- `driver_night_charges` DECIMAL(10,2)
- `addon_charges` DECIMAL(10,2)
- `admin_commission` DECIMAL(10,2) - **Always 10% of total**
- `driver_payout` DECIMAL(10,2) - **Remaining 90%**
- `actual_hours` DECIMAL(4,2) (for tracking usage)
- `actual_km` DECIMAL(10,2) (for tracking usage)
- `extra_charges` DECIMAL(10,2) (for overages)

### 2. Add-Ons Table
**Model File**: `models/addOnModel.js`

#### Schema:
```sql
CREATE TABLE add_ons (
    id CHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    pricing_type ENUM('fixed', 'percentage'),
    percentage_value DECIMAL(5,2),
    category ENUM('luggage', 'car_model', 'cancellation', 'pet', 'other'),
    icon_url VARCHAR(500),
    is_active TINYINT(1),
    display_order INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Default Add-Ons:
1. **Assured Luggage Space (Carrier)** - ₹300 (Fixed)
2. **Confirmed Car Model (Within 3 Years)** - 5% of booking amount (Percentage)
3. **Cancellation Before 6 Hours** - ₹250 (Fixed)
4. **Pet Allowance** - ₹500 (Fixed)

## Pricing Structure

### SERVICE CATEGORY 1: OUTSTATION

#### A. One-Way Trip

**1. Same-Day Trip**
- **Calculation**: Distance (km) × Rate per km + Extras
- **Extras**: Toll + State Tax + Parking (if applicable)
- **Example**: 150 km × ₹12/km = ₹1,800 + ₹200 (toll) = ₹2,000

**2. Multiple-Day Trip**
- **Calculation**: (Daily minimum km × Days) × Rate per km + Extras + Night charges
- **Daily Minimum**: 250 km/day (configurable in cab_categories table)
- **Night Charges**: ₹200 if driving post 9:00 PM
- **Example**: 2 days × 250 km × ₹12/km = ₹6,000 + ₹400 (2 nights) + extras

#### B. Round Trip

**1. Same-Day Round Trip**
- **Calculation**: Round-trip distance × Rate per km + Extras + Night charges
- **Night Charges**: ₹200 if return is post 9:00 PM
- **Example**: 200 km × ₹12/km = ₹2,400 + ₹200 (night) + extras

**2. Multiple-Day Round Trip**
- **Calculation**: MAX(Daily minimum km × Days, Actual total km) × Rate per km + Extras + Night charges
- **Example**: 
  - Daily min: 3 days × 250 km = 750 km
  - Actual: 600 km
  - Charged: 750 km × ₹12/km = ₹9,000 + night charges + extras

### SERVICE CATEGORY 2: HOURLY CAR RENTAL

#### Package Structure
| Package  | Hours | KM  | Base Price | Extra Time Rate    | Extra KM Rate |
|----------|-------|-----|------------|--------------------|---------------|
| Package1 | 2h    | 20  | ₹500       | ₹300 per 30 min    | ₹10/km        |
| Package2 | 4h    | 40  | ₹900       | ₹300 per 30 min    | ₹10/km        |
| Package3 | 6h    | 60  | ₹1,300     | ₹300 per 30 min    | ₹10/km        |
| Package4 | 8h    | 80  | ₹1,700     | ₹300 per 30 min    | ₹10/km        |
| Package5 | 12h   | 120 | ₹2,500     | ₹300 per 30 min    | ₹10/km        |

#### Calculation Examples:
**Example 1: Within Limits**
- Package: 4h/40km
- Actual Usage: 3.5h, 35km
- Charge: ₹900 (base price only)

**Example 2: Exceeded**
- Package: 4h/40km
- Actual Usage: 5.5h, 55km
- Charge: ₹900 (base) + ₹900 (3 × 30min extra) + ₹150 (15km extra) = ₹1,950

## Commission Structure

### Admin Commission (10% Always)
```javascript
const calculateCommission = (total) => {
    const adminCommission = total * 0.10;
    const driverPayout = total * 0.90;
    
    return { adminCommission, driverPayout };
};
```

### Booking Amount Breakdown Example:
```
Base Fare:              ₹2,000
Toll:                   ₹200
State Tax:              ₹100
Parking:                ₹50
Driver Night Charges:   ₹200
Add-on Charges:         ₹500
---------------------------------
TOTAL:                  ₹3,050

Admin Commission (10%): ₹305
Driver Payout (90%):    ₹2,745
```

## API Endpoints

### Add-Ons Management

#### Public Endpoints (User Access)
```
GET /user/add-ons
```
Returns all active add-ons for users to select during booking.

#### Admin Endpoints
```
POST   /admin/add-ons/add       - Create new add-on
GET    /admin/add-ons/all       - Get all add-ons (including inactive)
PUT    /admin/add-ons/:id       - Update add-on
DELETE /admin/add-ons/:id       - Delete add-on
```

### Booking Flow

#### 1. User Selects Trip Details
```json
{
  "service_category": "outstation",
  "trip_type": "one_way",
  "micro_category": "same_day",
  "cab_category_id": "abc123",
  "pickup_location": "Mumbai",
  "dropoff_location": "Pune",
  "pickup_date": "2022-12-31T05:30:00",
  "distance": 150
}
```

#### 2. System Calculates Base Fare
```javascript
// For same-day one-way
const baseFare = distance * cabCategory.price_per_km;

// For multi-day one-way
const baseFare = (days * cabCategory.min_km_per_day) * cabCategory.price_per_km;

// For hourly rental
const baseFare = cabCategory.base_price;
```

#### 3. User Adds Extras
```json
{
  "toll_charges": 200,
  "state_tax": 100,
  "parking_charges": 50,
  "driver_night_charges": 200,
  "selected_addons": [
    {
      "id": "addon_luggage_id",
      "name": "Assured Luggage Space",
      "price": 300
    },
    {
      "id": "addon_car_model_id",
      "name": "Confirmed Car Model",
      "pricing_type": "percentage",
      "percentage_value": 5
    }
  ]
}
```

#### 4. System Calculates Final Amount
```javascript
// Calculate add-on charges
let addonCharges = 0;
for (const addon of selected_addons) {
    if (addon.pricing_type === 'fixed') {
        addonCharges += addon.price;
    } else if (addon.pricing_type === 'percentage') {
        addonCharges += (baseFare * addon.percentage_value / 100);
    }
}

// Total calculation
const total = baseFare + toll_charges + state_tax + parking_charges + 
              driver_night_charges + addonCharges;

const adminCommission = total * 0.10;
const driverPayout = total * 0.90;
```

#### 5. Booking Creation
```json
{
  "id": "booking_id_123",
  "base_fare": 2000,
  "toll_charges": 200,
  "state_tax": 100,
  "parking_charges": 50,
  "driver_night_charges": 200,
  "addon_charges": 500,
  "price": 3050,
  "admin_commission": 305,
  "driver_payout": 2745,
  "add_ons_details": [...]
}
```

## Booking Visibility Rules

### Upcoming Bookings
- **Driver/Car Details**: Visible **5 hours before departure**
- **Before 5 hours**: Show only booking ID, pickup/drop locations, datetime, status
- **After 5 hours**: Show complete details including driver name, phone, car model, plate number

### Implementation Example:
```javascript
const getBookingDetails = (booking) => {
    const now = new Date();
    const pickupTime = new Date(booking.pickup_date);
    const hoursDiff = (pickupTime - now) / (1000 * 60 * 60);
    
    if (hoursDiff <= 5) {
        // Show complete details
        return {
            ...booking,
            driver: booking.driver_details,
            vehicle: booking.vehicle_details
        };
    } else {
        // Hide sensitive details
        return {
            id: booking.id,
            pickup_location: booking.pickup_location,
            dropoff_location: booking.dropoff_location,
            pickup_date: booking.pickup_date,
            status: booking.status,
            driver: null,
            vehicle: null
        };
    }
};
```

### Completed Bookings
- **Full Access**: All details visible
- **Actions Available**:
  - Write Review
  - Raise Ticket/Complaint

## Frontend Integration Guide

### 1. Fetch Available Add-Ons
```typescript
const fetchAddOns = async () => {
    const response = await axios.get('/user/add-ons');
    return response.data.data;
};
```

### 2. Calculate Price in Real-Time
```typescript
const calculateBookingPrice = (
    baseFare: number,
    extras: { toll: number; tax: number; parking: number; night: number },
    selectedAddOns: AddOn[]
) => {
    let addonTotal = 0;
    
    for (const addon of selectedAddOns) {
        if (addon.pricing_type === 'fixed') {
            addonTotal += addon.price;
        } else {
            addonTotal += (baseFare * addon.percentage_value / 100);
        }
    }
    
    const total = baseFare + extras.toll + extras.tax + extras.parking + 
                  extras.night + addonTotal;
    
    return {
        baseFare,
        addonTotal,
        total,
        adminCommission: total * 0.10,
        driverPayout: total * 0.90
    };
};
```

### 3. Display Booking Summary
```tsx
<div className="booking-summary">
    <h3>Booking Summary</h3>
    <div>Base Fare: ₹{baseFare}</div>
    <div>Toll: ₹{toll}</div>
    <div>State Tax: ₹{stateTax}</div>
    <div>Parking: ₹{parking}</div>
    <div>Driver Night Charges: ₹{nightCharges}</div>
    <div>Add-on Charges: ₹{addonCharges}</div>
    <hr />
    <div><strong>Total: ₹{total}</strong></div>
    <small>Note: ₹{total * 0.10} goes to admin, ₹{total * 0.90} to driver</small>
</div>
```

## Next Steps

### 1. Run Migrations
The migrations will run automatically when you start the server with `nodemon index.js`.

### 2. Test Add-Ons
- Access admin panel
- Navigate to Add-Ons section
- Verify default add-ons are created
- Add/Edit/Delete add-ons as needed

### 3. Update Frontend
- Add add-ons selection UI in booking flow
- Implement real-time price calculation
- Show pricing breakdown before payment

### 4. Update Cab Categories
- Add pricing for different trip types
- Configure min_km_per_day for multi-day trips
- Set up hourly rental packages with their rates

## Important Notes

1. **Admin Commission**: Always 10%, no exceptions
2. **Driver Payout**: Always 90% of total booking amount
3. **Payment to Driver**: Directly handed over during ride (cash or digital)
4. **Add-On Prices**: Admin-configurable via admin panel
5. **Night Charges**: Applied automatically if trip includes travel post 9:00 PM
6. **Booking Visibility**: Driver/car details shown 5 hours before departure
7. **Cancellation Policy**: If customer selected cancellation add-on, 100% refund before 6 hours

## Support

For any issues or clarifications, refer to:
- `models/addOnModel.js` - Add-ons table structure
- `controller/addOnController.js` - Add-ons CRUD operations
- `migrate_bookings_add_trip_type.js` - Booking table migrations
- `models/cabCategoryModel.js` - Pricing structure
