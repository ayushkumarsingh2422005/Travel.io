const db=require('../config/db')

// trigger for moving from booking to prevbooking
// no pre payment on booking is allowed
async function createBookingTrigger() {
    try {
        const [rows] = await db.query("DROP TRIGGER IF EXISTS move_completed_booking;");
        if (rows.length === 0) {
            console.log("Creating trigger: move_completed_booking");

            const triggerSQL = `
CREATE TRIGGER move_completed_booking  
AFTER UPDATE ON bookings  
FOR EACH ROW  
BEGIN  
    IF NEW.status IN ('completed', 'cancelled') AND (OLD.status IS NULL OR OLD.status NOT IN ('completed', 'cancelled')) THEN  
        INSERT INTO prevbookings (  
            id, customer_id, driver_id, vehicle_id, vendor_id, partner_id,
            pickup_location, dropoff_location,
            pickup_date, drop_date, price, path, distance, status  
        )  
        VALUES (  
            NEW.id, NEW.customer_id, NEW.driver_id, NEW.vehicle_id, NEW.vendor_id, NEW.partner_id,
            NEW.pickup_location, NEW.dropoff_location,  
            NEW.pickup_date, NEW.drop_date, NEW.price, NEW.path, NEW.distance, NEW.status  
        );  
        -- Do not delete from bookings here  
    END IF;  
END 
            `;

            await db.query(triggerSQL);
            console.log("Trigger created successfully.");
        } else {
            console.log("Trigger already exists.");
        }
    } catch (error) {
        console.error("Error setting up trigger:", error);
    }
}

module.exports=createBookingTrigger;