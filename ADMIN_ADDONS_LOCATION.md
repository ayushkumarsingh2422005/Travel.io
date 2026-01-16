# 🎯 WHERE TO FIND ADD-ONS IN ADMIN PANEL

## ✅ **Add-Ons Section is NOW in the Admin Panel!**

### How to Access:

1. **Start Admin Panel**:
   ```bash
   cd d:\Travel.io\Admin.travel.io
   npm run dev
   ```

2. **Login** at `http://localhost:5175/login`

3. **Look for "Add-Ons" in the Left Sidebar**:
   - It's located between **"Ratings"** and **"Penalty Disputes"**
   - Has a "+" icon
   - Click on it to manage add-ons

4. **Or Navigate Directly**:
   Go to: `http://localhost:5175/add-ons`

---

## 📍 **Location in Admin Panel:**

```
Admin Sidebar Navigation:
├─ Dashboard
├─ Users
├─ Bookings
├─ Vendors
├─ Drivers
├─ Vehicles
├─ Categories
├─ Payments
├─ Promo Codes
├─ Ratings
├─ Add-Ons         ← **HERE!** (Just added)
├─ Penalty Disputes
└─ Logout
```

---

## 🎨 **What You Can Do in Add-Ons Panel:**

### View All Add-Ons
- See all active and inactive add-ons
- View pricing (Fixed or Percentage)
- See categories (Luggage, Car Model, Cancellation, Pet, Other)

### Create New Add-On
Click "+ Add New Add-On" button:
- **Name**: e.g., "Child Seat"
- **Description**: e.g., "Additional child safety seat"
- **Category**: Luggage, Car Model, Cancellation, Pet, Other
- **Pricing Type**: 
  - Fixed: Set exact price (e.g., ₹300)
  - Percentage: Set % of base fare (e.g., 5%)
- **Display Order**: Order in which it appears
- **Active**: Toggle visibility to customers

### Edit Existing Add-On
Click "Edit" button on any add-on:
- Modify name, description, price
- Change active status
- Update display order

### Delete Add-On
Click "Delete" button (with confirmation)

---

## 📊 **Default Add-Ons Already Created:**

You should see 4 add-ons by default:

1. **Assured Luggage Space (Carrier)**
   - Type: Fixed
   - Price: ₹300
   - Category: Luggage

2. **Confirmed Car Model (Within 3 Years)**
   -Type: Percentage
   - Value: 5% of base fare
   - Category: Car Model

3. **Cancellation Before 6 Hours**
   - Type: Fixed
   - Price: ₹250
   - Category: Cancellation

4. **Pet Allowance**
   - Type: Fixed
   - Price: ₹500
   - Category: Pet

---

## 🔧 **Troubleshooting:**

### Can't See "Add-Ons" in Sidebar?
1. Refresh the page (Ctrl + R)
2. Clear browser cache
3. Restart the dev server

### Add-Ons Page is Blank?
1. Check backend is running (`nodemon index.js`)
2. Check console for errors (F12)
3. Verify token is valid (try logout/login)

### API Errors?
Ensure backend server is running:
```bash
cd d:\Travel.io\backend
nodemon index.js
```

Check for:
- `✅ Add-Ons Table Created`
- `✅ Default add-ons inserted`

---

## 📸 **What the Add-Ons Panel Looks Like:**

```
┌─────────────────────────────────────────────┐
│  Add-Ons Management    [+ Add New Add-On]  │
├─────────────────────────────────────────────┤
│                                              │
│  TABLE:                                      │
│  ┌────────────┬─────────┬──────┬─────────┐ │
│  │ Name       │ Category│ Type │ Price   │ │
│  ├────────────┼─────────┼──────┼─────────┤ │
│  │ Luggage    │ luggage │ Fixed│ ₹300    │ │
│  │ Carrier    │         │      │  [Edit] │ │
│  ├────────────┼─────────┼──────┼─────────┤ │
│  │ Car Model  │ car_model│ %   │ 5%      │ │
│  │ <3 years   │         │      │  [Edit] │ │
│  └────────────┴─────────┴──────┴─────────┘ │
│                                              │
└─────────────────────────────────────────────┘
```

---

## ✅ **Files Updated:**

- ✅ `Admin.travel.io/src/App.tsx` - Added sidebar link
- ✅ `Admin.travel.io/src/screens/AddOns.tsx` - Component exists
- ✅ Route `/add-ons` already configured

**You can now access Add-Ons management in the admin panel!**

---

**Last Updated**: January 12, 2026 - 14:35 IST
