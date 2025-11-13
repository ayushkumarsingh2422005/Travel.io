const db = require("../config/db");

const createTransactionTrigger = async () => {
    try {
        // First, drop the existing trigger
        await db.query("DROP TRIGGER IF EXISTS after_transaction_insert;");

        // Now, create the new trigger (without DELIMITER)
        const triggerQuery = `
            CREATE TRIGGER after_transaction_insert
            AFTER INSERT ON transactions
            FOR EACH ROW
            BEGIN
                -- Update vendor's balance
                UPDATE vendors 
                SET amount = amount + NEW.amount,
                    total_earnings = total_earnings + NEW.amount
                WHERE id = NEW.vendor_id;

                -- Update user's total amount spent
                UPDATE users 
                SET amount_spent = amount_spent + NEW.amount
                WHERE id = NEW.customer_id;

                -- Update booking status to 'completed'
                UPDATE bookings 
                SET status = 'completed' 
                WHERE id = NEW.booking_id;

                -- Set driver as inactive
                UPDATE drivers d
                SET d.is_active = FALSE
                WHERE d.id = (SELECT b.driver_id FROM bookings b WHERE b.id = NEW.booking_id);

                -- If partner_id is not null, update the partner's wallet balance
                IF NEW.partner_id IS NOT NULL THEN
                    UPDATE partners 
                    SET wallet_balance = wallet_balance + (NEW.amount * 0.05),
                        total_earnings = total_earnings + (NEW.amount * 0.05)
                    WHERE id = NEW.partner_id;

                    -- Log the commission transaction for the partnerf
                    INSERT INTO partner_transactions (partner_id, booking_id, commission_amount, status)
                    VALUES (NEW.partner_id, NEW.booking_id, (NEW.amount * 0.05), 'completed');
                END IF;
            END;
        `;

        await db.query(triggerQuery);
        console.log("✅ MySQL Trigger 'after_transaction_insert' Created Successfully!");
    } catch (error) {
        console.error("❌ Error creating MySQL trigger:", error.message);
    }
};

module.exports = createTransactionTrigger;
