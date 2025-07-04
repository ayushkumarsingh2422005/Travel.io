const db = require("../config/db");

const createPaymentTriggers = async () => {
    try {
        // First, drop existing triggers one by one
        await db.query("use cabbook;");
        await db.query("DROP TRIGGER IF EXISTS after_withdrawal_update;");
        await db.query("DROP TRIGGER IF EXISTS after_penalty_insert;");

        // Create trigger for withdrawal
        await db.query(`
            CREATE TRIGGER after_withdrawal_update 
            AFTER UPDATE ON payments 
            FOR EACH ROW 
            BEGIN
                -- Deduct amount only when withdrawal status is updated to 'completed'
                IF NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN
                
                    -- If vendor_id is present, update vendor's wallet balance
                    IF NEW.vendor_id IS NOT NULL THEN
                        UPDATE vendors 
                        SET wallet_balance = wallet_balance - NEW.amount 
                        WHERE id = NEW.vendor_id 
                        AND wallet_balance >= NEW.amount; -- Ensure sufficient balance
                    END IF;

                    -- If partner_id is present, update partner's wallet balance
                    IF NEW.partner_id IS NOT NULL THEN
                        UPDATE partners 
                        SET wallet_balance = wallet_balance - NEW.amount 
                        WHERE id = NEW.partner_id 
                        AND wallet_balance >= NEW.amount; -- Ensure sufficient balance
                    END IF;

                END IF;
            END;
        `);

        // Create trigger for penalties
        await db.query(`
            CREATE TRIGGER after_penalty_insert 
            AFTER INSERT ON payments 
            FOR EACH ROW 
            BEGIN
                -- Deduct immediately when penalty is inserted
                IF NEW.type = 'penalty' THEN
                    UPDATE vendors SET wallet_balance = wallet_balance - NEW.amount WHERE id = NEW.vendor_id;
                END IF;
            END;
        `);

        console.log("✅ Payment Triggers Created Successfully!");
    } catch (error) {
        console.error("❌ Error creating Payment triggers:", error.message);
    }
};

module.exports = createPaymentTriggers;
