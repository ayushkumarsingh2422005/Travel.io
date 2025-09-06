const db = require('../config/db');
const crypto = require('crypto');
const axios = require('axios');

// Helper function to generate a unique ID
const generateUniqueId = () => crypto.randomBytes(32).toString('hex');

// Add a new driver by vendor
const addDriver = async (req, res) => {
    try {
        console.log(req.body);
        const { name, phone, address, dl_number, dl_data } = req.body;
        const vendor_id = req.user.id; // From auth middleware
        
        // Validate required fields
        if (!name || !phone || !address || !dl_number) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: name, phone, address, dl_number are required' 
            });
        }
        
        // Check if driver with this phone or dl_number already exists
        const [existingDrivers] = await db.execute(
            'SELECT * FROM drivers WHERE phone = ? OR dl_number = ?',
            [phone, dl_number]
        );
        
        if (existingDrivers.length > 0) {
            const field = existingDrivers[0].phone === phone ? 'phone' : 'dl_number';
            return res.status(409).json({ 
                success: false, 
                message: `Driver with this ${field} already exists` 
            });
        }
        
        // Generate unique ID for the driver
        const id = generateUniqueId();
        
        // Parse DL data if provided as string
        let dlDataToStore = dl_data;
        if (typeof dl_data === 'object') {
            dlDataToStore = JSON.stringify(dl_data);
        }
        
        // Insert new driver with required fields
        await db.execute(
            `INSERT INTO drivers (id, vendor_id, name, phone, address, dl_number, dl_data, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, vendor_id, name, phone, address, dl_number, dlDataToStore || null, 0]
        );
        
        res.status(201).json({
            success: true,
            message: 'Driver added successfully',
            driver: { 
                id, 
                name, 
                phone, 
                address, 
                dl_number, 
                is_active: 0,
                dl_data: dlDataToStore
            }
        });
    } catch (error) {
        console.error('Error adding driver:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add driver', 
            error: error.message 
        });
    }
};

// Update driver details
const updateDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address, dl_number, is_active, dl_data } = req.body;
        const vendor_id = req.user.id; // From auth middleware
        
        // Check if driver exists and belongs to this vendor
        const [drivers] = await db.execute(
            'SELECT * FROM drivers WHERE id = ? AND vendor_id = ?',
            [id, vendor_id]
        );
        
        if (drivers.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Driver not found or does not belong to this vendor' 
            });
        }
        
        // Build update query dynamically based on provided fields
        let updateFields = [];
        let queryParams = [];
        
        if (name) {
            updateFields.push('name = ?');
            queryParams.push(name);
        }
        
        if (phone) {
            // Check if phone is already used by another driver
            if (phone !== drivers[0].phone) {
                const [existingPhone] = await db.execute(
                    'SELECT * FROM drivers WHERE phone = ? AND id != ?',
                    [phone, id]
                );
                
                if (existingPhone.length > 0) {
                    return res.status(409).json({ 
                        success: false, 
                        message: 'Phone number already in use by another driver' 
                    });
                }
            }
            
            updateFields.push('phone = ?');
            queryParams.push(phone);
        }
        
        if (address) {
            updateFields.push('address = ?');
            queryParams.push(address);
        }
        
        if (dl_number) {
            // Check if dl_number is already used by another driver
            if (dl_number !== drivers[0].dl_number) {
                const [existingLicense] = await db.execute(
                    'SELECT * FROM drivers WHERE dl_number = ? AND id != ?',
                    [dl_number, id]
                );
                
                if (existingLicense.length > 0) {
                    return res.status(409).json({ 
                        success: false, 
                        message: 'DL number already in use by another driver' 
                    });
                }
            }
            
            updateFields.push('dl_number = ?');
            queryParams.push(dl_number);
        }
        
        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            queryParams.push(is_active);
        }
        
        if (dl_data) {
            updateFields.push('dl_data = ?');
            queryParams.push(dl_data);
        }
        
        // If no fields to update
        if (updateFields.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No fields to update provided' 
            });
        }
        
        // Add id as the last parameter
        queryParams.push(id);
        
        // Execute update query
        await db.execute(
            `UPDATE drivers SET ${updateFields.join(', ')} WHERE id = ?`,
            queryParams
        );
        
        // Get updated driver
        const [updatedDriver] = await db.execute(
            'SELECT * FROM drivers WHERE id = ?',
            [id]
        );
        
        res.status(200).json({
            success: true,
            message: 'Driver updated successfully',
            driver: updatedDriver[0]
        });
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update driver', 
            error: error.message 
        });
    }
};

// Delete a driver
const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor_id = req.user.id; // From auth middleware
        
        // Check if driver exists and belongs to this vendor
        const [drivers] = await db.execute(
            'SELECT * FROM drivers WHERE id = ? AND vendor_id = ?',
            [id, vendor_id]
        );
        
        if (drivers.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Driver not found or does not belong to this vendor' 
            });
        }
        
        // Check if driver is assigned to any active bookings
        const [activeBookings] = await db.execute(
            'SELECT * FROM bookings WHERE driver_id = ? AND status IN ("approved", "ongoing", "preongoing")',
            [id]
        );
        
        if (activeBookings.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete driver with active bookings' 
            });
        }
        
        // Delete driver
        await db.execute('DELETE FROM drivers WHERE id = ?', [id]);
        
        res.status(200).json({
            success: true,
            message: 'Driver deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete driver', 
            error: error.message 
        });
    }
};

// Get all drivers for a vendor
const getDrivers = async (req, res) => {
    try {
        const vendor_id = req.user.id; // From auth middleware
        
        // Get all drivers for this vendor
        const [drivers] = await db.execute(
            `SELECT * FROM drivers WHERE vendor_id = ?`,
            [vendor_id]
        );
        
        // Parse DL data JSON strings
        const driversWithParsedData = drivers.map(driver => {
            if (driver.dl_data) {
                try {
                    driver.dl_data = JSON.parse(driver.dl_data);
                } catch (error) {
                    console.error('Error parsing DL data for driver:', driver.id, error);
                    // Keep as string if parsing fails
                }
            }
            return driver;
        });
        
        res.status(200).json({
            success: true,
            count: driversWithParsedData.length,
            drivers: driversWithParsedData
        });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch drivers', 
            error: error.message 
        });
    }
};

// Get a single driver
const getDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor_id = req.user.id; // From auth middleware
        
        // Get driver with vehicle info
        const [drivers] = await db.execute(
            `SELECT * FROM drivers WHERE id = ? AND vendor_id = ?`,
            [id, vendor_id]
        );
        
        if (drivers.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Driver not found or does not belong to this vendor' 
            });
        }
        
        // Parse DL data JSON string
        const driver = drivers[0];
        if (driver.dl_data) {
            try {
                driver.dl_data = JSON.parse(driver.dl_data);
            } catch (error) {
                console.error('Error parsing DL data for driver:', driver.id, error);
                // Keep as string if parsing fails
            }
        }
        
        res.status(200).json({
            success: true,
            driver: driver
        });
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch driver', 
            error: error.message 
        });
    }
};

// Verify driver using DL and DOB via eKYC Hub
const verifyDriverLicense = async (req, res) => {
    try {
        const { dl_number, dob } = req.body;
        const vendorId = req.user.id; // From auth middleware
        
        if (!dl_number || !dob) {
            return res.status(400).json({ 
                success: false, 
                message: 'DL number and date of birth are required' 
            });
        }
        
        // Prepare eKYC Hub API params
        const ekycHubUrl = process.env.EKYC_HUB_URL;
        const ekycHubUser = process.env.EKYC_USER_NAME;
        const ekycHubToken = process.env.EKYC_HUB_API;
        
        if (!ekycHubUrl || !ekycHubUser || !ekycHubToken) {
            return res.status(500).json({
                success: false,
                message: 'eKYC Hub configuration missing'
            });
        }
        
        // Generate unique order ID using vendor ID and timestamp
        const orderId = `${vendorId}_${Date.now()}`;
        
        // Build eKYC Hub API URL
        const dlVerifyUrl = `${ekycHubUrl}/verification/driving?username=${ekycHubUser}&token=${ekycHubToken}&dl_numner=${dl_number}&dob=${dob}&orderid=${orderId}`;
        console.log(dlVerifyUrl);
        console.log('Requesting DL verification from eKYC Hub:', dlVerifyUrl);
        
        // Make GET request to eKYC Hub
        const ekycResponse = await axios.get(dlVerifyUrl);
        
        if (ekycResponse.data.status === "Success") {
            res.status(200).json({
                success: true,
                message: 'Driver license verified successfully',
                data: ekycResponse.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: ekycResponse.data.message || 'Driver license verification failed',
                error: ekycResponse.data
            });
        }
    } catch (error) {
        console.error('Error verifying driver license:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify driver license', 
            error: error.message 
        });
    }
};

module.exports = {
    addDriver,
    updateDriver,
    deleteDriver,
    getDrivers,
    getDriver,
    verifyDriverLicense
}; 