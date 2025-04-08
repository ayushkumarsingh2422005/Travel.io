const db = require("../config/db");
const makeid = async() => {
  const triggerQueries = [
    `CREATE TRIGGER before_insert_vendors
  BEFORE INSERT ON vendors
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('vnd_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_prevbookings
  BEFORE INSERT ON prevbookings
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('pvb_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_promocodes
  BEFORE INSERT ON promocodes
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('prc_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_ratings
  BEFORE INSERT ON ratings
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('rtg_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_bookings
  BEFORE INSERT ON bookings
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('bkg_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_payments
  BEFORE INSERT ON payments
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('pmt_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_users
  BEFORE INSERT ON users
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('usr_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_partner_transactions
  BEFORE INSERT ON partner_transactions
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('ptr_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_drivers
  BEFORE INSERT ON drivers
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('drv_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_partners
  BEFORE INSERT ON partners
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('ptn_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_transactions
  BEFORE INSERT ON transactions
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('txn_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_vehicles
  BEFORE INSERT ON vehicles
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('vhc_', UUID()), 256), 1, 64);
  END;`,

    `CREATE TRIGGER before_insert_vendor_bank_details
  BEFORE INSERT ON vendor_bank_details
  FOR EACH ROW
  BEGIN
    SET NEW.id = SUBSTRING(SHA2(CONCAT('vbd_', UUID()), 256), 1, 64);
  END;`,
  ];

  for (let trigger of triggerQueries) {
    // console.log(trigger)
    try {
      await db.query(trigger);
      console.log("Trigger created:", trigger.match(/CREATE TRIGGER (.+) BEFORE INSERT/)[1]);
    } catch (error) {
      console.error("Error creating trigger:", error);
    }
  }

//   // Execute each query in the array
//   triggerQueries.forEach(async (query) => {
//     await db.query(query, (err, results) => {
//       if (err) {
//         console.error("Error executing query:", err);
//       } else {
//         console.log("Query executed successfully:", results);
//       }
//     });
//   });
};

module.exports = makeid;
