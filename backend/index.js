const express = require("express");
const createUsersTable = require('./models/userModel');
const createVendorsTable = require('./models/vendorModel');
const createVehiclesTable = require('./models/vehicleModel');
const createDriversTable = require('./models/driverModel');
const createBookingsTable = require('./models/bookingModel');
const createPrevBookingsTable = require('./models/prevbookingModel');
const createPaymentsTable = require('./models/paymentModel');
const createVendorBankTable = require('./models/vendorbankModel');
const createPartnerTables = require('./models/partnerModel');
const createPromocodeTable = require('./models/promocodeModel');
const ratingModel = require('./models/ratingModel');
const transactionModel = require('./models/transactionModel');
const AdminTrigger = require('./utils/admintrigger');
const BookingTrigger = require('./utils/BookingTrigger');
const transactiontrigger = require('./utils/transactionTrigger');
const createvendorbanktale = require('./models/vendorbankModel');
const createCabCategoriesTable = require('./models/cabCategoryModel');
// const createAddOnTable = require('./models/addOnModel');
// const createPenaltyTable = require('./models/penaltyModel');
const makeid = require('./utils/createidtrigger')
const { moveCompletedBooking } = require("./utils/BookingTransaction");
const addResetFieldsToUsers = require('./migrate_users_add_reset_fields');
const addPerKmChargeToVehicles = require('./migrate_vehicles_add_per_km_charge');
const addRcFieldsToVehicles = require('./migrate_vehicles_add_rc_fields');
const addIsActiveToVendors = require('./migrate_vendors_add_is_active');
const addBookingIdToPayments = require('./migrate_payments_add_booking_id');
const addDescriptionToPayments = require('./migrate_payments_add_description');
const addImageToDrivers = require('./migrate_drivers_add_image');
const updateDriversSchema = require('./migrate_drivers_schema_update');
const updateVehiclesSchema = require('./migrate_vehicles_schema_update');
const userAuthRoutes = require('./routes/Auth/userAuth');
const vendorAuthRoutes = require('./routes/Auth/vendorAuth');
const adminAuthRoutes = require('./routes/Auth/adminAuth');
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cors = require("cors")
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./config/db');
// db();


// Add body parser middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Mount auth routes

const createTables = async () => {
  await createUsersTable();
  await addResetFieldsToUsers(); // Add reset password fields to existing users table
  await createvendorbanktale();
  await createVendorsTable();
  await createVendorBankTable();
  await addIsActiveToVendors(); // Add is_active and penalty fields to vendors table
  await createVehiclesTable();
  await addPerKmChargeToVehicles(); // Add per_km_charge field to existing vehicles table
  await addRcFieldsToVehicles(); // Add RC fields to existing vehicles table
  await createDriversTable();
  await addImageToDrivers();
  await updateDriversSchema();
  await updateVehiclesSchema();
  await createPartnerTables();
  await createBookingsTable();
  await createPrevBookingsTable();
  await createPaymentsTable();
  await addBookingIdToPayments();
  await addDescriptionToPayments();
  await createVendorBankTable();
  await createPromocodeTable();
  await ratingModel();
  await transactionModel();
  await transactiontrigger();
  await AdminTrigger();
  await BookingTrigger();
  await makeid();
  await createCabCategoriesTable();
};
createTables();

app.use('/user/auth', userAuthRoutes);
app.use('/vendor/auth', vendorAuthRoutes);
app.use('/admin/auth', adminAuthRoutes);
app.use('/user', userRoutes);
app.use('/vendor', vendorRoutes);
app.use('/partner', partnerRoutes);
app.use('/admin', adminRoutes);
app.use('/vendor/driver', driverRoutes);
app.use('/vendor/vehicle', vehicleRoutes);
app.use('/booking', bookingRoutes);
app.use('/payment', paymentRoutes);

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.listen(5000, () => {
  console.log('🚀 Server running on port 5000');
});

