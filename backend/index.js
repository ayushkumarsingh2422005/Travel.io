const express = require("express");
const createUsersTable = require('./models/userModel');
const createVendorsTable = require('./models/vendorModel');
const createVehiclesTable = require('./models/vehicleModel');
const createDriversTable = require('./models/driverModel');
const createBookingsTable = require('./models/bookingModel');
const createPrevBookingsTable = require('./models/prevbookingModel');
const createPaymentsTable = require('./models/paymentModel');

const app = express();
const PORT = process.env.PORT || 3000;



const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const { createTrigger } = require("./config/Trigger");



const createTables = async () => {
    await createUsersTable();
    await createVendorsTable();
    await createVehiclesTable();
    await createDriversTable();
    await createBookingsTable();
    await createPrevBookingsTable();
    await createPaymentsTable();
    await createTrigger();
};

createTables();


// for transactions do this 





app.listen(5000, () => {
    console.log('🚀 Server running on port 5000');
});




app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
