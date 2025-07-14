const SibApiV3Sdk = require('@getbrevo/brevo');
require('dotenv').config();

// Initialize Brevo API instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Get API key from environment variables
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Log API key status (not the actual key)
console.log('BREVO_API_KEY is ' + (BREVO_API_KEY ? 'configured' : 'missing'));

// Configure API key authorization if available
if (BREVO_API_KEY) {
  apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);
} else {
  console.error('WARNING: BREVO_API_KEY is not configured in environment variables');
}

/**
 * Send email using Brevo SDK
 * @param {Object} options - Email options
 * @returns {Promise} - Promise with the API response
 */
const sendEmail = async (options) => {
  try {
    // Check if API key is configured
    if (!BREVO_API_KEY) {
      console.error('Cannot send email: BREVO_API_KEY is not configured');
      return { success: false, error: 'API key not configured' };
    }

    console.log('Attempting to send email to:', options.to);
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Set required parameters
    sendSmtpEmail.to = options.to;
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.htmlContent;

    // Set optional parameters if provided
    if (options.textContent) sendSmtpEmail.textContent = options.textContent;
    if (options.templateId) sendSmtpEmail.templateId = options.templateId;
    if (options.params) sendSmtpEmail.params = options.params;
    if (options.cc) sendSmtpEmail.cc = options.cc;
    if (options.bcc) sendSmtpEmail.bcc = options.bcc;
    if (options.replyTo) sendSmtpEmail.replyTo = options.replyTo;
    if (options.tags) sendSmtpEmail.tags = options.tags;
    if (options.attachment) sendSmtpEmail.attachment = options.attachment;

    // Set sender
    sendSmtpEmail.sender = {
      name: process.env.EMAIL_FROM_NAME || 'Travel.io',
      email: process.env.EMAIL_FROM || 'noreply@travel.io'
    };

    console.log('Email configuration:', {
      to: options.to,
      subject: options.subject,
      sender: sendSmtpEmail.sender
    });

    // Send the email
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    // console.log('Email sent successfully via Brevo SDK:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

/**
 * Send OTP email using Brevo SDK
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - Optional recipient name
 * @returns {Promise} - Promise with the API response
 */
const sendOTPEmail = async (email, otp, name) => {
  try {
    console.log(`Sending OTP email to ${email} with code ${otp}`);
    
    const recipientName = name || email.split('@')[0];
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your OTP Code</h2>
        <p>Hello ${recipientName},</p>
        <p>Your OTP code is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${otp}</strong>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>Travel.io Team</p>
      </div>
    `;

    const result = await sendEmail({
      to: [{ email, name: recipientName }],
      subject: 'Your OTP Code - Travel.io',
      htmlContent,
      tags: ['otp']
    });

    if (result.success) {
      console.log(`OTP email sent successfully to ${email}`);
    } else {
      console.error(`Failed to send OTP email to ${email}:`, result.error);
    }

    return result.success;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

/**
 * Send verification email to user using Brevo SDK
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @param {string} type - Type of user (vendor, user, etc.)
 */
const sendVerificationEmail = async (email, token, type) => { 
  // email, email_verification_token, 'vendor'
  try {
    console.log(`Sending verification email to ${email} (user type: ${type})`);
    
    const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/${type}/auth/verify-email?token=${token}`;
    console.log('Verification URL:', verificationUrl);
    
    const htmlContent = `
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
    `;

    const result = await sendEmail({
      to: [{ email, name: email.split('@')[0] }],
      subject: 'Verify Your Email Address - Travel.io',
      htmlContent,
      tags: ['verification']
    });

    if (result.success) {
      console.log(`Verification email sent successfully to ${email}`);
    } else {
      console.error(`Failed to send verification email to ${email}:`, result.error);
    }

    return result.success;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

/**
 * Send password reset email using Brevo SDK
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 * @param {string} type - Type of user (vendor, user, etc.)
 */
const sendPasswordResetEmail = async (email, token, type) => {
  try {
    console.log(`Sending password reset email to ${email} (user type: ${type})`);
    
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/${type}/reset-password?token=${token}`;
    console.log('Reset URL:', resetUrl);
    
    const htmlContent = `
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
    `;

    const result = await sendEmail({
      to: [{ email, name: email.split('@')[0] }],
      subject: 'Reset Your Password - Travel.io',
      htmlContent,
      tags: ['password-reset']
    });

    if (result.success) {
      console.log(`Password reset email sent successfully to ${email}`);
    } else {
      console.error(`Failed to send password reset email to ${email}:`, result.error);
    }

    return result.success;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

/**
 * Test email functionality
 */
const testEmailService = async () => {
  try {
    console.log('Testing email service...');
    
    if (!BREVO_API_KEY) {
      console.error('Cannot test email: BREVO_API_KEY is not configured');
      return { success: false, error: 'API key not configured' };
    }
    
    const testEmail = 'test@example.com'; // Replace with a real email for testing
    
    const result = await sendEmail({
      to: [{ email: testEmail, name: 'Test User' }],
      subject: 'Test Email from Travel.io',
      htmlContent: '<p>This is a test email from Travel.io. If you received this, the email service is working correctly.</p>'
    });
    
    if (result.success) {
      console.log('Test email sent successfully');
    } else {
      console.error('Test email failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error testing email service:', error);
    return { success: false, error };
  }
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  testEmailService
}; 