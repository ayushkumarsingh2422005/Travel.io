const db = require('../config/db');
const crypto = require('crypto');
const axios = require('axios');

// Helper function to generate a unique ID
const generateUniqueId = () => crypto.randomBytes(32).toString('hex');

// Add a new vehicle by vendor
const addVehicle = async (req, res) => {
    try {
        console.log(req.body);
        const { model, registration_no, no_of_seats, image } = req.body;
        const vendor_id = req.user.id; // From auth middleware
        
        // Validate required fields
        if (!model || !registration_no || !no_of_seats) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: model, registration_no, no_of_seats are required' 
            });
        }
        
        // Check if vehicle with this registration number already exists
        const [existingVehicles] = await db.execute(
            'SELECT * FROM vehicles WHERE registration_no = ?',
            [registration_no]
        );
        
        if (existingVehicles.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Vehicle with this registration number already exists' 
            });
        }
        
        // Generate unique ID for the vehicle
        const id = generateUniqueId();
        
        // Insert new vehicle with required fields
        await db.execute(
            `INSERT INTO vehicles (id, vendor_id, model, registration_no, no_of_seats, image, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, vendor_id, model, registration_no, no_of_seats, image || null, 0]
        );
        
        res.status(201).json({
            success: true,
            message: 'Vehicle added successfully',
            vehicle: { 
                id, 
                model, 
                registration_no, 
                no_of_seats,
                image: image || null,
                is_active: 0
            }
        });
    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add vehicle', 
            error: error.message 
        });
    }
};

// Update vehicle details
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { model, registration_no, no_of_seats, is_active, image, rc_data } = req.body;
        const vendor_id = req.user.id; // From auth middleware
        
        // Check if vehicle exists and belongs to this vendor
        const [vehicles] = await db.execute(
            'SELECT * FROM vehicles WHERE id = ? AND vendor_id = ?',
            [id, vendor_id]
        );
        
        if (vehicles.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Vehicle not found or does not belong to this vendor' 
            });
        }
        
        // Build update query dynamically based on provided fields
        let updateFields = [];
        let queryParams = [];
        
        if (model) {
            updateFields.push('model = ?');
            queryParams.push(model);
        }
        
        if (registration_no) {
            // Check if registration_no is already used by another vehicle
            if (registration_no !== vehicles[0].registration_no) {
                const [existingRegistration] = await db.execute(
                    'SELECT * FROM vehicles WHERE registration_no = ? AND id != ?',
                    [registration_no, id]
                );
                
                if (existingRegistration.length > 0) {
                    return res.status(409).json({ 
                        success: false, 
                        message: 'Registration number already in use by another vehicle' 
                    });
                }
            }
            
            updateFields.push('registration_no = ?');
            queryParams.push(registration_no);
        }
        
        if (no_of_seats) {
            updateFields.push('no_of_seats = ?');
            queryParams.push(no_of_seats);
        }
        
        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            queryParams.push(is_active);
        }
        
        if (image !== undefined) {
            updateFields.push('image = ?');
            queryParams.push(image);
        }
        
        if (rc_data) {
            // Parse RC data if provided as object
            let rcDataToStore = rc_data;
            if (typeof rc_data === 'object') {
                rcDataToStore = JSON.stringify(rc_data);
            }
            updateFields.push('rc_data = ?');
            queryParams.push(rcDataToStore);
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
            `UPDATE vehicles SET ${updateFields.join(', ')} WHERE id = ?`,
            queryParams
        );
        
        // Get updated vehicle
        const [updatedVehicle] = await db.execute(
            'SELECT * FROM vehicles WHERE id = ?',
            [id]
        );
        
        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            vehicle: updatedVehicle[0]
        });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update vehicle', 
            error: error.message 
        });
    }
};

// Delete a vehicle
const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor_id = req.user.id; // From auth middleware
        
        // Check if vehicle exists and belongs to this vendor
        const [vehicles] = await db.execute(
            'SELECT * FROM vehicles WHERE id = ? AND vendor_id = ?',
            [id, vendor_id]
        );
        
        if (vehicles.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Vehicle not found or does not belong to this vendor' 
            });
        }
        
        // Check if vehicle is assigned to any active bookings
        const [activeBookings] = await db.execute(
            'SELECT * FROM bookings WHERE vehicle_id = ? AND status IN ("approved", "ongoing", "preongoing")',
            [id]
        );
        
        if (activeBookings.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete vehicle with active bookings' 
            });
        }
        
        // Check if vehicle is assigned to any driver
        const [assignedDrivers] = await db.execute(
            'SELECT * FROM drivers WHERE vehicle_id = ?',
            [id]
        );
        
        if (assignedDrivers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete vehicle assigned to a driver. Please unassign the driver first.' 
            });
        }
        
        // Delete vehicle
        await db.execute('DELETE FROM vehicles WHERE id = ?', [id]);
        
        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete vehicle', 
            error: error.message 
        });
    }
};

// Get all vehicles for a vendor
const getVehicles = async (req, res) => {
    try {
        const vendor_id = req.user.id; // From auth middleware
        
        // Get all vehicles for this vendor
        const [vehicles] = await db.execute(
            `SELECT * FROM vehicles WHERE vendor_id = ?`,
            [vendor_id]
        );
        
        // Parse RC data JSON strings
        const vehiclesWithParsedData = vehicles.map(vehicle => {
            if (vehicle.rc_data) {
                try {
                    vehicle.rc_data = JSON.parse(vehicle.rc_data);
                } catch (error) {
                    console.error('Error parsing RC data for vehicle:', vehicle.id, error);
                    // Keep as string if parsing fails
                }
            }
            return vehicle;
        });
        
        res.status(200).json({
            success: true,
            count: vehiclesWithParsedData.length,
            vehicles: vehiclesWithParsedData
        });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch vehicles', 
            error: error.message 
        });
    }
};

// Get a single vehicle
const getVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor_id = req.user.id; // From auth middleware
        
        // Get vehicle
        const [vehicles] = await db.execute(
            `SELECT * FROM vehicles WHERE id = ? AND vendor_id = ?`,
            [id, vendor_id]
        );
        
        if (vehicles.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Vehicle not found or does not belong to this vendor' 
            });
        }
        
        // Parse RC data JSON string
        const vehicle = vehicles[0];
        if (vehicle.rc_data) {
            try {
                vehicle.rc_data = JSON.parse(vehicle.rc_data);
            } catch (error) {
                console.error('Error parsing RC data for vehicle:', vehicle.id, error);
                // Keep as string if parsing fails
            }
        }
        
        res.status(200).json({
            success: true,
            vehicle: vehicle
        });
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch vehicle', 
            error: error.message 
        });
    }
};

// Verify vehicle using registration number via eKYC Hub
const verifyVehicleRC = async (req, res) => {
    try {
        const { vehicle_number } = req.body;
        const vendorId = req.user.id; // From auth middleware

        
        if (!vehicle_number) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vehicle number is required' 
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
        const rcVerifyUrl = `${ekycHubUrl}/verification/vehicle_rc?username=${ekycHubUser}&token=${ekycHubToken}&vehicle_number=${vehicle_number}&orderid=${orderId}`;
        // console.log('Requesting RC verification from eKYC Hub:', rcVerifyUrl);
        
        // Make GET request to eKYC Hub
        const ekycResponse = await axios.get(rcVerifyUrl);
        
        if (ekycResponse.data.status === "Success") {
            res.status(200).json({
                success: true,
                message: 'Vehicle RC verified successfully',
                data: ekycResponse.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: ekycResponse.data.message || 'Vehicle RC verification failed',
                error: ekycResponse.data
            });
        }
    } catch (error) {
        console.error('Error verifying vehicle RC:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify vehicle RC', 
            error: error.message 
        });
    }
};

// Create vehicle with RC data storage
const createVehicleWithRC = async (req, res) => {
    try {
        const { model, registration_no, no_of_seats, image, rc_data } = req.body;
        const vendor_id = req.user.id; // From auth middleware

        // console.log(req.body);
        // Validate required fields
        if (!model || !registration_no || !no_of_seats) {
            return res.status(400).json({
                success: false, 
                message: 'Missing required fields: model, registration_no, no_of_seats are required' 
            });
        }
        
        // Check if vehicle with this registration number already exists
        const [existingVehicles] = await db.execute(
            'SELECT * FROM vehicles WHERE registration_no = ?',
            [registration_no]
        );
        
        if (existingVehicles.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Vehicle with this registration number already exists' 
            });
        }
        
        // Generate unique ID for the vehicle
        const id = generateUniqueId();
        
        // Parse RC data if provided as object and store as JSON string
        let rcDataToStore = null;
        if (rc_data) {
            console.log('RC Data received:', typeof rc_data, rc_data ? 'Present' : 'Null');
            if (typeof rc_data === 'object') {
                rcDataToStore = JSON.stringify(rc_data);
                console.log('RC Data JSON string length:', rcDataToStore.length);
            } else {
                rcDataToStore = rc_data; // Already a string
                console.log('RC Data string length:', rcDataToStore.length);
            }
        } else {
            console.log('No RC data provided');
        }
        
        // Insert new vehicle with RC data stored as JSON string
        // rcDataToStore = JSON.stringify(rcDataToStore);
        // console.log("--------------------------------", rcDataToStore);
        await db.execute(
            `INSERT INTO vehicles (id, vendor_id, model, registration_no, no_of_seats, image, rc_data, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, vendor_id, model, registration_no, no_of_seats, image || null, rcDataToStore, 0]
        );
        
        // Verify what was stored in database
        const [insertedVehicle] = await db.execute(
            'SELECT id, rc_data FROM vehicles WHERE id = ?',
            [id]
        );
        
        console.log('Vehicle inserted with ID:', id);
        console.log('RC data stored in DB:', insertedVehicle[0]?.rc_data ? 'Present' : 'Null');
        console.log('RC data length in DB:', insertedVehicle[0]?.rc_data?.length || 0);
        
        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully with RC data',
            vehicle: { 
                id, 
                model, 
                registration_no, 
                no_of_seats,
                image: image || null,
                is_active: 0,
                rc_data: rcDataToStore
            }
        });
    } catch (error) {
        console.error('Error creating vehicle with RC:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create vehicle', 
            error: error.message 
        });
    }
};

module.exports = {
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicles,
    getVehicle,
    verifyVehicleRC,
    createVehicleWithRC
};
