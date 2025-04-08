const express = require("express");
const createUsersTable = require('./models/userModel');
const createVendorsTable = require('./models/vendorModel');
const createVehiclesTable = require('./models/vehicleModel');
const createDriversTable = require('./models/driverModel');
const createBookingsTable = require('./models/bookingModel');
const createPrevBookingsTable = require('./models/prevbookingModel');
const createPaymentsTable = require('./models/paymentModel');
const createVendorBankTable=require('./models/vendorbankModel');
const createPartnerTables=require('./models/partnerModel');
const createPromocodeTable = require('./models/promocodeModel');
const ratingModel=require('./models/ratingModel');
const transactionModel=require('./models/transactionModel');
const AdminTrigger=require('./utils/admintrigger');
const BookingTrigger=require('./utils/BookingTrigger');
const transactiontrigger=require('./utils/transactionTrigger');
const createvendorbanktale=require('./models/vendorbankModel')
const makeid=require('./utils/createidtrigger')

const app = express();
const PORT = process.env.PORT || 3000;



const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const { moveCompletedBooking } = require("./utils/BookingTransaction");



const createTables = async () => {
    await createUsersTable();
    await createVendorsTable();
    await createVendorBankTable();
    await createVehiclesTable();
    await createDriversTable();
    await createPartnerTables();
    await createBookingsTable();
    await createPrevBookingsTable();
    await createPaymentsTable();
    await createVendorBankTable();
    await createPromocodeTable();
    await ratingModel();
    await transactionModel();
    await AdminTrigger();
    await transactiontrigger();
    await BookingTrigger();
    await makeid();
};

createTables();


// for transactions do this 
// moveCompletedBooking(7);



app.listen(5000, () => {
    console.log('🚀 Server running on port 5000');
});




app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
