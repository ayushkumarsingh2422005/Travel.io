# User Authentication API Documentation

## Overview
This document provides comprehensive documentation for the user authentication system implemented in Travel.io backend. The system supports email/password authentication, Google OAuth, mandatory phone verification, and complete profile management.

## Base URL
```
http://localhost:5000
```

## Authentication Flow
1. **Sign up** with email/password or Google OAuth
2. **Add phone number** (mandatory for profile completion)
3. **Verify phone** with OTP
4. **Complete profile** with additional details
5. **Access protected resources**

---

## 🔐 Authentication Endpoints

### 1. User Signup
**POST** `/user/auth/signup`

Create a new user account with email and password.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "gender": "Male",           // Optional: "Male", "Female", "Other"
  "age": 25,                  // Optional
  "current_address": "123 Main St" // Optional
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Account created successfully. Please add and verify your phone number to complete your profile."
}
```

**Error Responses:**
- `400`: Missing required fields
- `409`: Email already registered

---

### 2. User Login
**POST** `/user/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials

---

### 3. Google OAuth
**POST** `/user/auth/google`

Sign in or sign up using Google OAuth.

**Request Body:**
```json
{
  "id_token": "google_oauth_id_token_here"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Google sign-in successful. Please add and verify your phone number to complete your profile."
}
```

**Error Responses:**
- `400`: No Google token provided
- `500`: Google sign-in failed

---

### 4. Verify Token
**GET** `/user/auth/verifytoken`

Verify if the provided JWT token is valid.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Token is valid",
  "success": true,
  "customer": {
    "id": "user_id",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `401`: No token provided or invalid token

---

### 5. Forgot Password
**POST** `/user/auth/forgot-password`

Request a password reset link.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset link sent to your email."
}
```

**Error Responses:**
- `400`: Email is required
- `404`: No account found with this email

---

### 6. Reset Password
**POST** `/user/auth/reset-password`

Reset password using the token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully. You can now log in with your new password."
}
```

**Error Responses:**
- `400`: Token and password required, or invalid/expired token

---

## 📱 Phone Verification Endpoints (Protected)

### 7. Add Phone Number
**POST** `/user/auth/add-phone`

Add or update phone number and send verification OTP.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "phone": "+919876543210"
}
```

**Response (200):**
```json
{
  "message": "OTP sent successfully to your phone."
}
```

**Error Responses:**
- `400`: Phone number is required
- `409`: Phone number already registered by another user
- `500`: Failed to send OTP

---

### 8. Resend Phone OTP
**POST** `/user/auth/send-phone-otp`

Resend OTP to existing phone number.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "OTP sent successfully to your phone."
}
```

**Error Responses:**
- `400`: No phone number found. Please add a phone number first
- `500`: Failed to send OTP

---

### 9. Verify Phone OTP
**POST** `/user/auth/verify-phone-otp`

Verify the OTP sent to phone number.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Phone verified successfully."
}
```

**Error Responses:**
- `400`: OTP is required, or invalid/expired OTP

---

## 👤 User Profile Endpoints (Protected)

### 10. Get User Profile
**GET** `/user/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "gender": "Male",
    "profile_pic": "https://example.com/pic.jpg",
    "age": 25,
    "current_address": "123 Main St",
    "amount_spent": 0,
    "is_phone_verified": true,
    "is_profile_completed": true,
    "auth_provider": "local",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `404`: User not found

---

### 11. Update User Profile
**PUT** `/user/profile`

Update user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "gender": "Male",
  "age": 26,
  "current_address": "456 Oak Avenue"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "user": {
    // Updated user object
  }
}
```

**Error Responses:**
- `400`: No valid fields provided for update
- `404`: User not found

---

### 12. Update Password
**PUT** `/user/password`

Change user password (for local accounts).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400`: Current password and new password required, or current password incorrect
- `400`: Cannot change password for Google account (if no password set)

---

### 13. Set Password (Google Users)
**POST** `/user/set-password`

Set password for Google OAuth users.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "password": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password set successfully"
}
```

**Error Responses:**
- `400`: Password is required, or password already set

---

### 14. Delete Account
**DELETE** `/user/account`

Delete user account permanently.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body (for local accounts):**
```json
{
  "password": "currentPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User account deleted successfully"
}
```

**Error Responses:**
- `400`: Password required (for local accounts), or incorrect password
- `404`: User not found

---

## 🔧 Authentication Headers

All protected endpoints require the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 User Profile Completion

A user profile is considered complete when:
- ✅ Phone number is verified (`is_phone_verified = true`)
- ✅ Name is provided
- ✅ Gender is set (not "Select Gender")
- ✅ Age is set (not -1)
- ✅ Current address is provided

When all conditions are met, `is_profile_completed` is automatically set to `true`.

## 🚨 Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## 📱 Phone Number Format

Phone numbers should be provided in international format:
- ✅ `+919876543210`
- ✅ `919876543210`
- ❌ `9876543210` (will be formatted automatically)

## 🔐 JWT Token Details

- **Expiration**: 7 days
- **Algorithm**: HS256
- **Payload**: `{ id, email }`

## 🎯 Usage Examples

### Complete User Registration Flow

```javascript
// 1. Sign up
const signupResponse = await fetch('/user/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});
const { token } = await signupResponse.json();

// 2. Add phone number
await fetch('/user/auth/add-phone', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    phone: '+919876543210'
  })
});

// 3. Verify OTP
await fetch('/user/auth/verify-phone-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    otp: '123456'
  })
});

// 4. Complete profile
await fetch('/user/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    gender: 'Male',
    age: 25,
    current_address: '123 Main St'
  })
});
```

### Google OAuth Flow

```javascript
// 1. Google sign-in
const googleResponse = await fetch('/user/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_token: 'google_oauth_token'
  })
});
const { token } = await googleResponse.json();

// 2. Set password (optional)
await fetch('/user/set-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    password: 'securePassword123'
  })
});

// 3. Continue with phone verification...
```

## 🛠️ Environment Variables Required

```env
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
FAST2SMS_API_KEY=your_fast2sms_api_key
```

## 📝 Notes

- Phone verification is **mandatory** for profile completion
- Email verification is **not required** for users (unlike vendors)
- Google users can optionally set passwords for local login
- OTP expires in 10 minutes
- Password reset tokens expire in 1 hour
- JWT tokens expire in 7 days

---

*This documentation covers the complete user authentication system for Travel.io backend API.*
