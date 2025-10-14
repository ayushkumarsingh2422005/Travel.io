# Payment Integration Example

## Complete Booking Flow with Payment

### Step 1: Frontend - Create Payment Order
```javascript
// User selects vehicle and fills booking details
const bookingData = {
  vehicle_id: "vehicle_123",
  partner_id: "partner_456", // Optional
  pickup_location: "Airport Terminal 1",
  dropoff_location: "Hotel ABC",
  pickup_date: "2024-01-15 10:00:00",
  drop_date: "2024-01-15 12:00:00",
  path: "Airport → Highway → Hotel",
  distance: 25
};

// Create payment order
const createPaymentOrder = async () => {
  try {
    const response = await fetch('/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Initialize Razorpay payment
      initializeRazorpay(result.data);
    } else {
      console.error('Payment order creation failed:', result.message);
    }
  } catch (error) {
    console.error('Error creating payment order:', error);
  }
};
```

### Step 2: Frontend - Initialize Razorpay Payment
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
      // Payment successful, verify payment
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
    },
    modal: {
      ondismiss: function() {
        console.log('Payment cancelled');
      }
    }
  };
  
  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

### Step 3: Frontend - Verify Payment and Create Booking
```javascript
const verifyPayment = async (paymentData) => {
  try {
    const response = await fetch('/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Booking created successfully
      console.log('Booking created:', result.data.booking);
      alert('Booking confirmed! Booking ID: ' + result.data.booking.id);
      
      // Redirect to booking details or dashboard
      window.location.href = `/booking/${result.data.booking.id}`;
    } else {
      console.error('Payment verification failed:', result.message);
      alert('Payment verification failed. Please try again.');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    alert('Error verifying payment. Please contact support.');
  }
};
```

### Step 4: Backend - Payment Order Creation
```javascript
// POST /payment/create-order
// 1. Validates booking data
// 2. Checks vehicle availability
// 3. Calculates price (distance × per_km_charge)
// 4. Creates Razorpay order
// 5. Stores transaction in database with 'pending' status
// 6. Returns order details to frontend
```

### Step 5: Backend - Payment Verification
```javascript
// POST /payment/verify
// 1. Verifies Razorpay signature
// 2. Updates transaction status to 'success'
// 3. Creates booking in database
// 4. Links transaction to booking
// 5. Creates partner commission if applicable
// 6. Returns booking details
```

## Environment Setup

### Backend (.env)
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

## Razorpay Setup

1. **Create Razorpay Account**: Sign up at https://razorpay.com
2. **Get API Keys**: From Razorpay Dashboard → Settings → API Keys
3. **Configure Webhook**: 
   - URL: `https://yourdomain.com/payment/webhook`
   - Events: `payment.captured`, `payment.failed`
4. **Test Mode**: Use test keys for development

## Database Migration

The transaction table will be automatically updated with new fields:
- `razorpay_order_id`
- `razorpay_payment_id`
- `payment_data`
- `updated_at`

## Testing

### Test Payment Flow
1. Use Razorpay test cards:
   - Success: `4111 1111 1111 1111`
   - Failure: `4000 0000 0000 0002`
2. Test webhook locally using ngrok
3. Verify booking creation after successful payment

### Test Scenarios
- ✅ Successful payment → Booking created
- ❌ Failed payment → No booking created
- ❌ Invalid signature → Payment verification fails
- ❌ Vehicle unavailable → Payment order creation fails
- ✅ Partner referral → Commission created

## Error Handling

```javascript
// Handle payment failures
const handlePaymentError = (error) => {
  switch (error.code) {
    case 'PAYMENT_CANCELLED':
      console.log('Payment cancelled by user');
      break;
    case 'PAYMENT_FAILED':
      console.log('Payment failed');
      break;
    case 'NETWORK_ERROR':
      console.log('Network error during payment');
      break;
    default:
      console.log('Unknown payment error');
  }
};
```

## Security Considerations

1. **Never expose Razorpay secret key in frontend**
2. **Always verify webhook signatures**
3. **Use HTTPS in production**
4. **Validate all input data**
5. **Implement rate limiting**
6. **Log all payment transactions**

## Production Checklist

- [ ] Replace test Razorpay keys with live keys
- [ ] Configure production webhook URL
- [ ] Set up proper error monitoring
- [ ] Implement payment retry logic
- [ ] Add payment analytics
- [ ] Test with real payment methods
- [ ] Set up backup payment methods
- [ ] Configure proper logging
