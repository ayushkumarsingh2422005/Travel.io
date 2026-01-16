const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../utils/emailService');
const { sendOTP, generateOTP } = require('../../utils/smsService');
const { encrypt, decrypt } = require('../../utils/authencrypt');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper: Generate JWT
function generateToken(vendor) {
    return jwt.sign({ id: vendor.id, email: vendor.email }, JWT_SECRET, { expiresIn: '7d' });
}

// Helper: Generate random token
function generateRandomToken() {
    return crypto.randomBytes(32).toString('hex');
}

const verifytoken = (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided.', success: false });
        }
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token.', success: false });
            }
            // Token is valid, you can access decoded data
            res.status(200).json({ message: 'Token is valid', success: true, customer: decoded });
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Token verification failed', success: false, error: err.message });
    }
}

const signup = async (req, res) => {
    try {
        const { name, email, phone, password, gender, age, current_address, description } = req.body;

        console.log(`Vendor signup request for: ${email}`);

        if (!name || !email || !phone || !password || !gender || !age || !current_address) {
            return res.status(400).json({ message: 'All required fields are missing.' });
        }

        const [existing] = await db.execute('SELECT * FROM vendors WHERE email = ?', [email]);

        if (existing.length > 0) {
            console.log(`Signup failed: Email ${email} already registered`);
            return res.status(409).json({ message: 'Email already registered.' });
        }

        const [existingPhone] = await db.execute('SELECT * FROM vendors WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) {
            console.log(`Signup failed: Phone ${phone} already registered`);
            return res.status(409).json({ message: 'Phone number already registered.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const id = crypto.randomBytes(32).toString('hex');

        // Generate email verification token
        const email_verification_token = generateRandomToken();
        const email_verification_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        console.log(`Creating new vendor account with ID: ${id}`);

        await db.execute(
            `INSERT INTO vendors (id, name, email, phone, password_hash, gender, age, current_address, description, 
            email_verification_token, email_verification_expiry, is_email_verified) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, email, phone, password_hash, gender, age, current_address, description || null,
                email_verification_token, email_verification_expiry, 0]
        );

        console.log(`Vendor account created, sending verification email to: ${email}`);

        // Send verification email
        const emailSent = await sendVerificationEmail(email, email_verification_token, 'vendor');

        if (!emailSent) {
            console.warn(`Warning: Verification email could not be sent to ${email}`);
        }

        const token = generateToken({ id, email });
        console.log(`Vendor signup successful for: ${email}`);

        res.status(201).json({
            token,
            message: 'Account created successfully. Please verify your email address.'
        });
    } catch (err) {
        console.error('Vendor signup error:', err);
        res.status(500).json({ message: 'Vendor signup failed', error: err.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

        const [vendors] = await db.execute('SELECT * FROM vendors WHERE email = ?', [email]);
        if (vendors.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });

        const vendor = vendors[0];
        const valid = await bcrypt.compare(password, vendor.password_hash);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

        const token = generateToken(vendor);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Vendor login failed', error: err.message });
    }
}

const google = async (req, res) => {
    try {
        const { id_token } = req.body;
        if (!id_token) return res.status(400).json({ message: 'No Google token provided.' });

        const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        const { sub: google_id, email, name, picture } = payload;

        console.log('Google auth for vendor:', { google_id, email, name, picture });

        let [vendors] = await db.execute('SELECT * FROM vendors WHERE email = ?', [email]);
        let vendor;

        if (vendors.length > 0) {
            vendor = vendors[0];
            // If vendor exists but doesn't have profile pic, update it
            if (!vendor.profile_pic && picture) {
                await db.execute('UPDATE vendors SET profile_pic = ? WHERE id = ?', [picture, vendor.id]);
                vendor.profile_pic = picture;
            }

            // Mark email as verified since Google already verified it
            if (!vendor.is_email_verified) {
                await db.execute('UPDATE vendors SET is_email_verified = 1 WHERE id = ?', [vendor.id]);
            }
        } else {
            try {
                // Create new vendor with Google info
                const id = crypto.randomBytes(32).toString('hex');
                console.log('Creating new Google vendor:', { id, name, email, picture, google_id });

                // For Google signup, we'll need additional required fields
                // You might want to redirect to a profile completion page
                await db.execute(
                    `INSERT INTO vendors (id, name, email, profile_pic, password_hash, gender, age, current_address, is_email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, name, email, picture, '', 'Other', 18, 'Address to be updated', 1]
                );

                vendor = { id, email, name, profile_pic: picture };
            } catch (err) {
                console.error('Error creating Google vendor:', err);
                return res.status(500).json({ message: 'Failed to create Google vendor', error: err.message });
            }
        }

        const token = generateToken(vendor);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Google sign-in failed', error: err.message });
    }
}

// Verify email address
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required.' });
        }

        // Find vendor with this token
        const [vendors] = await db.execute(
            'SELECT * FROM vendors WHERE email_verification_token = ? AND email_verification_expiry > NOW()',
            [token]
        );

        if (vendors.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }

        const vendor = vendors[0];

        // Check profile completion
        const isProfileCompleted = (vendor.name && vendor.gender && vendor.age && vendor.current_address &&
            // is_email_verified becoming 1
            vendor.is_phone_verified &&
            vendor.is_aadhaar_verified &&
            vendor.is_pan_verified) ? 1 : 0;

        // Mark email as verified and clear token, update profile completion
        await db.execute(
            'UPDATE vendors SET is_email_verified = 1, is_profile_completed = ?, email_verification_token = NULL, email_verification_expiry = NULL WHERE id = ?',
            [isProfileCompleted, vendor.id]
        );

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Email verification failed', error: err.message });
    }
}

// Resend verification email
const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        // Find vendor with this email
        const [vendors] = await db.execute('SELECT * FROM vendors WHERE email = ?', [email]);

        if (vendors.length === 0) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }

        console.log("Resending verification email");

        const vendor = vendors[0];

        // Check if email is already verified
        if (vendor.is_email_verified) {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        // Generate new verification token
        const email_verification_token = generateRandomToken();
        const email_verification_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update vendor with new token
        await db.execute(
            'UPDATE vendors SET email_verification_token = ?, email_verification_expiry = ? WHERE id = ?',
            [email_verification_token, email_verification_expiry, vendor.id]
        );


        // Send verification email
        await sendVerificationEmail(email, email_verification_token, 'vendor');

        res.status(200).json({ message: 'Verification email sent successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to resend verification email', error: err.message });
    }
}

// Send phone verification OTP
const sendPhoneVerificationOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        const vendorId = req.user.id; // From auth middleware

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required.' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otp_expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Update vendor with OTP
        // Check if the phone number matches the vendor's registered phone
        const [vendors] = await db.execute('SELECT * FROM vendors WHERE id = ?', [vendorId]);
        console.log('Vendors found:', vendors[0], phone);
        if (!vendors.length || vendors[0].phone !== phone) {
            return res.status(400).json({ message: 'Phone number does not match our records.' });
        }
        await db.execute(
            'UPDATE vendors SET phone_otp = ?, phone_otp_expiration = ? WHERE id = ?',
            [otp, otp_expiration, vendorId]
        );

        const formattedPhone = phone.replace(/^\+91|^91/, '');

        console.log(`Sending OTP ${otp} to phone ${formattedPhone}`);

        // Send OTP via SMS
        const sent = await sendOTP(phone, otp);

        if (!sent) {
             return res.status(500).json({ message: 'Failed to send OTP via SMS. Please try again later.' });
        }

        res.status(200).json({ message: 'OTP sent successfully to your phone.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send phone verification OTP', error: err.message });
    }
}

// Verify phone OTP
const verifyPhoneOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const vendorId = req.user.id; // From auth middleware

        if (!otp) {
            return res.status(400).json({ message: 'OTP is required.' });
        }

        // Find vendor with this OTP
        const [vendors] = await db.execute(
            'SELECT * FROM vendors WHERE id = ? AND phone_otp = ? AND phone_otp_expiration > NOW()',
            [vendorId, otp]
        );

        if (vendors.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Check profile completion (fetch latest vendor state first)
        const [vendorResult] = await db.execute('SELECT * FROM vendors WHERE id = ?', [vendorId]);
        const vendor = vendorResult[0]; // refresh vendor data

        const isProfileCompleted = (vendor.name && vendor.gender && vendor.age && vendor.current_address &&
            vendor.is_email_verified &&
            // is_phone_verified becoming 1
            vendor.is_aadhaar_verified &&
            vendor.is_pan_verified) ? 1 : 0;

        // Mark phone as verified and clear OTP, update profile completion
        await db.execute(
            'UPDATE vendors SET is_phone_verified = 1, is_profile_completed = ?, phone_otp = NULL, phone_otp_expiration = NULL WHERE id = ?',
            [isProfileCompleted, vendorId]
        );

        res.status(200).json({ message: 'Phone verified successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Phone verification failed', error: err.message });
    }
}

// Request password reset
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        console.log("Password reset request received for:", email);

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        // Find vendor with this email
        const [vendors] = await db.execute('SELECT * FROM vendors WHERE email = ?', [email]);

        if (vendors.length === 0) {
            console.log(`No vendor found with email: ${email}`);
            return res.status(404).json({ message: 'No account found with this email.' });
        }

        const vendor = vendors[0];
        console.log(`Vendor found: ${vendor.id}`);

        // Generate reset token
        const reset_password_token = generateRandomToken();
        const reset_password_expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Update vendor with reset token
        await db.execute(
            'UPDATE vendors SET reset_password_token = ?, reset_password_expiry = ? WHERE id = ?',
            [reset_password_token, reset_password_expiry, vendor.id]
        );

        console.log(`Reset token generated for vendor: ${vendor.id}`);

        // Send password reset email
        const emailResult = await sendPasswordResetEmail(email, reset_password_token, 'vendor');

        if (emailResult) {
            console.log(`Password reset email sent successfully to: ${email}`);
            res.status(200).json({ message: 'Password reset link sent to your email.' });
        } else {
            console.error(`Failed to send password reset email to: ${email}`);
            res.status(500).json({ message: 'Failed to send password reset email. Please try again later.' });
        }
    } catch (err) {
        console.error('Error in forgotPassword:', err);
        res.status(500).json({ message: 'Failed to process password reset request', error: err.message });
    }
}

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;


        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required.' });
        }


        // Find vendor with this token
        const [vendors] = await db.execute(
            'SELECT * FROM vendors WHERE reset_password_token = ? AND reset_password_expiry > NOW()',
            [token]
        );

        console.log("Resetting password with token:", token, password);

        if (vendors.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        const vendor = vendors[0];

        // Hash new password
        const password_hash = await bcrypt.hash(password, 10);

        // Update password and clear token
        await db.execute(
            'UPDATE vendors SET password_hash = ?, reset_password_token = NULL, reset_password_expiry = NULL WHERE id = ?',
            [password_hash, vendor.id]
        );

        res.status(200).json({ message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to reset password', error: err.message });
    }
}

/**
 * Generate Aadhaar verification link via AuthBridge
 * This function is moved to the route handler for better error handling
 */
/**
 * Step 1: Create Digilocker Aadhaar Redirect URL
 */
/**
 * Step 1: Create Digilocker Aadhaar Redirect URL
 */
const initiateDigilockerVerification = async (req, res) => {
    let requestUrl = '';
    try {
        const vendorId = req.user.id;
        
        // Use CLIENT_URL from env or fallback to dynamic origin or localhost
        const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';
        const redirect_url = `${clientUrl}/profile`;

        console.log("Using Redirect URL:", redirect_url);

        let ekycHubUrl = process.env.EKYC_HUB_URL;
        // Normalize URL: remove trailing /v3 or / to ensure consistent path construction
        if (ekycHubUrl.endsWith('/v3')) ekycHubUrl = ekycHubUrl.slice(0, -3);
        if (ekycHubUrl.endsWith('/')) ekycHubUrl = ekycHubUrl.slice(0, -1);

        const ekycHubUser = process.env.EKYC_USER_NAME;
        const ekycHubToken = process.env.EKYC_HUB_API;

        console.log("Initiating Digilocker Verification for:", vendorId);

        // Construct Request URL
        // Endpoint: /v3/digilocker/create_url_aadhaar
        requestUrl = `${ekycHubUrl}/v3/digilocker/create_url_aadhaar?username=${ekycHubUser}&token=${ekycHubToken}&redirect_url=${encodeURIComponent(redirect_url)}&orderid=${vendorId}`;

        console.log("Digilocker Request URL:", requestUrl);

        const response = await axios.get(requestUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'Referer': 'https://connect.ekychub.in/'
            }
        });
        const data = response.data;

        console.log("Digilocker Initiate Response:", JSON.stringify(data, null, 2));

        if (data.status === "Success" || data.status === 1) { // Handle both "Success" string or 1
            return res.json({
                status: 1,
                message: 'Digilocker URL created successfully',
                url: data.url,
                verification_id: data.verification_id,
                reference_id: data.reference_id
            });
        } else {
            console.warn("Digilocker Initiate Failed:", data);
            return res.status(400).json({
                status: 0,
                message: data.message || 'Failed to create Digilocker URL',
                debug_data: data
            });
        }

    } catch (error) {
        console.error('Digilocker Initiate Error Details:', error.message);
        res.status(500).json({ status: 0, message: 'Server error during Digilocker initiation', error: error.message });
    }
};

/**
 * Step 2: Get Digilocker Document
 */
const fetchDigilockerDocument = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { verification_id, reference_id } = req.body;

        if (!verification_id || !reference_id) {
            return res.status(400).json({ status: 0, message: 'Verification ID and Reference ID are required' });
        }

        let ekycHubUrl = process.env.EKYC_HUB_URL;
        // Normalize URL
        if (ekycHubUrl.endsWith('/v3')) ekycHubUrl = ekycHubUrl.slice(0, -3);
        if (ekycHubUrl.endsWith('/')) ekycHubUrl = ekycHubUrl.slice(0, -1);

        const ekycHubUser = process.env.EKYC_USER_NAME;
        const ekycHubToken = process.env.EKYC_HUB_API;

        // Correct Endpoint for fetching data after redirect flow
        // Assuming /v3/digilocker/download_aadhaar_xml or similar based on initiate endpoint prefix
        const digilockerFetchUrl = `${ekycHubUrl}/v3/digilocker/download_aadhaar_xml?username=${encodeURIComponent(ekycHubUser)}&token=${encodeURIComponent(ekycHubToken)}&verification_id=${encodeURIComponent(verification_id)}&reference_id=${encodeURIComponent(reference_id)}`;

        console.log("Fetching Digilocker Data from:", digilockerFetchUrl);

        // Call ekycHub API
        const ekycResponse = await axios.get(digilockerFetchUrl);
        const data = ekycResponse.data;

        console.log("Digilocker Fetch Response:", JSON.stringify(data, null, 2));

        if (data.status === "Success" || data.status === 1) {
            // Extract Aadhaar number if available, or use a placeholder if it's inside the XML/Data
            const aadhar_number = data.data?.uid || data.aadhaar_number || 'XXXXXXXXXXXX'; 

            // Refetch vendor to get latest status for profile completion check
            const [latestVendorResult] = await db.execute('SELECT * FROM vendors WHERE id = ?', [vendorId]);
            const vendor = latestVendorResult[0];

            // Check profile completion
            const isProfileCompleted = (vendor.name && vendor.gender && vendor.age && vendor.current_address &&
                vendor.is_email_verified &&
                vendor.is_phone_verified &&
                vendor.is_pan_verified
                // is_aadhaar_verified becoming 1
            ) ? 1 : 0;

            // Save Aadhaar data and mark as verified
            await db.execute(
                'UPDATE vendors SET is_aadhaar_verified = 1, is_profile_completed = ?, aadhar_data = ?, aadhar_number = ? WHERE id = ?',
                [isProfileCompleted, JSON.stringify(data), aadhar_number, vendorId]
            );
            return res.json({ status: 1, message: 'Aadhaar verified successfully', aadhaar_data: data });
        } else {
            console.warn("Digilocker Fetch Failed:", data);
            return res.status(400).json({
                status: 0,
                message: data.message || 'Failed to fetch Digilocker document',
                debug_data: data
            });
        }

    } catch (error) {
        console.error('Digilocker Fetch Error:', error);
        res.status(500).json({ status: 0, message: 'Server error during Digilocker document fetch', error: error.message });
    }
};

const getAadhaarData = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const [vendorResult] = await db.execute('SELECT aadhar_data FROM vendors WHERE id = ?', [vendorId]);
        if (vendorResult.length === 0) {
            return res.status(404).json({ status: 0, message: 'Vendor not found' });
        }
        return res.json({ status: 1, message: 'Aadhaar data fetched successfully', aadhaar_data: JSON.parse(vendorResult[0].aadhar_data) });
    } catch (error) {
        console.error('Aadhaar data fetching error:', error);
        res.status(500).json({ status: 0, message: 'Server error during Aadhaar data fetching' });
    }
};

const fetchPanData = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { pan_number } = req.body;
        const panNumber = pan_number;
        if (!panNumber) {
            return res.status(400).json({ status: 0, message: 'PAN number not found. Please provide PAN number.' });
        }

        // Prepare ekycHub API params
        let ekycHubUrl = process.env.EKYC_HUB_URL;
        // Normalize URL: remove trailing / to ensure consistent path construction
        if (ekycHubUrl.endsWith('/')) ekycHubUrl = ekycHubUrl.slice(0, -1);

        const ekycHubUser = process.env.EKYC_USER_NAME;
        const ekycHubToken = process.env.EKYC_HUB_API;

        const panVerifyUrl = `${ekycHubUrl}/verification/pan_verification?username=${encodeURIComponent(ekycHubUser)}&token=${encodeURIComponent(ekycHubToken)}&pan=${encodeURIComponent(panNumber)}&orderid=${encodeURIComponent(vendorId)}`;
        
        console.log("Verifying PAN at URL:", panVerifyUrl);

        // Call ekycHub API to verify PAN
        const ekycResponse = await axios.get(panVerifyUrl);

        if (ekycResponse.data.status) {
            //  if (ekycResponse.data.status === "Success") {

            // Check profile completion
            const [vendorResult] = await db.execute('SELECT * FROM vendors WHERE id = ?', [vendorId]);
            let isProfileCompleted = 0;
            if (vendorResult.length > 0) {
                const vendor = vendorResult[0];
                isProfileCompleted = (vendor.name && vendor.gender && vendor.age && vendor.current_address &&
                    vendor.is_email_verified &&
                    vendor.is_phone_verified &&
                    vendor.is_aadhaar_verified
                    // is_pan_verified becoming 1
                ) ? 1 : 0;
            }

            // Save PAN data, PAN NUMBER, and mark as verified
            await db.execute(
                'UPDATE vendors SET is_pan_verified = 1, is_profile_completed = ?, pan_data = ?, pan_number = ? WHERE id = ?',
                [isProfileCompleted, JSON.stringify(ekycResponse.data), panNumber, vendorId]
            );
            return res.json({ status: 1, message: 'PAN verified successfully', pan_data: ekycResponse.data });
        } else {
            return res.json({ status: 0, message: ekycResponse.data.message || 'Failed to verify PAN' });
        }
    } catch (error) {
        console.error('PAN verification error:', error);
        res.status(500).json({ status: 0, message: 'Server error during PAN verification' });
    }
};

const getPanData = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const [vendorResult] = await db.execute('SELECT pan_data FROM vendors WHERE id = ?', [vendorId]);
        if (vendorResult.length === 0) {
            return res.status(404).json({ status: 0, message: 'Vendor not found' });
        }
        return res.json({ status: 1, message: 'Pan data fetched successfully', pan_data: JSON.parse(vendorResult[0].pan_data) });
    } catch (error) {
        console.error('Pan data fetching error:', error);
        res.status(500).json({ status: 0, message: 'Server error during Pan data fetching' });
    }
};

module.exports = {
    signup,
    login,
    google,
    verifytoken,
    verifyEmail,
    resendVerificationEmail,
    sendPhoneVerificationOTP,
    verifyPhoneOTP,
    forgotPassword,
    resetPassword,
    initiateDigilockerVerification,
    fetchDigilockerDocument,
    getAadhaarData,
    fetchPanData,
    getPanData
};