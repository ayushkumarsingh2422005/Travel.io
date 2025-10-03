const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../../utils/emailService');
const { sendOTP, generateOTP } = require('../../utils/smsService');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper: Generate JWT
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
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
        const { name, email, password, gender, age, current_address } = req.body;
        
        console.log(`User signup request for: ${email}`);
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }
        
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log(`Signup failed: Email ${email} already registered`);
            return res.status(409).json({ message: 'Email already registered.' });
        }
        
        const password_hash = await bcrypt.hash(password, 10);
        const id = crypto.randomBytes(32).toString('hex');
        
        console.log(`Creating new user account with ID: ${id}`);
        
        await db.execute(
            `INSERT INTO users (id, name, email, password_hash, gender, age, current_address, auth_provider) VALUES (?, ?, ?, ?, ?, ?, ?, 'local')`,
            [id, name, email, password_hash, gender || 'Select Gender', age || -1, current_address || null]
        );
        
        const token = generateToken({ id, email });
        console.log(`User signup successful for: ${email}`);
        
        res.status(201).json({ 
            token,
            message: 'Account created successfully. Please add and verify your phone number to complete your profile.'
        });
    } catch (err) {
        console.error('User signup error:', err);
        res.status(500).json({ message: 'Signup failed', error: err.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
        const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND auth_provider = "local"', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });
        const user = users[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
        const token = generateToken(user);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
}

const google = async (req, res) => {
    try {
        const { id_token } = req.body;
        if (!id_token) return res.status(400).json({ message: 'No Google token provided.' });
        
        const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        const { sub: google_id, email, name, picture } = payload;
        
        console.log('Google auth for user:', { google_id, email, name, picture });
        
        let [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        let user;
        
        if (users.length > 0) {
            user = users[0];
            // If user exists but doesn't have profile pic, update it
            if (!user.profile_pic && picture) {
                await db.execute('UPDATE users SET profile_pic = ? WHERE id = ?', [picture, user.id]);
                user.profile_pic = picture;
            }
            
            // Update Google ID if not set
            if (!user.google_id) {
                await db.execute('UPDATE users SET google_id = ?, auth_provider = "google" WHERE id = ?', [google_id, user.id]);
            }
        } else {
            try {
                // Create new user with Google info
                const id = crypto.randomBytes(32).toString('hex');
                console.log('Creating new Google user:', { id, name, email, picture, google_id });
                
                await db.execute(
                    `INSERT INTO users (id, name, email, profile_pic, google_id, auth_provider) VALUES (?, ?, ?, ?, ?, 'google')`,
                    [id, name, email, picture, google_id]
                );
                
                user = { id, email, name, profile_pic: picture };
            } catch (err) {
                console.error('Error creating Google user:', err);
                return res.status(500).json({ message: 'Failed to create Google user', error: err.message });
            }
        }
        
        const token = generateToken(user);
        res.json({ 
            token,
            message: 'Google sign-in successful. Please add and verify your phone number to complete your profile.'
        });
    } catch (err) {
        res.status(500).json({ message: 'Google sign-in failed', error: err.message });
    }
}

// Add or update phone number and send verification OTP
const addPhoneNumber = async (req, res) => {
    try {
        const { phone } = req.body;
        const userId = req.user.id; // From auth middleware
        
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required.' });
        }
        
        // Check if phone number is already registered by another user
        const [existingPhone] = await db.execute('SELECT * FROM users WHERE phone = ? AND id != ?', [phone, userId]);
        if (existingPhone.length > 0) {
            return res.status(409).json({ message: 'Phone number already registered by another user.' });
        }
        
        // Generate OTP
        const otp = generateOTP();
        const otp_expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Update user with phone and OTP
        await db.execute(
            'UPDATE users SET phone = ?, phone_otp = ?, phone_otp_expiration = ?, is_phone_verified = 0 WHERE id = ?',
            [phone, otp, otp_expiration, userId]
        );

        console.log(`Sending OTP ${otp} to phone ${phone}`);
        
        // Send OTP via SMS
        const sent = await sendOTP(phone, otp);
        
        if (sent) {
            res.status(200).json({ message: 'OTP sent successfully to your phone.' });
        } else {
            res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
        }
    } catch (err) {
        console.error('Add phone number error:', err);
        res.status(500).json({ message: 'Failed to add phone number', error: err.message });
    }
}

// Send phone verification OTP (for existing phone numbers)
const sendPhoneVerificationOTP = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        
        // Get user's phone number
        const [users] = await db.execute('SELECT phone FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        const phone = users[0].phone;
        
        if (!phone) {
            return res.status(400).json({ message: 'No phone number found. Please add a phone number first.' });
        }
        
        // Generate OTP
        const otp = generateOTP();
        const otp_expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Update user with OTP
        await db.execute(
            'UPDATE users SET phone_otp = ?, phone_otp_expiration = ? WHERE id = ?',
            [otp, otp_expiration, userId]
        );

        console.log(`Sending OTP ${otp} to phone ${phone}`);
        
        // Send OTP via SMS
        const sent = await sendOTP(phone, otp);
        
        if (sent) {
            res.status(200).json({ message: 'OTP sent successfully to your phone.' });
        } else {
            res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
        }
    } catch (err) {
        console.error('Send phone OTP error:', err);
        res.status(500).json({ message: 'Failed to send phone verification OTP', error: err.message });
    }
}

// Verify phone OTP
const verifyPhoneOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user.id; // From auth middleware
        
        if (!otp) {
            return res.status(400).json({ message: 'OTP is required.' });
        }
        
        // Find user with this OTP
        const [users] = await db.execute(
            'SELECT * FROM users WHERE id = ? AND phone_otp = ? AND phone_otp_expiration > NOW()',
            [userId, otp]
        );
        
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        
        // Mark phone as verified and clear OTP
        await db.execute(
            'UPDATE users SET is_phone_verified = 1, phone_otp = NULL, phone_otp_expiration = NULL WHERE id = ?',
            [userId]
        );
        
        console.log(`Phone verified successfully for user: ${userId}`);
        res.status(200).json({ message: 'Phone verified successfully.' });
    } catch (err) {
        console.error('Phone verification error:', err);
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
        
        // Find user with this email
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            console.log(`No user found with email: ${email}`);
            return res.status(404).json({ message: 'No account found with this email.' });
        }
        
        const user = users[0];
        console.log(`User found: ${user.id}`);
        
        // Generate reset token
        const reset_password_token = generateRandomToken();
        const reset_password_expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        
        // Update user with reset token
        await db.execute(
            'UPDATE users SET reset_password_token = ?, reset_password_expiry = ? WHERE id = ?',
            [reset_password_token, reset_password_expiry, user.id]
        );
        
        console.log(`Reset token generated for user: ${user.id}`);
        
        // Send password reset email
        const emailResult = await sendPasswordResetEmail(email, reset_password_token, 'user');
        
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
        
        // Find user with this token
        const [users] = await db.execute(
            'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expiry > NOW()',
            [token]
        );

        console.log("Resetting password with token:", token);
        
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }
        
        const user = users[0];
        
        // Hash new password
        const password_hash = await bcrypt.hash(password, 10);
        
        // Update password and clear token
        await db.execute(
            'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expiry = NULL WHERE id = ?',
            [password_hash, user.id]
        );
        
        console.log(`Password reset successfully for user: ${user.id}`);
        res.status(200).json({ message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Failed to reset password', error: err.message });
    }
}

module.exports = { 
    signup, 
    login, 
    google,
    verifytoken,
    addPhoneNumber,
    sendPhoneVerificationOTP,
    verifyPhoneOTP,
    forgotPassword,
    resetPassword
};