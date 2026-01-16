const db = require('../config/db');
const crypto = require('crypto');
const axios = require('axios');

// Helper function to generate a unique ID
const generateUniqueId = () => crypto.randomBytes(32).toString('hex');

// Add a new vehicle by vendor
const addVehicle = async (req, res) => {
    try {
        console.log(req.body);
        const { model, registration_no, no_of_seats, image, per_km_charge } = req.body;
        console.log("request recieved successfully")
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
            `INSERT INTO vehicles (id, vendor_id, model, registration_no, no_of_seats, image, per_km_charge, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, vendor_id, model, registration_no, no_of_seats, image || null, per_km_charge || 0.00, 0]
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
                per_km_charge: per_km_charge || 0.00,
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
        const { model, registration_no, no_of_seats, is_active, image, per_km_charge, rc_data } = req.body;
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
                        message: 'Registration number already in use b  y another vehicle'
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

        if (per_km_charge !== undefined) {
            updateFields.push('per_km_charge = ?');
            queryParams.push(per_km_charge);
        }

        if (rc_data) {
            // Extract individual fields from RC data
            if (typeof rc_data === 'object' && rc_data.data) {
                const data = rc_data.data;
                const rcFields = {
                    rc_verification_id: data.verification_id || null,
                    rc_reference_id: data.reference_id || null,
                    rc_status: data.status || null,
                    rc_reg_no: data.reg_no || null,
                    rc_class: data.class || null,
                    rc_chassis: data.chassis || null,
                    rc_engine: data.engine || null,
                    rc_vehicle_manufacturer_name: data.vehicle_manufacturer_name || null,
                    rc_model: data.model || null,
                    rc_vehicle_colour: data.vehicle_colour || null,
                    rc_type: data.type || null,
                    rc_norms_type: data.norms_type || null,
                    rc_body_type: data.body_type || null,
                    rc_owner_count: data.owner_count || null,
                    rc_owner: data.owner || null,
                    rc_owner_father_name: data.owner_father_name || null,
                    rc_mobile_number: data.mobile_number || null,
                    rc_rc_status: data.rc_status || null,
                    rc_status_as_on: data.status_as_on || null,
                    rc_reg_authority: data.reg_authority || null,
                    rc_reg_date: data.reg_date || null,
                    rc_vehicle_manufacturing_month_year: data.vehicle_manufacturing_month_year || null,
                    rc_expiry_date: data.rc_expiry_date || null,
                    rc_vehicle_tax_upto: data.vehicle_tax_upto || null,
                    rc_vehicle_insurance_company_name: data.vehicle_insurance_company_name || null,
                    rc_vehicle_insurance_upto: data.vehicle_insurance_upto || null,
                    rc_vehicle_insurance_policy_number: data.vehicle_insurance_policy_number || null,
                    rc_financer: data.rc_financer || null,
                    rc_present_address: data.present_address || null,
                    rc_permanent_address: data.permanent_address || null,
                    rc_vehicle_cubic_capacity: data.vehicle_cubic_capacity || null,
                    rc_gross_vehicle_weight: data.gross_vehicle_weight || null,
                    rc_unladen_weight: data.unladen_weight || null,
                    rc_vehicle_category: data.vehicle_category || null,
                    rc_standard_cap: data.rc_standard_cap || null,
                    rc_vehicle_cylinders_no: data.vehicle_cylinders_no || null,
                    rc_vehicle_seat_capacity: data.vehicle_seat_capacity || null,
                    rc_vehicle_sleeper_capacity: data.vehicle_sleeper_capacity || null,
                    rc_vehicle_standing_capacity: data.vehicle_standing_capacity || null,
                    rc_wheelbase: data.wheelbase || null,
                    rc_vehicle_number: data.vehicle_number || null,
                    rc_pucc_number: data.pucc_number || null,
                    rc_pucc_upto: data.pucc_upto || null,
                    rc_blacklist_status: data.blacklist_status || null,
                    rc_blacklist_details: data.blacklist_details ? JSON.stringify(data.blacklist_details) : null,
                    rc_challan_details: data.challan_details ? JSON.stringify(data.challan_details) : null,
                    rc_permit_issue_date: data.permit_issue_date || null,
                    rc_permit_number: data.permit_number || null,
                    rc_permit_type: data.permit_type || null,
                    rc_permit_valid_from: data.permit_valid_from || null,
                    rc_permit_valid_upto: data.permit_valid_upto || null,
                    rc_non_use_status: data.non_use_status || null,
                    rc_non_use_from: data.non_use_from || null,
                    rc_non_use_to: data.non_use_to || null,
                    rc_national_permit_number: data.national_permit_number || null,
                    rc_national_permit_upto: data.national_permit_upto || null,
                    rc_national_permit_issued_by: data.national_permit_issued_by || null,
                    rc_is_commercial: data.is_commercial ? 1 : 0,
                    rc_noc_details: data.noc_details ? JSON.stringify(data.noc_details) : null,
                    rc_split_present_address: data.split_present_address ? JSON.stringify(data.split_present_address) : null,
                    rc_split_permanent_address: data.split_permanent_address ? JSON.stringify(data.split_permanent_address) : null
                };

                // Add RC fields to update query
                Object.keys(rcFields).forEach(field => {
                    if (rcFields[field] !== null) {
                        updateFields.push(`${field} = ?`);
                        queryParams.push(rcFields[field]);
                    }
                });
            }
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

        // Parse JSON fields
        const vehiclesWithParsedData = vehicles.map(vehicle => {
            // Parse JSON fields
            const jsonFields = ['rc_blacklist_details', 'rc_challan_details', 'rc_noc_details', 'rc_split_present_address', 'rc_split_permanent_address'];
            jsonFields.forEach(field => {
                if (vehicle[field] && typeof vehicle[field] === 'string' && vehicle[field] !== 'null' && vehicle[field] !== '"[object Object]"') {
                    try {
                        vehicle[field] = JSON.parse(vehicle[field]);
                    } catch (error) {
                        console.error(`Error parsing ${field} for vehicle:`, vehicle.id, error);
                        vehicle[field] = null; // Set to null if parsing fails
                    }
                } else if (vehicle[field] === '"[object Object]"' || vehicle[field] === 'null') {
                    vehicle[field] = null;
                }
            });

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

        // Parse JSON fields
        const vehicle = vehicles[0];

        // Parse JSON fields
        const jsonFields = ['rc_blacklist_details', 'rc_challan_details', 'rc_noc_details', 'rc_split_present_address', 'rc_split_permanent_address'];
        jsonFields.forEach(field => {
            if (vehicle[field] && typeof vehicle[field] === 'string' && vehicle[field] !== 'null' && vehicle[field] !== '"[object Object]"') {
                try {
                    vehicle[field] = JSON.parse(vehicle[field]);
                } catch (error) {
                    console.error(`Error parsing ${field} for vehicle:`, vehicle.id, error);
                    vehicle[field] = null; // Set to null if parsing fails
                }
            } else if (vehicle[field] === '"[object Object]"' || vehicle[field] === 'null') {
                vehicle[field] = null;
            }
        });

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
        console.log('Requesting RC verification from eKYC Hub:', rcVerifyUrl);

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
        let { model, registration_no, no_of_seats, per_km_charge, rc_data, rc_vehicle_category } = req.body;
        const vendor_id = req.user.id; // From auth middleware

        // Handle Image Upload
        let image = req.body.image;
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }
        
        // Parse rc_data if it's a string (from FormData)
        if (typeof rc_data === 'string') {
            try {
                rc_data = JSON.parse(rc_data);
            } catch (e) {
                console.error('Failed to parse rc_data:', e);
                return res.status(400).json({ success: false, message: 'Invalid RC Data format' });
            }
        }

        // Validate required fields
        if (!model || !registration_no || !no_of_seats || !rc_vehicle_category) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: model, registration_no, no_of_seats, and rc_vehicle_category are required'
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

        // Fetch base_per_km_price from cab_categories
        const [categoryResult] = await db.execute(
            'SELECT price_per_km FROM cab_categories WHERE segment = ?',
            [rc_vehicle_category]
        );

        let finalPerKmCharge = per_km_charge;
        if (categoryResult.length > 0) {
            // If per_km_charge is not provided by vendor, use the base price from category
            if (per_km_charge === undefined || per_km_charge === null) {
                finalPerKmCharge = categoryResult[0].price_per_km;
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid cab category provided'
            });
        }

        // Generate unique ID for the vehicle
        const id = generateUniqueId();

        // Extract individual fields from RC data
        let rcFields = {};

        if (rc_data) {
            console.log('RC Data received:', typeof rc_data, rc_data ? 'Present' : 'Null');

            // Extract individual fields from RC data
            if (rc_data.data) {
                const data = rc_data.data;
                rcFields = {
                    // Basic verification info
                    rc_verification_id: data.verification_id || null,
                    rc_reference_id: data.reference_id || null,
                    rc_status: data.status || null,
                    rc_reg_no: data.reg_no || null,

                    // Vehicle classification
                    rc_class: data.class || null,
                    rc_chassis: data.chassis || null,
                    rc_engine: data.engine || null,
                    rc_vehicle_manufacturer_name: data.vehicle_manufacturer_name || null,
                    rc_model: data.model || null,
                    rc_vehicle_colour: data.vehicle_colour || null,
                    rc_type: data.type || null,
                    rc_norms_type: data.norms_type || null,
                    rc_body_type: data.body_type || null,

                    // Owner information
                    rc_owner_count: data.owner_count || null,
                    rc_owner: data.owner || null,
                    rc_owner_father_name: data.owner_father_name || null,
                    rc_mobile_number: data.mobile_number || null,

                    // Registration details
                    rc_rc_status: data.rc_status || null,
                    rc_status_as_on: data.status_as_on || null,
                    rc_reg_authority: data.reg_authority || null,
                    rc_reg_date: data.reg_date || null,
                    rc_vehicle_manufacturing_month_year: data.vehicle_manufacturing_month_year || null,
                    rc_expiry_date: data.rc_expiry_date || null,

                    // Tax and insurance
                    rc_vehicle_tax_upto: data.vehicle_tax_upto || null,
                    rc_vehicle_insurance_company_name: data.vehicle_insurance_company_name || null,
                    rc_vehicle_insurance_upto: data.vehicle_insurance_upto || null,
                    rc_vehicle_insurance_policy_number: data.vehicle_insurance_policy_number || null,
                    rc_financer: data.rc_financer || null,

                    // Address information
                    rc_present_address: data.present_address || null,
                    rc_permanent_address: data.permanent_address || null,

                    // Technical specifications
                    rc_vehicle_cubic_capacity: data.vehicle_cubic_capacity || null,
                    rc_gross_vehicle_weight: data.gross_vehicle_weight || null,
                    rc_unladen_weight: data.unladen_weight || null,
                    rc_vehicle_category: data.vehicle_category || null, // This will be overwritten by rc_vehicle_category from req.body
                    rc_standard_cap: data.rc_standard_cap || null,
                    rc_vehicle_cylinders_no: data.vehicle_cylinders_no || null,
                    rc_vehicle_seat_capacity: data.vehicle_seat_capacity || null,
                    rc_vehicle_sleeper_capacity: data.vehicle_sleeper_capacity || null,
                    rc_vehicle_standing_capacity: data.vehicle_standing_capacity || null,
                    rc_wheelbase: data.wheelbase || null,
                    rc_vehicle_number: data.vehicle_number || null,

                    // PUCC details
                    rc_pucc_number: data.pucc_number || null,
                    rc_pucc_upto: data.pucc_upto || null,

                    // Blacklist and challan
                    rc_blacklist_status: data.blacklist_status || null,
                    rc_blacklist_details: data.blacklist_details ? JSON.stringify(data.blacklist_details) : null,
                    rc_challan_details: data.challan_details ? JSON.stringify(data.challan_details) : null,

                    // Permit details
                    rc_permit_issue_date: data.permit_issue_date || null,
                    rc_permit_number: data.permit_number || null,
                    rc_permit_type: data.permit_type || null,
                    rc_permit_valid_from: data.permit_valid_from || null,
                    rc_permit_valid_upto: data.permit_valid_upto || null,

                    // Non-use status
                    rc_non_use_status: data.non_use_status || null,
                    rc_non_use_from: data.non_use_from || null,
                    rc_non_use_to: data.non_use_to || null,

                    // National permit
                    rc_national_permit_number: data.national_permit_number || null,
                    rc_national_permit_upto: data.national_permit_upto || null,
                    rc_national_permit_issued_by: data.national_permit_issued_by || null,

                    // Commercial status
                    rc_is_commercial: data.is_commercial ? 1 : 0,

                    // Additional details
                    rc_noc_details: data.noc_details ? JSON.stringify(data.noc_details) : null,

                    // Address breakdown (JSON fields)
                    rc_split_present_address: data.split_present_address ? JSON.stringify(data.split_present_address) : null,
                    rc_split_permanent_address: data.split_permanent_address ? JSON.stringify(data.split_permanent_address) : null
                };
            }
        } else {
            console.log('No RC data provided');
        }

        // Insert new vehicle with basic fields and RC fields
        const insertFields = ['id', 'vendor_id', 'model', 'registration_no', 'no_of_seats', 'image', 'per_km_charge', 'is_active', 'rc_vehicle_category'];
        const insertValues = [id, vendor_id, model, registration_no, no_of_seats, image || null, finalPerKmCharge, 0, rc_vehicle_category];
        const placeholders = ['?', '?', '?', '?', '?', '?', '?', '?', '?'];

        // Add RC fields, ensuring rc_vehicle_category is not duplicated if already in req.body
        Object.keys(rcFields).forEach(field => {
            if (field === 'rc_vehicle_category') {
                return; // Skip if already handled by top-level rc_vehicle_category
            }
            if (rcFields[field] !== null) {
                insertFields.push(field);
                insertValues.push(rcFields[field]);
                placeholders.push('?');
            }
        });

        await db.execute(
            `INSERT INTO vehicles (${insertFields.join(', ')}) VALUES (${placeholders.join(', ')})`,
            insertValues
        );

        // Verify what was stored in database
        const [insertedVehicle] = await db.execute(
            'SELECT id, rc_verification_id, rc_reg_no, rc_owner, rc_vehicle_category FROM vehicles WHERE id = ?',
            [id]
        );

        console.log('Vehicle inserted with ID:', id);
        console.log('RC verification ID:', insertedVehicle[0]?.rc_verification_id);
        console.log('RC reg no:', insertedVehicle[0]?.rc_reg_no);
        console.log('RC owner:', insertedVehicle[0]?.rc_owner);
        console.log('RC vehicle category:', insertedVehicle[0]?.rc_vehicle_category);

        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully with RC data',
            vehicle: {
                id,
                model,
                registration_no,
                no_of_seats,
                image: image || null,
                per_km_charge: finalPerKmCharge,
                is_active: 0,
                rc_vehicle_category,
                ...rcFields
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
