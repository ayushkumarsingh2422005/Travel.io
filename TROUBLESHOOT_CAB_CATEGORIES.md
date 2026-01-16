# 🔧 TROUBLESHOOTING: "Error fetching cab categories"

## ❌ **Error Message:**
```
An error occurred while fetching cab categories.
```

## 🔍 **Possible Causes:**

### 1. **Backend Server Not Running**
Check if backend is running on port 5000

### 2. **Cab Categories Table Empty**
The table exists but has no data

### 3. **Database Connection Issue**
MySQL server might not be running

---

## ✅ **Quick Fixes:**

### Fix 1: Restart Backend Server

```bash
cd d:\Travel.io\backend
# Stop nodemon (if running)
# Then start fresh:
nodemon index.js
```

**Look for these messages:**
```
✅ Cab Categories Table Created
✅ Add-Ons Table Created
✅ Server listening on port 5000
```

---

### Fix 2: Check if Cab Categories Exist

The cab_categories table might be empty. You need to add categories through the admin panel or database.

**Option A: Via Admin Panel**
1. Login to admin: `http://localhost:5175`
2. Go to "Categories" in sidebar
3. Add cab categories (Hatchback, Sedan, SUV, etc.)

**Option B: Via Database**
Run this SQL to add a test category:

```sql
INSERT INTO cab_categories (
    id, 
    service_type, 
    sub_category, 
    micro_category, 
    segment, 
    price_per_km,
    is_active
) VALUES (
    SHA2(CONCAT('hatchback_oneway_', NOW()), 256),
    'outstation',
    'one_way',
    'same_day',
    'Hatchback',
    12.00,
    1
);
```

---

### Fix 3: Check Backend Logs

Look at the backend console for specific error details:

**Common Errors:**
```
❌ Error: connect ECONNREFUSED 127.0.0.1:3306
   → MySQL is not running

❌ ER_NO_SUCH_TABLE: Table 'cab_categories' doesn't exist
   → Table not created properly

❌ ER_BAD_FIELD_ERROR: Unknown column 'service_type'
   → Database migration needed
```

---

### Fix 4: Verify API Endpoint

Test the API directly:

```bash
# In browser or Postman
GET http://localhost:5000/user/cab-categories
```

**Expected Response:**
```json
{
  "success": true,
  "count": 4,
  "cab_categories": [
    {
      "id": "...",
      "service_type": "outstation",
      "segment": "Hatchback",
      "price_per_km": 12.00
    }
  ]
}
```

**If Empty Array:**
```json
{
  "success": true,
  "count": 0,
  "cab_categories": []
}
```
This means table exists but has no data - add categories via admin panel!

---

### Fix 5: Check Frontend API Call

The frontend might be calling the wrong endpoint or localhost might be incorrect.

**Check**: `Travel.io/src/api/.../` or component making the call

**Should be:**
```javascript
axios.get('http://localhost:5000/user/cab-categories')
```

---

## 🎯 **Most Likely Cause:**

Based on fresh setup, the **cab_categories table is empty**.

**Solution:**
1. Go to Admin Panel (`http://localhost:5175`)
2. Login as admin
3. Navigate to "Categories"
4. Add at least one cab category:
   - Service Type: Outstation
   - Segment: Hatchback
   - Price per KM: ₹12
   - Active: Yes

Once you add categories, refresh the user app and the error should be gone!

---

## 📝 **Backend Startup Checklist:**

When you start `nodemon index.js`, you should see:

- ✅ Users Table Created
- ✅ Vendors Table Created
- ✅ Drivers Table Created
- ✅ Vehicles Table Created
- ✅ Bookings Table Created
- ✅ Previous Bookings Table Created
- ✅ Payments Table Created
- ✅ Partner Tables Created
- ✅ **Cab Categories Table Created** ← Important!
- ✅ Vendor Wallet Table Created
- ✅ Penalty Rules Table Created
- ✅ Penalty Disputes Table Created
- ✅ **Add-Ons Table Created** ← Should also see this
- ✅ **Default add-ons inserted** ← And this
- ✅ Migration completed for bookings/prevbookings
- ✅ **Server listening on port 5000** ← Final message

If you don't see these, the server didn't start properly!

---

## 🚨 **Emergency Fix:**

If nothing works, try this:

1. **Stop backend completely** (Ctrl+C in terminal)
2. **Check MySQL is running**:
   ```bash
   # Windows: Check Services
   # Or restart MySQL service
   ```
3. **Clear any cached processes**
4. **Restart backend**:
   ```bash
   cd d:\Travel.io\backend
   node index.js
   ```
5. **Wait for all "✅" messages**
6. **Test API**: `http://localhost:5000/user/cab-categories`
7. **If returns empty array**, add categories through admin panel

---

## ✅ **After Fix:**

You should be able to:
- ✅ View landing page without errors
- ✅ Select pickup/destination
- ✅ See available cab categories
- ✅ View prices for different cabs
- ✅ Select add-ons on booking page

---

**Status**: Waiting for verification

**Next Step**: Check backend console output and add cab categories if table is empty

**Last Updated**: January 12, 2026 - 14:50 IST
