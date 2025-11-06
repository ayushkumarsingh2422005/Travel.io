# 🚀 Deployment Checklist - Booking System Refactoring

## ✅ Pre-Deployment Checklist

### **Backend Tasks**

#### 1. Database Migration
- [ ] **Check if bookings table has `cab_category_id` column**
  ```sql
  DESCRIBE bookings;
  -- Should show cab_category_id CHAR(64) NOT NULL
  ```

- [ ] **If not, run this migration:**
  ```sql
  -- Add cab_category_id column
  ALTER TABLE bookings 
  ADD COLUMN cab_category_id CHAR(64) NOT NULL AFTER partner_id;
  
  -- Add foreign key
  ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_cab_category
  FOREIGN KEY (cab_category_id) REFERENCES cab_categories(id) 
  ON DELETE RESTRICT;
  
  -- Make vendor_id, driver_id, vehicle_id nullable
  ALTER TABLE bookings 
  MODIFY COLUMN vendor_id CHAR(64) DEFAULT NULL,
  MODIFY COLUMN driver_id CHAR(64) DEFAULT NULL,
  MODIFY COLUMN vehicle_id CHAR(64) DEFAULT NULL;
  ```

- [ ] **Verify cab_categories table exists and has data**
  ```sql
  SELECT * FROM cab_categories WHERE is_active = 1;
  -- Should return at least one active category
  ```

#### 2. Code Deployment
- [ ] Pull latest code from repository
- [ ] Install dependencies (if any new packages)
  ```bash
  cd backend
  npm install
  ```

- [ ] Check environment variables
  ```bash
  # Verify these are set in .env
  RAZORPAY_KEY_ID=xxx
  RAZORPAY_KEY_SECRET=xxx
  RAZORPAY_WEBHOOK_SECRET=xxx
  JWT_SECRET=xxx
  ```

- [ ] Restart backend server
  ```bash
  npm restart
  # OR
  pm2 restart all
  ```

#### 3. API Testing
- [ ] Test cab categories endpoint (public)
  ```bash
  curl -X GET http://localhost:3000/api/user/cab-categories
  ```

- [ ] Test payment order creation with cab_category_id
  ```bash
  curl -X POST http://localhost:3000/api/payment/create-order \
    -H "Authorization: Bearer USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "cab_category_id": "CAT_ID",
      "pickup_location": "Test A",
      "dropoff_location": "Test B",
      "pickup_date": "2025-11-10 10:00:00",
      "drop_date": "2025-11-10 18:00:00",
      "path": "test",
      "distance": 50
    }'
  ```

- [ ] Test vendor pending requests
  ```bash
  curl -X GET http://localhost:3000/api/vendor/pending-requests \
    -H "Authorization: Bearer VENDOR_TOKEN"
  ```

- [ ] Test vendor accept booking
  ```bash
  curl -X POST http://localhost:3000/api/vendor/accept-booking \
    -H "Authorization: Bearer VENDOR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "booking_id": "BOOKING_ID",
      "driver_id": "DRIVER_ID",
      "vehicle_id": "VEHICLE_ID"
    }'
  ```

---

### **Frontend Tasks**

#### 4. UI Updates Required
- [ ] **Booking Page:**
  - [ ] Remove vehicle selection UI
  - [ ] Add cab category selection UI
  - [ ] Update price calculation to use category pricing
  - [ ] Change API call from vehicle_id to cab_category_id

- [ ] **User Bookings Page:**
  - [ ] Handle NULL vendor/driver/vehicle for "waiting" status
  - [ ] Show cab category name instead of vehicle model
  - [ ] Display "Waiting for vendor" message for unassigned bookings
  - [ ] Update booking details modal to show category info

- [ ] **Vendor Dashboard:**
  - [ ] Add "Pending Requests" tab/page
  - [ ] Implement pending requests list view
  - [ ] Add vehicle & driver selection dropdowns
  - [ ] Filter vehicles by seat requirements
  - [ ] Implement accept booking functionality
  - [ ] Add error handling for 409 conflict

#### 5. Frontend API Integration
- [ ] Update API endpoints in config
  ```javascript
  // OLD
  const CREATE_ORDER_URL = '/api/payment/create-order';
  
  // NEW - Same URL, but change request body
  // vehicle_id → cab_category_id
  ```

- [ ] Update booking creation request
  ```javascript
  // OLD
  const payload = {
    vehicle_id: selectedVehicle.id,
    // ...
  };
  
  // NEW
  const payload = {
    cab_category_id: selectedCategory.id,
    // ...
  };
  ```

- [ ] Add new API endpoints
  ```javascript
  export const API_ENDPOINTS = {
    // New endpoints
    CAB_CATEGORIES: '/api/user/cab-categories',
    CAB_CATEGORY_DETAILS: '/api/user/cab-categories/:id',
    VENDOR_PENDING_REQUESTS: '/api/vendor/pending-requests',
    VENDOR_ACCEPT_BOOKING: '/api/vendor/accept-booking',
    // ... existing endpoints
  };
  ```

#### 6. Frontend Testing
- [ ] Test cab category listing
- [ ] Test cab category selection
- [ ] Test payment flow with cab_category_id
- [ ] Test booking creation (should show "waiting" status)
- [ ] Test booking details display (handle NULL values)
- [ ] Test vendor pending requests page
- [ ] Test vendor accept booking functionality
- [ ] Test race condition handling (409 error)
- [ ] Test real-time updates (if implemented)

---

### **Mobile App Tasks (If Applicable)**

#### 7. Mobile App Updates
- [ ] Update booking screen to show cab categories
- [ ] Update API calls (vehicle_id → cab_category_id)
- [ ] Handle NULL values in booking details
- [ ] Add vendor pending requests screen
- [ ] Implement accept booking functionality
- [ ] Add push notifications for booking acceptance
- [ ] Test on iOS
- [ ] Test on Android

---

### **Documentation Tasks**

#### 8. Documentation Updates
- [ ] Update API documentation (Swagger/Postman)
- [ ] Update user guide for new booking flow
- [ ] Update vendor guide for accepting bookings
- [ ] Create training materials for vendors
- [ ] Update FAQ section

---

### **Communication Tasks**

#### 9. Stakeholder Communication
- [ ] Notify frontend team about API changes
- [ ] Notify mobile team about API changes
- [ ] Notify QA team about new features to test
- [ ] Notify vendors about new pending requests feature
- [ ] Notify users about improved booking system (optional)

---

## 🧪 Testing Scenarios

### **Scenario 1: Happy Path - User Books and Vendor Accepts**
1. [ ] User selects cab category "Sedan"
2. [ ] System calculates price: 50km × ₹12/km = ₹600
3. [ ] User makes payment
4. [ ] Booking created with status "waiting", vendor_id=NULL
5. [ ] Vendor A logs in, sees pending request
6. [ ] Vendor A selects driver and vehicle (4 seats)
7. [ ] Vendor A clicks "Accept"
8. [ ] System validates vehicle (4 seats meets Sedan requirement)
9. [ ] System checks vehicle availability (no conflicts)
10. [ ] Booking updated: vendor_id=A, status="approved"
11. [ ] User sees booking confirmed with vehicle/driver details
12. [ ] Booking disappears from pending requests for all vendors

### **Scenario 2: Race Condition - Two Vendors Accept Same Booking**
1. [ ] Booking ID=123 appears in pending requests
2. [ ] Vendor A starts accepting (selects driver/vehicle)
3. [ ] Vendor B also starts accepting (selects driver/vehicle)
4. [ ] Vendor A clicks "Accept" first → Success (200)
5. [ ] Vendor B clicks "Accept" after → Error (409)
6. [ ] Vendor B sees message: "Booking was already accepted"
7. [ ] Vendor B's pending list refreshes, booking 123 removed

### **Scenario 3: Validation Failure - Wrong Vehicle**
1. [ ] Booking requires 6-8 seats (SUV category)
2. [ ] Vendor tries to assign 4-seat vehicle
3. [ ] System rejects with error: "Vehicle does not meet minimum seat requirement"
4. [ ] Vendor selects correct 7-seat vehicle
5. [ ] Booking accepted successfully

### **Scenario 4: Vehicle Already Booked**
1. [ ] Vehicle V1 is assigned to booking B1 (date: Nov 10)
2. [ ] New booking B2 created (date: Nov 10)
3. [ ] Vendor tries to assign same vehicle V1 to B2
4. [ ] System rejects: "Vehicle is already booked for the requested time period"
5. [ ] Vendor selects different vehicle V2
6. [ ] Booking accepted successfully

### **Scenario 5: Driver Already Assigned**
1. [ ] Driver D1 is assigned to booking B1 (date: Nov 10)
2. [ ] New booking B2 created (date: Nov 10)
3. [ ] Vendor tries to assign same driver D1 to B2
4. [ ] System rejects: "Driver is already assigned"
5. [ ] Vendor selects different driver D2
6. [ ] Booking accepted successfully

---

## 📊 Monitoring & Rollback

### **10. Monitoring (Post-Deployment)**
- [ ] Monitor error logs for first 24 hours
  ```bash
  tail -f /var/log/app/error.log | grep "payment\|booking\|vendor"
  ```

- [ ] Check database for bookings with NULL vendor_id
  ```sql
  SELECT COUNT(*) FROM bookings 
  WHERE vendor_id IS NULL AND status = 'waiting'
  AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY);
  ```

- [ ] Monitor payment success rate
- [ ] Monitor booking acceptance rate
- [ ] Check for 409 conflicts (race conditions)
  ```bash
  grep "409" /var/log/app/access.log | wc -l
  ```

### **11. Rollback Plan (If Issues Found)**

#### **Option A: Quick Rollback (Revert Code)**
```bash
# Revert to previous version
git checkout <previous-commit-hash>
npm restart
```

#### **Option B: Hotfix (Keep New Schema)**
```sql
-- If you need to manually assign vendor to stuck bookings
UPDATE bookings 
SET vendor_id = 'VENDOR_ID', 
    driver_id = 'DRIVER_ID', 
    vehicle_id = 'VEHICLE_ID',
    status = 'approved'
WHERE id = 'STUCK_BOOKING_ID';
```

---

## 📈 Success Metrics

### **Week 1 Targets:**
- [ ] 100% of bookings have cab_category_id populated
- [ ] 0 bookings stuck in "waiting" for > 24 hours
- [ ] < 5% of 409 conflicts (race conditions)
- [ ] Average vendor acceptance time < 15 minutes
- [ ] 0 payment failures due to API change

### **Week 2 Targets:**
- [ ] 90%+ bookings accepted within 10 minutes
- [ ] User satisfaction score maintained or improved
- [ ] Vendor satisfaction with new pending requests feature
- [ ] No NULL pointer errors in production logs

---

## 🆘 Troubleshooting Guide

### **Issue: "cab_category_id cannot be null" error**
**Solution:**
```sql
-- Check if column exists
SHOW COLUMNS FROM bookings LIKE 'cab_category_id';

-- If not exists, run migration
ALTER TABLE bookings 
ADD COLUMN cab_category_id CHAR(64) NOT NULL AFTER partner_id;
```

### **Issue: "No cab categories found"**
**Solution:**
```sql
-- Check if categories exist
SELECT * FROM cab_categories WHERE is_active = 1;

-- If empty, add sample categories
INSERT INTO cab_categories (id, category, price_per_km, is_active) 
VALUES 
  (UUID(), 'Sedan', 12.00, 1),
  (UUID(), 'SUV', 18.00, 1);
```

### **Issue: "vehicle_id is required" error from frontend**
**Solution:** Frontend is still using old API format. Update request body to use `cab_category_id` instead of `vehicle_id`.

### **Issue: Bookings stuck in "waiting" status**
**Check:**
```sql
-- Find stuck bookings (waiting for > 1 hour)
SELECT * FROM bookings 
WHERE vendor_id IS NULL 
  AND status = 'waiting'
  AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

**Solution:** Manually assign or contact vendors.

### **Issue: Multiple vendors accepted same booking**
**This shouldn't happen due to race condition handling, but if it does:**
```sql
-- Check for duplicates
SELECT booking_id, COUNT(*) 
FROM bookings 
WHERE status = 'approved'
GROUP BY booking_id
HAVING COUNT(*) > 1;
```

---

## ✅ Final Sign-Off

### **Before Going Live:**
- [ ] All backend tests passed
- [ ] All frontend tests passed
- [ ] Database migration successful
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Documentation updated
- [ ] Team trained
- [ ] Monitoring set up
- [ ] Rollback plan ready

### **Sign-Off:**
- [ ] Backend Lead: _______________
- [ ] Frontend Lead: _______________
- [ ] QA Lead: _______________
- [ ] DevOps Lead: _______________
- [ ] Product Manager: _______________

---

## 📅 Deployment Timeline

**Recommended Schedule:**

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| Week 1 | Backend deployment | 1 day | ⏳ Pending |
| Week 1 | Backend testing | 2 days | ⏳ Pending |
| Week 2 | Frontend development | 3 days | ⏳ Pending |
| Week 2 | Frontend testing | 2 days | ⏳ Pending |
| Week 3 | Integration testing | 3 days | ⏳ Pending |
| Week 3 | Staging deployment | 1 day | ⏳ Pending |
| Week 4 | User acceptance testing | 5 days | ⏳ Pending |
| Week 4 | Production deployment | 1 day | ⏳ Pending |
| Week 5 | Monitoring & optimization | Ongoing | ⏳ Pending |

---

## 🎯 Go-Live Decision

**Criteria for Production Deployment:**
- ✅ All checklist items completed
- ✅ No critical bugs in staging
- ✅ All stakeholders approved
- ✅ Load testing passed (if applicable)
- ✅ Rollback plan tested
- ✅ Team available for 24h support post-deployment

---

**Deployment Date:** __________________
**Deployed By:** __________________
**Version:** 2.0.0

---

✨ **Good luck with the deployment!** ✨

