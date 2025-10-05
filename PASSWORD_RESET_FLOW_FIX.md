# Password Reset Flow Fix Documentation

## 🐛 Issue Identified
The password reset functionality was failing with "Invalid or expired reset token" error because the reset token fields (`reset_password_token` and `reset_password_expiry`) were not present in the existing users table.

## 🔧 Root Cause
The `userModel.js` was updated to include reset token fields, but existing database tables created before this update don't have these columns. The `CREATE TABLE IF NOT EXISTS` statement only creates the table if it doesn't exist, but doesn't add new columns to existing tables.

## ✅ Solution Implemented

### 1. **Database Migration Script**
Created `backend/migrate_users_add_reset_fields.js` to add missing columns to existing users table:

```javascript
const addResetFieldsToUsers = async () => {
    // Check if fields exist and add them if missing
    if (!existingColumns.includes('reset_password_token')) {
        await db.execute(`
            ALTER TABLE users 
            ADD COLUMN reset_password_token VARCHAR(100) NULL
        `);
    }
    
    if (!existingColumns.includes('reset_password_expiry')) {
        await db.execute(`
            ALTER TABLE users 
            ADD COLUMN reset_password_expiry DATETIME NULL
        `);
    }
};
```

### 2. **Updated Server Initialization**
Modified `backend/index.js` to run the migration:

```javascript
const createTables = async () => {
    await createUsersTable();
    await addResetFieldsToUsers(); // Add reset password fields to existing users table
    // ... other table creations
};
```

### 3. **Enhanced Debugging**
Added comprehensive logging to both `forgotPassword` and `resetPassword` functions:

#### Forgot Password Debugging:
```javascript
// Verify the token was saved
const [verifyResult] = await db.execute(
    'SELECT reset_password_token, reset_password_expiry FROM users WHERE id = ?',
    [user.id]
);
console.log(`Token verification:`, verifyResult[0]);
```

#### Reset Password Debugging:
```javascript
// Also check if token exists without expiry check for debugging
const [allUsersWithToken] = await db.execute(
    'SELECT id, reset_password_token, reset_password_expiry FROM users WHERE reset_password_token = ?',
    [token]
);
console.log("All users with this token (including expired):", allUsersWithToken);
```

### 4. **Test Script**
Created `backend/test_password_reset.js` to verify the complete flow:

```javascript
const testPasswordResetFlow = async () => {
    // 1. Check table structure
    // 2. Find test user
    // 3. Generate and save token
    // 4. Verify token was saved
    // 5. Test token lookup
    // 6. Clean up
};
```

## 🔄 Complete Password Reset Flow

### Step 1: Request Password Reset
```http
POST /user/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**What happens:**
1. ✅ Find user by email
2. ✅ Generate random 32-byte hex token
3. ✅ Set expiry to 1 hour from now
4. ✅ Save token and expiry to database
5. ✅ Send email with reset link
6. ✅ Return success response

### Step 2: Reset Password
```http
POST /user/auth/reset-password
Content-Type: application/json

{
  "token": "generated_token_here",
  "password": "newPassword123"
}
```

**What happens:**
1. ✅ Validate token and password are provided
2. ✅ Find user with matching token and valid expiry
3. ✅ Hash new password
4. ✅ Update password and clear reset token
5. ✅ Return success response

## 🧪 Testing the Fix

### Run the Test Script:
```bash
cd backend
node test_password_reset.js
```

### Expected Output:
```
🧪 Testing Password Reset Flow...

1. Checking users table structure...
Reset fields in users table: ['reset_password_token', 'reset_password_expiry']

2. Finding a test user...
✅ Found test user: user@example.com (ID: user_id_123)

3. Generating and saving reset token...
Generated token: abc123def456...
Expiry: 2024-01-01T15:30:00.000Z
Update result: [object Object]

4. Verifying token was saved...
Saved token data: { reset_password_token: 'abc123def456...', reset_password_expiry: '2024-01-01T15:30:00.000Z' }
✅ Token saved successfully

5. Testing token lookup...
Found users with valid token: 1
✅ Token lookup successful

6. Cleaning up test data...
✅ Test data cleaned up

🎉 Password reset flow test completed!
```

## 📊 Database Schema

### Users Table Structure (After Migration):
```sql
CREATE TABLE users (
    id CHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    password_hash CHAR(60),
    profile_pic VARCHAR(500),
    phone_otp CHAR(6),
    phone_otp_expiration DATETIME,
    is_phone_verified TINYINT(1) DEFAULT 0,
    is_profile_completed TINYINT(1) DEFAULT 0,
    gender ENUM('Male', 'Female', 'Other', 'Select Gender') NOT NULL DEFAULT('Select Gender'),
    age INT NOT NULL DEFAULT -1,
    current_address TEXT,
    amount_spent BIGINT DEFAULT 0,
    reset_password_token VARCHAR(100),        -- ✅ Added
    reset_password_expiry DATETIME,           -- ✅ Added
    google_id VARCHAR(64) UNIQUE,
    auth_provider ENUM('local', 'google') DEFAULT 'local',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (email),
    INDEX (phone)
);
```

## 🔍 Debugging Information

### Console Logs Added:

#### Forgot Password:
```
Password reset request received for: user@example.com
User found: user_id_123
Reset token generated for user: user_id_123
Update result: [object Object]
Reset token: abc123def456...
Reset expiry: 2024-01-01T15:30:00.000Z
Token verification: { reset_password_token: 'abc123def456...', reset_password_expiry: '2024-01-01T15:30:00.000Z' }
Password reset email sent successfully to: user@example.com
```

#### Reset Password:
```
Resetting password with token: abc123def456...
Found users with token: 1
All users with this token (including expired): [{ id: 'user_id_123', reset_password_token: 'abc123def456...', reset_password_expiry: '2024-01-01T15:30:00.000Z' }]
Password reset successfully for user: user_id_123
```

## 🚀 Deployment Steps

1. **Deploy the updated code** with migration script
2. **Restart the server** to run the migration
3. **Verify migration** by checking console logs
4. **Test the flow** using the test script
5. **Monitor logs** for any issues

## ✅ Verification Checklist

- [ ] Migration script runs successfully
- [ ] Reset token fields exist in users table
- [ ] Token generation works correctly
- [ ] Token saving to database works
- [ ] Token lookup works correctly
- [ ] Email sending works (if configured)
- [ ] Password reset completes successfully
- [ ] Token is cleared after successful reset

## 🎯 Expected Behavior After Fix

1. **Forgot Password Request**: ✅ Token saved to database
2. **Email Sent**: ✅ User receives reset link
3. **Reset Password**: ✅ Token validated and password updated
4. **Success Response**: ✅ User can login with new password

The password reset flow should now work correctly with proper token storage and validation! 🎉
