const axios = require('axios');
require('dotenv').config();

/**
 * Send verification email to user using Brevo API
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @param {string} type - Type of user (vendor, user, etc.)
 */
const sendVerificationEmail = async (email, token, type) => {
  try {
    const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/${type}/auth/verify-email?token=${token}`;
    
    // Prepare API request to Brevo
    const url = 'https://api.brevo.com/v3/smtp/email';
    const headers = {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    };

    console.log(process.env.BREVO_API_KEY);
    
    const data = {
      sender: {
        name: 'Travel.io',
        email: process.env.EMAIL_FROM || 'noreply@travel.io'
      },
      to: [
        {
          email: email,
          name: email.split('@')[0]
        }
      ],
      subject: 'Verify Your Email Address - Travel.io',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering with Travel.io. Please click the button below to verify your email address:</p>
          <div style="margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
      `
    };

    const response = await axios.post(url, data, { headers });
    console.log('Email sent via Brevo API:', response.data);
    return true;
  } catch (error) {
    console.error('Error sending verification email via Brevo API:', error.response?.data || error.message);
    return false;
  }
};

/**
 * Send password reset email using Brevo API
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 * @param {string} type - Type of user (vendor, user, etc.)
 */
const sendPasswordResetEmail = async (email, token, type) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/${type}/reset-password?token=${token}`;
    
    // Prepare API request to Brevo
    const url = 'https://api.brevo.com/v3/smtp/email';
    const headers = {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    };
    
    const data = {
      sender: {
        name: 'Travel.io',
        email: process.env.EMAIL_FROM || 'noreply@travel.io'
      },
      to: [
        {
          email: email,
          name: email.split('@')[0]
        }
      ],
      subject: 'Reset Your Password - Travel.io',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset for your Travel.io account. Please click the button below to set a new password:</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      `
    };

    const response = await axios.post(url, data, { headers });
    console.log('Password reset email sent via Brevo API:', response.data);
    return true;
  } catch (error) {
    console.error('Error sending password reset email via Brevo API:', error.response?.data || error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
}; 