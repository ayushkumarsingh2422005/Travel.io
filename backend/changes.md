# Backend Implementation Changes & API Structure

## 1. Database Schema Refactoring

### A. Cab Categories (Pricing Rules) - `cab_categories`
Refactored from a simple list to a hierarchical pricing model supporting Outstation and Hourly rentals.

| Column | Type | Description |
| :--- | :--- | :--- |
| `service_type` | ENUM | `outstation` or `hourly_rental` |
| `sub_category` | ENUM | `one_way` or `round_trip` (Nullable) |
| `micro_category` | ENUM | `same_day` or `multi_day` (Nullable) |
| `segment` | VARCHAR | `Hatchback`, `Sedan`, `SUV`, `Premium SUV` |
| `base_price` | DECIMAL | Base package price (Hourly) |
| `price_per_km` | DECIMAL | Per KM rate (Outstation) |
| `min_seats` | INT | Minimum seat capacity |
| `max_seats` | INT | Maximum seat capacity |
| `package_hours` | INT | Hours included in rental (e.g., 8) |
| `package_km` | INT | KMs included in rental (e.g., 80) |
| `extra_hour_rate` | DECIMAL | Cost per extra hour |
| `extra_km_rate` | DECIMAL | Cost per extra KM |
| `driver_allowance`| DECIMAL | Night charge or daily allowance |

### B. Bookings - `bookings`
Updated to support OTP verification and Add-ons.

| Column | Type | Description |
| :--- | :--- | :--- |
| `booking_otp` | CHAR(6) | 6-digit OTP generated upon payment success |
| `is_otp_verified` | TINYINT | Flag for OTP verification status |
| `add_ons_details` | JSON | Snapshot of selected add-ons (e.g., `[{name: 'Pet', price: 200}]`) |

### C. Add-Ons (New) - `add_ons`
Table to manage extra services managed by Admin.

| Column | Type | Description |
| :--- | :--- | :--- |
| `name` | VARCHAR | Name (e.g., "Carrier", "Pet Allowance") |
| `price` | DECIMAL | Cost of the add-on |
| `price_type` | ENUM | `fixed` or `percentage` |

### D. Penalties (New) - `penalties`
Table to manage vendor offenses.

| Column | Type | Description |
| :--- | :--- | :--- |
| `offense_name` | VARCHAR | Name (e.g., "Late Pickup") |
| `amount` | DECIMAL | Penalty amount |

---

## 2. API Endpoint Updates

### A. Pricing & Categories (`/admin/cab-category` & Public)
*   **POST** `/admin/cab-category/add`
    *   **Payload**: `{ service_type, sub_category, segment, price_per_km, package_hours... }`
    *   **Description**: Creates a detailed pricing rule.
*   **GET** `/admin/cab-category/all`
    *   **Query Params**: `?service_type=outstation` (Optional)
    *   **Description**: Returns pricing rules capable of filtering by type.

### B. Add-Ons (`/admin/add-ons`)
*   **POST** `/add` - Create new add-on.
*   **GET** `/all` - List active add-ons.

### C. Penalties (`/admin/penalties`)
*   **POST** `/add` - Define new penalty rule.
*   **GET** `/all` - List penalty rules.

### D. Booking & Payment Flow
*   **POST** `/payment/create-order`
    *   **Updated Payload**: `{ ..., add_ons: [{id, name, price}] }`
    *   **Logic**: Calculates total including add-ons, creates Razorpay order.
*   **POST** `/payment/verify`
    *   **Logic**: Verifies signature, **Generates OTP**, Creates Booking with `add_ons_details` stored as JSON and `booking_otp`.

### E. Trip Execution (Driver App)
*   **PUT** `/vendor/driver/booking/:bookingId/status`
    *   **Payload**: `{ status: "ongoing", otp: "123456" }`
    *   **Logic**:
        *   If status is `ongoing`, **OTP is MANDATORY**.
        *   Verifies OTP against `bookings` table.
        *   If valid, updates status and sets `is_otp_verified = 1`.

---

## 3. Implementation Flow

### Customer Journey
1.  **Search**: User selects Service Type (Outstation/Hourly) -> Sub Category (OneWay/RoundTrip).
2.  **Selection**: Backend queries `cab_categories` matching criteria logic (e.g. `service_type='hourly' AND package_hours=8`).
3.  **Booking**: User selects Vehicle Segment & Add-ons (Pet, Carrier).
4.  **Payment**:
    *   `create-order`: Total calculated (Base + Add-ons + Taxes).
    *   `verify`: **Booking Created** with unique **OTP**.
5.  **Confirmation**: User sees Booking Details + OTP in "Upcoming Trips".

### Vendor/Driver Journey
1.  **Assignment**: Vendor assigns Driver to Booking.
2.  **Pickup**: Driver arrives at location.
3.  **Start Trip**:
    *   Driver asks Customer for OTP.
    *   Driver enters OTP in app.
    *   App calls `updateStatus('ongoing', otp)`.
    *   Backend validates. Success -> Trip Starts (Status: 'ongoing').

### Admin Journey
1.  **Pricing Pricing**: Admin sets flexible rates for different scenarios (`same_day` vs `multi_day`).
2.  **Add-ons**: Admin creates global add-ons applicable to bookings.
3.  **Penalties**: Admin defines penalty amounts for offenses.
