const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * Authentication middleware for protecting routes
 * Verifies JWT token and adds user info to request object
 */
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Authentication required',
                success: false 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired',
                success: false 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token',
                success: false 
            });
        } else {
            return res.status(401).json({ 
                message: 'Authentication failed',
                success: false 
            });
        }
    }
};

module.exports = authMiddleware;
