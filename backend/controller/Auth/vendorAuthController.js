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

const verifytoken=(req,res)=>{
    try{
      const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided.',success:false });
        }
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token.',success:false });
            }
            // Token is valid, you can access decoded data
            res.status(200).json({ message: 'Token is valid',success:true, customer: decoded });
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: 'Token verification failed',success:false, error: err.message });
    }
}

const signup = async (req, res) => {
    try {
        const { name, email, phone, password, gender, age, current_address, description } = req.body;
        if (!name || !email || !phone || !password || !gender || !age || !current_address) {
            return res.status(400).json({ message: 'All required fields are missing.' });
        }
        
        const [existing] = await db.execute('SELECT * FROM vendors WHERE email = ?', [email]);

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        const [existingPhone] = await db.execute('SELECT * FROM vendors WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) {
            return res.status(409).json({ message: 'Phone number already registered.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const id = crypto.randomBytes(32).toString('hex');
        
        // Generate email verification token
        const email_verification_token = generateRandomToken();
        const email_verification_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        await db.execute(
            `INSERT INTO vendors (id, name, email, phone, password_hash, gender, age, current_address, description, 
            email_verification_token, email_verification_expiry, is_email_verified) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, email, phone, password_hash, gender, age, current_address, description || null, 
            email_verification_token, email_verification_expiry, 0]
        );
        
        // Send verification email
        await sendVerificationEmail(email, email_verification_token, 'vendor');
        
        const token = generateToken({ id, email });
        res.status(201).json({ 
            token,
            message: 'Account created successfully. Please verify your email address.'
        });
    } catch (err) {
        console.log(err);
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
        
        // Mark email as verified and clear token
        await db.execute(
            'UPDATE vendors SET is_email_verified = 1, email_verification_token = NULL, email_verification_expiry = NULL WHERE id = ?',
            [vendor.id]
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
        const vendorId = req.user.id ; // From auth middleware
        
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required.' });
        }
        
        // Generate OTP
        const otp = generateOTP();
        const otp_expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Update vendor with OTP
        // Check if the phone number matches the vendor's registered phone
        const [vendors] = await db.execute('SELECT * FROM vendors WHERE id = ?', [vendorId]);
        console.log('Vendors found:', vendors[0],phone);
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
        
        // Mark phone as verified and clear OTP
        await db.execute(
            'UPDATE vendors SET is_phone_verified = 1, phone_otp = NULL, phone_otp_expiration = NULL WHERE id = ?',
            [vendorId]
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

        console.log("response recieved",email);
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        
        // Find vendor with this email
        const [vendors] = await db.execute('SELECT * FROM vendors WHERE email = ?', [email]);
        
        if (vendors.length === 0) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }
        
        const vendor = vendors[0];
        
        // Generate reset token
        const reset_password_token = generateRandomToken();
        const reset_password_expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        
        // Update vendor with reset token
        await db.execute(
            'UPDATE vendors SET reset_password_token = ?, reset_password_expiry = ? WHERE id = ?',
            [reset_password_token, reset_password_expiry, vendor.id]
        );
        
        // Send password reset email
        await sendPasswordResetEmail(email, reset_password_token, 'vendor');
        
        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (err) {
        console.error(err);
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

        console.log("Resetting password with token:", token,password);
        
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
const generateAadhaarLink = async (req, res) => {
    try {
        const vendorId = req.user.id;
        console.log("vendorId", vendorId);

        // Get vendor email
        const [vendorResult] = await db.execute('SELECT id FROM vendors WHERE id = ?', [vendorId]);
        if (vendorResult.length === 0) {
            return res.status(404).json({ status: 0, message: 'Vendor not found' });
        }

        // Prepare payload for AuthBridge
        const payload = {
            trans_id: vendorId,
            doc_type: "472",
            action: "LINK",
            callback_url: process.env.AUTHBRIDGE_CALLBACK_URL || "https://api.travel.io/vendor/auth/aadhaar-callback",
            redirect_url: process.env.AUTHBRIDGE_REDIRECT_URL || "https://vendor.travel.io/verification-complete"
        };

        // Encrypt the payload
        const plainText = JSON.stringify(payload);
        const encryptedData = encrypt(plainText);

        // Call AuthBridge API with custom headers
        const authbridgeUrl = process.env.AUTHBRIDGE_API_URL + "/v1.0/eaadhaardigilocker/" || "https://www.truthscreen.com/api/v1.0/eaadhaardigilocker/";
        const response = await axios.post(
            authbridgeUrl,
            { requestData: encryptedData },
            {
                headers: {
                    "username": process.env.AUTHBRIDGE_USERNAME || " test@marcocabs.com "
                }
            }
        );

        // console.log(decrypt(response.data.responseData));
        const data = decrypt(response.data.responseData);
        const dataObj = JSON.parse(data);
        console.log(dataObj);

        if (dataObj.status === 1) {
            // Store the transaction ID and URL
            await db.execute(
                'UPDATE vendors SET ts_trans_id = ?, digilocker_url = ? WHERE id = ?',
                [dataObj.ts_trans_id, dataObj.data.url, vendorId]
            );

            res.json({
                status: 1,
                message: 'Aadhaar verification link generated successfully',
                verification_url: dataObj.data.url
            });
        } else {
            res.status(400).json({
                status: 0,
                message: 'Failed to generate Aadhaar verification link',
                error: dataObj.msg
            });
        }
    } catch (error) {
        console.error('Aadhaar verification error:', error);
        res.status(500).json({ status: 0, message: 'Server error during Aadhaar verification' });
    }
};

/**
 * Process callback from AuthBridge after Aadhaar verification
 * This function is moved to the route handler for better error handling
 */
// const processAadhaarCallback = async (req, res) => {
//     try {
//         const { ts_trans_id, status, message } = req.body;
        
//         if (!ts_trans_id) {
//             return res.status(400).json({ status: 0, message: 'Missing transaction ID' });
//         }
        
//         // Find vendor by transaction ID
//         const [vendorResult] = await db.execute('SELECT id FROM vendors WHERE ts_trans_id = ?', [ts_trans_id]);
        
//         if (vendorResult.length === 0) {
//             return res.status(404).json({ status: 0, message: 'No vendor found with this transaction ID' });
//         }
        
//         const vendorId = vendorResult[0].id;
        
//         if (status === 1 || status === '1' || status === true) {
//             // Update vendor's Aadhaar verification status
//             await db.execute(
//                 'UPDATE vendors SET is_aadhaar_verified = 1 WHERE id = ?',
//                 [vendorId]
//             );
            
//             res.json({ status: 1, message: 'Aadhaar verification completed successfully' });
//         } else {
//             res.status(400).json({
//                 status: 0,
//                 message: 'Aadhaar verification failed',
//                 error: message || 'Unknown error'
//             });
//         }
//     } catch (error) {
//         console.error('Aadhaar callback error:', error);
//         res.status(500).json({ status: 0, message: 'Server error processing Aadhaar verification callback' });
//     }
// };

/**
 * Get Aadhaar verification status for a vendor
 * This function is moved to the route handler for better error handling
 */
const getAadhaarStatus = async (req, res) => {
    try {
        const vendorId = req.user.id;

        // Fetch vendor's Aadhaar info from DB
        const [vendorResult] = await db.execute(
            'SELECT is_aadhaar_verified, ts_trans_id FROM vendors WHERE id = ?',
            [vendorId]
        );

        if (vendorResult.length === 0) {
            return res.status(404).json({ status: 0, message: 'Vendor not found' });
        }

        const { is_aadhaar_verified, ts_trans_id } = vendorResult[0];

        // If already verified, return status and details
        // if (is_aadhaar_verified === 1) {
        //     return res.json({
        //         status: 1,
        //         is_verified: true
        //     });
        // }

        // If no transaction ID, cannot check status
        if (!ts_trans_id) {
            return res.status(400).json({ status: 0, message: 'No Aadhaar transaction found for this vendor' });
        }

        // Prepare request to AuthBridge API to get Aadhaar details
        const apiUrl = process.env.AUTHBRIDGE_API_URL + "/v1.0/eaadhaardigilocker/" || "https://www.truthscreen.com/api/v1.0/eaadhaardigilocker/";
        const username = process.env.AUTHBRIDGE_USERNAME || " test@marcocabs.com ";
        const doc_type = "472";
        const action = "STATUS";

        const payload = {
            ts_trans_id: ts_trans_id,
            doc_type: doc_type,
            action: action
        };

        const plainText = JSON.stringify(payload);
        console.log(payload)
        const encryptedData = encrypt(plainText);

        const headers = {
            "username": username,
            "Content-Type": "application/json"
        };

        // Use axios to make the POST request
        const response = await axios.post(apiUrl, { requestData: encryptedData }, { headers });

        // The response from AuthBridge
        const data = decrypt(response.data.responseData);
        const dataObj = JSON.parse(data);
        console.log(dataObj);

        // You may want to parse aadhaarData as per your API's response structure
        // For now, return the full response
        return res.json({
            status: 1,
            is_verified: dataObj.status === 1,
            aadhaar_details: dataObj
        });

    } catch (error) {
        console.error('Error fetching Aadhaar status:', error?.response?.data || error.message);
        res.status(500).json({ status: 0, message: 'Server error fetching Aadhaar verification status', error: error?.response?.data || error.message });
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
    
    generateAadhaarLink,
    getAadhaarStatus
};
