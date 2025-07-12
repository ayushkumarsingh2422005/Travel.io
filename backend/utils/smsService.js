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
    // Format phone number (remove country code if present)
    const formattedPhone = phone.replace(/^\+91|^91/, '');
    
    // Fast2SMS API configuration
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    const headers = {
      'authorization': process.env.FAST2SMS_API_KEY,
      'Content-Type': 'application/json'
    };
    
    // Prepare payload
    const data = {
      variables_values: otp,
      route: 'otp',
      numbers: formattedPhone
    };
    
    // Make API request
    const response = await axios.post(url, data, { headers });
    
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