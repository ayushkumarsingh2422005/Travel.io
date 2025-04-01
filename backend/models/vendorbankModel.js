const db=require('../config/db');

  createVendorBankTable=async()=> {
    try {
        console.log("Checking if vendor_bank_details table exists...");

        await db.query(`
            CREATE TABLE IF NOT EXISTS vendor_bank_details (
                id INT PRIMARY KEY AUTO_INCREMENT,
                vendor_id INT NOT NULL,
                bank_name VARCHAR(255) NOT NULL,
                ifsc_code VARCHAR(20) NOT NULL,
                account_number VARCHAR(50) NOT NULL UNIQUE,
                account_holder_name VARCHAR(255) NOT NULL,
                deputy_name VARCHAR(255),
                branch VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
            )
        `);

        console.log("vendor_bank_details table is ready.");
    } catch (error) {
        console.error("Error creating vendor_bank_details table:", error);
    }
}

module.exports=createVendorBankTable;