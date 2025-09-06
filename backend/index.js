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
const { moveCompletedBooking } = require("./utils/BookingTransaction");
const userAuthRoutes = require('./routes/Auth/userAuth');
const vendorAuthRoutes = require('./routes/Auth/vendorAuth');
const adminAuthRoutes = require('./routes/Auth/adminAuth');
const driverRoutes = require('./routes/driverRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const cors = require("cors")
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./config/db');
// db();


// Add body parser middleware
app.use(express.json());
app.use(cors());

// Mount auth routes

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
    await transactiontrigger();
    await AdminTrigger();
    await BookingTrigger();
    await makeid();
};
createTables();

app.use('/user/auth', userAuthRoutes);
app.use('/vendor/auth', vendorAuthRoutes);
app.use('/admin/auth', adminAuthRoutes);
app.use('/vendor/driver', driverRoutes);
app.use('/vendor/vehicle', vehicleRoutes);

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.listen(5000, () => {
    console.log('🚀 Server running on port 5000');
});

