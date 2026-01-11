const axios = require('axios');
require('dotenv').config();

/**
 * Send OTP via Fast2SMS
 * @param {string} phone - Phone number (without country code)
 * @param {string} otp - OTP to send
 * @returns {Promise<boolean>} - Success status
 */
const sendOTP = async (phone, otp) => {
  try {
    // Format phone number (extract last 10 digits)
    const formattedPhone = phone.toString().replace(/\D/g, '').slice(-10);
    
    // Check for API Key - Use ENV first, then fallback to the key provided by user
    const apiKey = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;

    console.log(`Sending OTP ${otp} to phone ${formattedPhone}`);
    
    // Fast2SMS API configuration
    // User requested URL pattern: https://www.fast2sms.com/dev/bulkV2?authorization=...&route=q&message=&flash=0&numbers=&schedule_time=
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    
    const message = `Your OTP code is ${otp}. Valid for 10 minutes. Travel.io`;
    
    const params = {
      authorization: apiKey,
      route: 'q',
      message: message,
      flash: '0',
      numbers: formattedPhone
    };
    
    // Make API request (GET as per URL pattern hint)
    const response = await axios.get(url, { params });
    
    if (response.data && response.data.return === true) {
      console.log('OTP sent successfully:', response.data);
      return true;
    } else {
      console.error('Failed to send OTP:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

/**
 * Generate a random 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendOTP,
  generateOTP
}; 