const db = require('./db');  

const assignDriverToBooking = async (driverId, bookingId) => {  
    try {  
        await db.beginTransaction(); 

        
        const [updateDriverResult] = await db.execute(  
            `UPDATE drivers  
             SET is_active = true, booking_id = ?  
             WHERE id = ?`,  
            [bookingId, driverId]  
        );  

       
        if (updateDriverResult.affectedRows === 0) {  
            throw new Error('Driver not found or could not be updated.');  
        }  

       
        const [updateBookingResult] = await db.execute(  
            `UPDATE bookings  
             SET status = 'ongoing'  
             WHERE id = ?`,  
            [bookingId]  
        );  

     
        if (updateBookingResult.affectedRows === 0) {  
            throw new Error('Booking not found or could not be updated.');  
        }  

        await db.commit();  
        console.log('✅ Driver assigned and booking status updated successfully.');  
    } catch (error) {  
        await db.rollback();   
        console.error('❌ Transaction failed:', error.message);  
    }  
};  


module.exports={assignDriverToBooking}