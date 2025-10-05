# Vehicle Search API Documentation

## Overview
This document provides comprehensive documentation for the vehicle search functionality implemented for users in Travel.io backend. The system allows users to search, filter, and view available vehicles with detailed information including per km charges.

## Base URL
```
http://localhost:5000
```

## Authentication
All vehicle search endpoints require user authentication via JWT token in the Authorization header:
```http
Authorization: Bearer <jwt_token>
```

---

## 🚗 Vehicle Search Endpoints

### 1. Search Available Vehicles
**GET** `/user/vehicles/search`

Search and filter available vehicles based on various criteria.

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `min_seats` | integer | Minimum number of seats | `4` |
| `max_seats` | integer | Maximum number of seats | `8` |
| `min_price_per_km` | decimal | Minimum price per km | `10.50` |
| `max_price_per_km` | decimal | Maximum price per km | `25.00` |
| `location` | string | Location filter (vendor address) | `"Mumbai"` |
| `vehicle_type` | string | Vehicle type/category | `"Sedan"` |
| `sort_by` | string | Sort field (`per_km_charge`, `no_of_seats`, `vendor_rating`, `model`) | `"per_km_charge"` |
| `sort_order` | string | Sort order (`ASC`, `DESC`) | `"ASC"` |
| `page` | integer | Page number (default: 1) | `1` |
| `limit` | integer | Results per page (default: 10) | `10` |

**Example Request:**
```http
GET /user/vehicles/search?min_seats=4&max_seats=8&min_price_per_km=10&max_price_per_km=30&location=Mumbai&sort_by=per_km_charge&sort_order=ASC&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": {
    "vehicles": [
      {
        "id": "vehicle_id_123",
        "model": "Toyota Innova",
        "registration_no": "MH01AB1234",
        "image": "https://example.com/vehicle.jpg",
        "no_of_seats": 7,
        "per_km_charge": 15.50,
        "is_active": 1,
        "rc_vehicle_manufacturer_name": "Toyota",
        "rc_vehicle_colour": "White",
        "rc_type": "LMV",
        "rc_body_type": "MUV",
        "rc_vehicle_category": "Commercial",
        "rc_vehicle_seat_capacity": "7",
        "rc_vehicle_sleeper_capacity": null,
        "rc_vehicle_standing_capacity": null,
        "rc_vehicle_cubic_capacity": "2393",
        "rc_vehicle_manufacturing_month_year": "2020-05",
        "rc_vehicle_insurance_upto": "2024-12-31",
        "rc_vehicle_tax_upto": "2024-03-31",
        "rc_expiry_date": "2030-05-15",
        "rc_blacklist_status": "No",
        "rc_challan_details": null,
        "rc_permit_valid_upto": "2025-12-31",
        "rc_national_permit_upto": null,
        "rc_is_commercial": 1,
        "vendor_name": "ABC Travels",
        "vendor_rating": 4.5,
        "vendor_location": "Mumbai, Maharashtra"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 25,
      "total_pages": 3
    },
    "filters_applied": {
      "min_seats": "4",
      "max_seats": "8",
      "min_price_per_km": "10",
      "max_price_per_km": "30",
      "location": "Mumbai",
      "vehicle_type": null,
      "sort_by": "per_km_charge",
      "sort_order": "ASC"
    }
  }
}
```

**Error Responses:**
- `401`: Authentication required
- `500`: Server error

---

### 2. Get Vehicle Details
**GET** `/user/vehicles/:vehicleId`

Get detailed information about a specific vehicle including vendor details and availability status.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `vehicleId` | string | Vehicle ID |

**Example Request:**
```http
GET /user/vehicles/vehicle_id_123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vehicle details retrieved successfully",
  "data": {
    "id": "vehicle_id_123",
    "vendor_id": "vendor_id_456",
    "model": "Toyota Innova",
    "registration_no": "MH01AB1234",
    "image": "https://example.com/vehicle.jpg",
    "no_of_seats": 7,
    "per_km_charge": 15.50,
    "is_active": 1,
    "rc_verification_id": "RC_VER_123",
    "rc_reference_id": "REF_456",
    "rc_status": "Success",
    "rc_reg_no": "MH01AB1234",
    "rc_class": "LMV",
    "rc_chassis": "CHASSIS123456",
    "rc_engine": "ENGINE789012",
    "rc_vehicle_manufacturer_name": "Toyota",
    "rc_model": "Innova",
    "rc_vehicle_colour": "White",
    "rc_type": "LMV",
    "rc_norms_type": "BS6",
    "rc_body_type": "MUV",
    "rc_owner_count": "1",
    "rc_owner": "ABC Travels",
    "rc_owner_father_name": "XYZ",
    "rc_mobile_number": "9876543210",
    "rc_rc_status": "Active",
    "rc_status_as_on": "2024-01-01",
    "rc_reg_authority": "Mumbai RTO",
    "rc_reg_date": "2020-05-15",
    "rc_vehicle_manufacturing_month_year": "2020-05",
    "rc_expiry_date": "2030-05-15",
    "rc_vehicle_tax_upto": "2024-03-31",
    "rc_vehicle_insurance_company_name": "HDFC ERGO",
    "rc_vehicle_insurance_upto": "2024-12-31",
    "rc_vehicle_insurance_policy_number": "POL123456",
    "rc_financer": null,
    "rc_present_address": "Mumbai, Maharashtra",
    "rc_permanent_address": "Mumbai, Maharashtra",
    "rc_vehicle_cubic_capacity": "2393",
    "rc_gross_vehicle_weight": "2500",
    "rc_unladen_weight": "1800",
    "rc_vehicle_category": "Commercial",
    "rc_standard_cap": "7",
    "rc_vehicle_cylinders_no": "4",
    "rc_vehicle_seat_capacity": "7",
    "rc_vehicle_sleeper_capacity": null,
    "rc_vehicle_standing_capacity": null,
    "rc_wheelbase": "2750",
    "rc_vehicle_number": "MH01AB1234",
    "rc_pucc_number": "PUCC123456",
    "rc_pucc_upto": "2024-12-31",
    "rc_blacklist_status": "No",
    "rc_blacklist_details": null,
    "rc_challan_details": null,
    "rc_permit_issue_date": "2020-05-15",
    "rc_permit_number": "PERMIT123",
    "rc_permit_type": "All India Tourist",
    "rc_permit_valid_from": "2020-05-15",
    "rc_permit_valid_upto": "2025-12-31",
    "rc_non_use_status": "No",
    "rc_non_use_from": null,
    "rc_non_use_to": null,
    "rc_national_permit_number": null,
    "rc_national_permit_upto": null,
    "rc_national_permit_issued_by": null,
    "rc_is_commercial": 1,
    "rc_noc_details": null,
    "rc_split_present_address": null,
    "rc_split_permanent_address": null,
    "vendor_name": "ABC Travels",
    "vendor_email": "contact@abctravels.com",
    "vendor_phone": "9876543210",
    "vendor_rating": 4.5,
    "vendor_location": "Mumbai, Maharashtra",
    "vendor_profile_pic": "https://example.com/vendor.jpg",
    "vendor_phone_verified": 1,
    "vendor_email_verified": 1,
    "is_available": true,
    "availability_status": "Available"
  }
}
```

**Error Responses:**
- `400`: Vehicle ID is required
- `401`: Authentication required
- `404`: Vehicle not found or not available
- `500`: Server error

---

### 3. Get Vehicle Types/Categories
**GET** `/user/vehicles/types`

Get available vehicle types and categories for filtering purposes.

**Example Request:**
```http
GET /user/vehicles/types
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vehicle types retrieved successfully",
  "data": [
    {
      "type": "LMV",
      "body_type": "Sedan",
      "category": "Private",
      "count": 15
    },
    {
      "type": "LMV",
      "body_type": "Hatchback",
      "category": "Private",
      "count": 8
    },
    {
      "type": "LMV",
      "body_type": "MUV",
      "category": "Commercial",
      "count": 12
    },
    {
      "type": "LMV",
      "body_type": "SUV",
      "category": "Private",
      "count": 6
    }
  ]
}
```

**Error Responses:**
- `401`: Authentication required
- `500`: Server error

---

## 🔍 Search Features

### Filtering Options

#### 1. **Seat Capacity Filter**
- `min_seats`: Minimum number of seats required
- `max_seats`: Maximum number of seats required
- Example: `?min_seats=4&max_seats=8` (4-8 seater vehicles)

#### 2. **Price Range Filter**
- `min_price_per_km`: Minimum price per kilometer
- `max_price_per_km`: Maximum price per kilometer
- Example: `?min_price_per_km=10&max_price_per_km=30` (₹10-30 per km)

#### 3. **Location Filter**
- `location`: Search by vendor location or vehicle address
- Example: `?location=Mumbai` (vehicles in Mumbai)

#### 4. **Vehicle Type Filter**
- `vehicle_type`: Filter by vehicle type, body type, or category
- Example: `?vehicle_type=Sedan` (Sedan vehicles)

### Sorting Options

#### Available Sort Fields:
- `per_km_charge`: Sort by price per kilometer
- `no_of_seats`: Sort by number of seats
- `vendor_rating`: Sort by vendor rating
- `model`: Sort by vehicle model

#### Sort Orders:
- `ASC`: Ascending order (default)
- `DESC`: Descending order

**Example:**
```http
GET /user/vehicles/search?sort_by=per_km_charge&sort_order=ASC
```

### Pagination

#### Parameters:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 50)

**Example:**
```http
GET /user/vehicles/search?page=2&limit=20
```

---

## 📊 Response Data Structure

### Vehicle Object Fields

#### Basic Information
- `id`: Unique vehicle identifier
- `model`: Vehicle model name
- `registration_no`: Vehicle registration number
- `image`: Vehicle image URL
- `no_of_seats`: Number of seats
- `per_km_charge`: Price per kilometer (₹)
- `is_active`: Vehicle availability status

#### RC (Registration Certificate) Details
- `rc_vehicle_manufacturer_name`: Manufacturer name
- `rc_vehicle_colour`: Vehicle color
- `rc_type`: Vehicle type (LMV, HMV, etc.)
- `rc_body_type`: Body type (Sedan, SUV, MUV, etc.)
- `rc_vehicle_category`: Category (Private, Commercial)
- `rc_vehicle_seat_capacity`: Seat capacity from RC
- `rc_vehicle_manufacturing_month_year`: Manufacturing date
- `rc_vehicle_insurance_upto`: Insurance expiry date
- `rc_vehicle_tax_upto`: Tax expiry date
- `rc_expiry_date`: RC expiry date
- `rc_blacklist_status`: Blacklist status
- `rc_permit_valid_upto`: Permit validity
- `rc_is_commercial`: Commercial vehicle flag

#### Vendor Information
- `vendor_name`: Vendor/company name
- `vendor_rating`: Vendor star rating
- `vendor_location`: Vendor location

### Pagination Object
- `current_page`: Current page number
- `per_page`: Results per page
- `total`: Total number of results
- `total_pages`: Total number of pages

### Filters Applied Object
Shows all filters that were applied in the search query.

---

## 🎯 Usage Examples

### 1. Basic Vehicle Search
```javascript
// Search for all available vehicles
const response = await fetch('/user/vehicles/search', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 2. Filtered Search
```javascript
// Search for 4-8 seater vehicles under ₹20/km in Mumbai
const response = await fetch('/user/vehicles/search?min_seats=4&max_seats=8&max_price_per_km=20&location=Mumbai', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. Sorted Search
```javascript
// Search vehicles sorted by price (lowest first)
const response = await fetch('/user/vehicles/search?sort_by=per_km_charge&sort_order=ASC', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 4. Paginated Search
```javascript
// Get second page with 20 results per page
const response = await fetch('/user/vehicles/search?page=2&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 5. Get Vehicle Details
```javascript
// Get detailed information about a specific vehicle
const response = await fetch('/user/vehicles/vehicle_id_123', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 6. Get Vehicle Types
```javascript
// Get available vehicle types for filter dropdown
const response = await fetch('/user/vehicles/types', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🔧 Database Schema Updates

### Vehicle Model Changes
Added `per_km_charge` field to the vehicles table:

```sql
ALTER TABLE vehicles 
ADD COLUMN per_km_charge DECIMAL(10,2) DEFAULT 0.00;
```

### Updated Vehicle Controller
- Added `per_km_charge` to all CRUD operations
- Updated `addVehicle`, `updateVehicle`, and `createVehicleWithRC` functions
- Added validation and default values

---

## 🚨 Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Vehicle ID is required"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Vehicle not found or not available"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to search vehicles",
  "error": "Error details"
}
```

---

## 📝 Notes

- **Authentication Required**: All endpoints require valid JWT token
- **Active Vehicles Only**: Search only returns vehicles with `is_active = 1`
- **Availability Check**: Vehicle details include real-time availability status
- **RC Data**: Full RC (Registration Certificate) details are included
- **Vendor Information**: Complete vendor details with ratings
- **Pagination**: Default 10 results per page, maximum 50
- **Sorting**: Default sort by `per_km_charge` in ascending order
- **Filtering**: All filters are optional and can be combined
- **JSON Parsing**: RC details with JSON fields are automatically parsed

---

*This documentation covers the complete vehicle search functionality for users in Travel.io backend API.*
