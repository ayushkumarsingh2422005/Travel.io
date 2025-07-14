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
        const authbridgeUrl = 
        // (process.env.AUTHBRIDGE_API_URL + "/v1.0/eaadhaardigilocker/") ||
         "https://www.truthscreen.com/api/v1.0/eaadhaardigilocker/";

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
            'SELECT is_aadhaar_verified, ts_trans_id, aadhar_data FROM vendors WHERE id = ?',
            [vendorId]
        );

        if (vendorResult.length === 0) {
            return res.status(404).json({ status: 0, message: 'Vendor not found' });
        }

        const { is_aadhaar_verified, ts_trans_id, aadhar_data } = vendorResult[0];

        // If already verified, return status and details
        if (is_aadhaar_verified === 1) {
            return res.json({
                status: 1,
                is_verified: true,
                aadhaar_data: JSON.parse(aadhar_data)
            });
        }

        // If no transaction ID, cannot check status
        if (!ts_trans_id) {
            return res.status(400).json({ status: 0, message: 'No Aadhaar transaction found for this vendor' });
        }

        // Prepare request to AuthBridge API to get Aadhaar details
        const apiUrl = 
        // process.env.AUTHBRIDGE_API_URL + "/v1.0/eaadhaardigilocker/" || 
        "https://www.truthscreen.com/api/v1.0/eaadhaardigilocker/";
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
        if(dataObj.data[ts_trans_id].final_status === "Completed"){
            await db.execute(
                'UPDATE vendors SET is_aadhaar_verified = 1, aadhar_data = ? WHERE id = ?',
                [JSON.stringify(dataObj.data), vendorId]
            );
            return res.json({
                status: 1,
                is_verified: true,
                aadhaar_data: JSON.parse(dataObj.data)
            });
        }else{
            return res.json({
                status: 0,
                is_verified: false,
                aadhaar_data: null
            });
        }

    } catch (error) {
        console.error('Error fetching Aadhaar status:', error?.response?.data || error.message);
        res.status(500).json({ status: 0, message: 'Server error fetching Aadhaar verification status', error: error?.response?.data || error.message });
    }
};

const panDetails = async (req, res) => {
    try {
        const vendorId = req.user.id;
        let { pan_number } = req.body;
        console.log(pan_number, req.user);

        // Fetch PAN and Aadhaar data from DB for this vendor
        const [vendorResult] = await db.execute('SELECT pan_data, aadhar_data FROM vendors WHERE id = ?', [vendorId]);
        if (vendorResult.length === 0) {
            return res.status(404).json({ status: 0, message: 'Vendor not found' });
        }

        // Try to get PAN details from DB
        let panDetailsFromDb = vendorResult[0].pan_data ? JSON.parse(vendorResult[0].pan_data) : null;

        // If PAN details already exist in DB, return them
        if (panDetailsFromDb) {
            // Get verification status
            const [verificationResult] = await db.execute('SELECT is_pan_verified FROM vendors WHERE id = ?', [vendorId]);
            const isPanVerified = verificationResult[0].is_pan_verified || 0;
            
            return res.json({ 
                status: 1, 
                pan_number: pan_number, 
                pan_details: panDetailsFromDb,
                is_pan_verified: !!isPanVerified
            });
        }

        // If PAN number is not present, require it from request body
        if (!pan_number) {
            pan_number = req.body.pan_number;
            if (!pan_number) {
                return res.status(400).json({ status: 0, message: 'PAN number not provided' });
            }
        }

        // Check if Aadhaar data exists - we'll need this for verification
        let aadhaarData = null;
        if (vendorResult[0].aadhar_data) {
            try {
                aadhaarData = JSON.parse(vendorResult[0].aadhar_data);
            } catch (e) {
                console.error("Failed to parse aadhar_data from DB:", e.message);
            }
        }

        // Prepare request to AuthBridge API
        const apiUrl = "https://www.truthscreen.com/v1/apicall/nid/panComprehensive";
        const username = process.env.AUTHBRIDGE_USERNAME || " test@marcocabs.com ";
        const doc_type = 523;

        // Prepare payload as per AuthBridge requirements
        const payload = {
            PanNumber: pan_number,
            docType: doc_type,
            transID: vendorId
        };
        console.log(payload);

        // Encrypt payload
        const plainText = JSON.stringify(payload);
        const encryptedData = encrypt(plainText);

        const headers = {
            "Content-Type": "application/json",
            "username": username
        };

        // Make POST request to AuthBridge
        const response = await axios.post(
            apiUrl,
            { requestData: encryptedData },
            { headers }
        );

        // Process the response
        console.log("PAN API Response:", response.data);

        if (response.data && response.data.responseData) {
            try {
                // Decrypt the response data
                const decryptedData = decrypt(response.data.responseData);
                console.log("Decrypted PAN data:", decryptedData);
                
                // Parse the decrypted JSON
                const panData = JSON.parse(decryptedData);

                // Get Aadhaar data from DB for name and DOB comparison
                let aadhaarName = null, aadhaarDob = null;
                if (aadhaarData) {
                    // Aadhaar data structure: { [ts_trans_id]: { name, dob, ... } }
                    // Get the first key (ts_trans_id)
                    const aadhaarKey = Object.keys(aadhaarData)[0];
                    if (aadhaarKey && aadhaarData[aadhaarKey]) {
                        // Check if the data has the expected structure
                        if (aadhaarData[aadhaarKey].msg && 
                            aadhaarData[aadhaarKey].msg[0] && 
                            aadhaarData[aadhaarKey].msg[0].data) {
                            
                            aadhaarName = (aadhaarData[aadhaarKey].msg[0].data.name || "").toLowerCase().replace(/\s+/g, '');
                            // Convert DD-MM-YYYY to YYYY-MM-DD if needed
                            let dobStr = aadhaarData[aadhaarKey].msg[0].data.dob || "";
                            if (dobStr.includes('-')) {
                                const parts = dobStr.split('-');
                                if (parts.length === 3 && parts[0].length === 2) {
                                    // Format is DD-MM-YYYY, convert to YYYY-MM-DD
                                    aadhaarDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                } else {
                                    aadhaarDob = dobStr.split('T')[0]; // Remove time if present
                                }
                            } else {
                                aadhaarDob = dobStr.split('T')[0]; // Remove time if present
                            }
                        }
                        console.log("Aadhaar data:", aadhaarName, aadhaarDob);
                    }
                }

                let panName = null, panDob = null;
                // PAN data structure may vary, but usually has fields like name, dob, etc.
                // Try to extract from common fields
                if (panData && panData.result) {
                    // AuthBridge PAN result structure
                    panName = (panData.result.name || "").toLowerCase().replace(/\s+/g, '');
                    panDob = (panData.result.dob || "").split('T')[0];
                } else if (panData && panData.name) {
                    panName = (panData.name || "").toLowerCase().replace(/\s+/g, '');
                    panDob = (panData.dob || "").split('T')[0];
                } else if (panData && panData.data) {
                    // Format from the decrypted response
                    panName = (panData.data.full_name || "").toLowerCase().replace(/\s+/g, '');
                    panDob = panData.data.dob || "";
                }

                console.log(panName, panDob);

                // Compare name and DOB for verification
                let isPanVerified = 0;
                if (aadhaarName && aadhaarDob && panName && panDob) {
                    console.log("Comparing names and DOBs:");
                    console.log("Aadhaar Name:", aadhaarName);
                    console.log("PAN Name:", panName);
                    console.log("Aadhaar DOB:", aadhaarDob);
                    console.log("PAN DOB:", panDob);
                    
                    // Compare names (case-insensitive, ignore spaces)
                    const nameMatch = aadhaarName === panName;
                    
                    // Compare DOBs (handle different formats)
                    let dobMatch = false;
                    if (aadhaarDob === panDob) {
                        dobMatch = true;
                    } else {
                        // Try to normalize dates for comparison
                        try {
                            const aadhaarDate = new Date(aadhaarDob);
                            const panDate = new Date(panDob);
                            dobMatch = aadhaarDate.getTime() === panDate.getTime();
                        } catch (e) {
                            console.error("Error comparing dates:", e.message);
                        }
                    }
                    
                    console.log("Name match:", nameMatch);
                    console.log("DOB match:", dobMatch);
                    
                    if (nameMatch && dobMatch) {
                        isPanVerified = 1;
                    }
                }

                // Save PAN details and verification status to DB for future requests
                await db.execute(
                    'UPDATE vendors SET pan_data = ?, is_pan_verified = ? WHERE id = ?',
                    [decryptedData, isPanVerified, vendorId]
                );

                return res.json({
                    status: 1,
                    pan_number: pan_number,
                    pan_details: panData,
                    is_pan_verified: !!isPanVerified
                });
            } catch (decryptError) {
                console.error('Error decrypting PAN response:', decryptError.message);
                return res.status(500).json({ 
                    status: 0, 
                    message: 'Error processing PAN verification response',
                    error: 'Decryption failed'
                });
            }
        } else {
            return res.status(400).json({ 
                status: 0, 
                message: 'Invalid response from PAN verification service',
                raw_response: response.data
            });
        }

    } catch (error) {
        console.error('Error fetching PAN details:', error.message || JSON.stringify(error));
        
        // If the error contains encrypted response data, try to decrypt it
        if (error.response?.data?.responseData) {
            try {
                const decryptedError = decrypt(error.response.data.responseData);
                console.log("Decrypted error response:", decryptedError);
                return res.status(500).json({ 
                    status: 0, 
                    message: 'PAN verification failed', 
                    error: JSON.parse(decryptedError) 
                });
            } catch (decryptError) {
                console.error('Failed to decrypt error response:', decryptError.message);
            }
        }
        
        res.status(500).json({ 
            status: 0, 
            message: 'Server error fetching PAN details', 
            error: error?.response?.data || error.message 
        });
    }
}
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
    getAadhaarStatus,
    panDetails
};
