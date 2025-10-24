import customerAxios from './customerAxios';

export interface CreateOrderRequest {
  vehicle_id: string;
  partner_id?: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  drop_date: string;
  path: string;
  distance: number;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    order_id: string;
    amount: number;
    currency: string;
    payment_id: string;
    vehicle_details: {
      model: string;
      registration_no: string;
      vendor_name: string;
    };
    booking_details: {
      pickup_location: string;
      dropoff_location: string;
      pickup_date: string;
      drop_date: string;
      distance: number;
      amount: number;
    };
  };
}

export interface VerifyPaymentRequest {
  payment_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: {
    booking: {
      id: string;
      customer_id: string;
      vehicle_id: string;
      vendor_id: string;
      partner_id: string;
      pickup_location: string;
      dropoff_location: string;
      pickup_date: string;
      drop_date: string;
      price: number;
      path: string;
      distance: number;
      status: string;
      created_at: string;
      customer_name: string;
      customer_phone: string;
      vehicle_model: string;
      vehicle_registration: string;
      no_of_seats: number;
      vendor_name: string;
      vendor_phone: string;
      partner_name: string;
    };
    payment: {
      payment_id: string;
      razorpay_payment_id: string;
      amount: number;
      status: string;
    };
  };
}

export const createPaymentOrder = async (
  orderRequest: CreateOrderRequest,
  token: string
): Promise<CreateOrderResponse> => {
  const response = await customerAxios.post('/payment/create-order', orderRequest, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const verifyPayment = async (
  paymentData: VerifyPaymentRequest,
  token: string
): Promise<VerifyPaymentResponse> => {
  const response = await customerAxios.post('/payment/verify', paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
