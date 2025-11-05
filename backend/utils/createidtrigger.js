const db = require("../config/db");

const triggerDefinitions = [
  {
    name: "before_insert_vendors",
    query: `
      CREATE TRIGGER before_insert_vendors
      BEFORE INSERT ON vendors
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('vnd_', UUID()), 256), 1, 64);
      END;
    `
  },
  // {
  //   name: "before_insert_prevbookings",
  //   query: `
  //     CREATE TRIGGER before_insert_prevbookings
  //     BEFORE INSERT ON prevbookings
  //     FOR EACH ROW
  //     BEGIN
  //       SET NEW.id = SUBSTRING(SHA2(CONCAT('pvb_', UUID()), 256), 1, 64);
  //     END;
  //   `
  // },
  {
    name: "before_insert_promocodes",
    query: `
      CREATE TRIGGER before_insert_promocodes
      BEFORE INSERT ON promocodes
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('prc_', UUID()), 256), 1, 64);
      END;
    `
  },
  {
    name: "before_insert_ratings",
    query: `
      CREATE TRIGGER before_insert_ratings
      BEFORE INSERT ON ratings
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('rtg_', UUID()), 256), 1, 64);
      END;
    `
  },
  // {
  //   name: "before_insert_bookings",
  //   query: `
  //     CREATE TRIGGER before_insert_bookings
  //     BEFORE INSERT ON bookings
  //     FOR EACH ROW
  //     BEGIN
  //       SET NEW.id = SUBSTRING(SHA2(CONCAT('bkg_', UUID()), 256), 1, 64);
  //     END;
  //   `
  // },
  {
    name: "before_insert_payments",
    query: `
      CREATE TRIGGER before_insert_payments
      BEFORE INSERT ON payments
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('pmt_', UUID()), 256), 1, 64);
      END;
    `
  },
  {
    name: "before_insert_users",
    query: `
      CREATE TRIGGER before_insert_users
      BEFORE INSERT ON users
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('usr_', UUID()), 256), 1, 64);
      END;
    `
  },
  {
    name: "before_insert_partner_transactions",
    query: `
      CREATE TRIGGER before_insert_partner_transactions
      BEFORE INSERT ON partner_transactions
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('ptr_', UUID()), 256), 1, 64);
      END;
    `
  },
  {
    name: "before_insert_drivers",
    query: `
      CREATE TRIGGER before_insert_drivers
      BEFORE INSERT ON drivers
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('drv_', UUID()), 256), 1, 64);
      END;
    `
  },
  {
    name: "before_insert_partners",
    query: `
      CREATE TRIGGER before_insert_partners
      BEFORE INSERT ON partners
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('ptn_', UUID()), 256), 1, 64);
      END;
    `
  },
  {
    name: "before_insert_transactions",
    query: `
      CREATE TRIGGER before_insert_transactions
      BEFORE INSERT ON transactions
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('txn_', UUID()), 256), 1, 64);
      END;
    `
  },
  {
    name: "before_insert_vehicles",
    query: `
      CREATE TRIGGER before_insert_vehicles
      BEFORE INSERT ON vehicles
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('vhc_', UUID()), 256), 1, 64);
      END;
    `
  },
  {
    name: "before_insert_vendor_bank_details",
    query: `
      CREATE TRIGGER before_insert_vendor_bank_details
      BEFORE INSERT ON vendor_bank_details
      FOR EACH ROW
      BEGIN
        SET NEW.id = SUBSTRING(SHA2(CONCAT('vbd_', UUID()), 256), 1, 64);
      END;
    `
  }
];

const makeid = async () => {
  for (let def of triggerDefinitions) {
    try {
      // Drop the trigger if it exists
      await db.query(`DROP TRIGGER IF EXISTS ${def.name};`);
      // Create the trigger
      await db.query(def.query);
      console.log(`Trigger created: ${def.name}`);
    } catch (error) {
      console.error(`Error creating trigger ${def.name}:`, error);
    }
  }
};

module.exports = makeid;
