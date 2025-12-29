Customer Portal

In this portal we are creating the customer cab booking panel. Where customers can place their order based on the requirements. 

There are 2 Major service categories one of which has further sub-categories in it. Please refer to the Image attached. 



Service category 1 is Outstation ride for booking inter-city oneway or round trip cab. Further these sub-categories are divided into 2 different micro categories - same day trip and multiple day trip.

🔷 Major Service Categories
1️⃣ Outstation Ride
Purpose:
 Inter-city cab bookings for travel between cities.

📂 Outstation Ride – Sub-Categories
A. One-Way Trip
Travel from City A → City B (no return).
Micro-Categories I
Same-Day Trip
Pickup and drop on the same calendar day
Typically charged on:
Per km basis + Toll, State Tax, Parking Extra (if applicable)
One-way distance only
Multiple-Day Trip
Journey spans more than one calendar day
Charged on:
Daily minimum km (e.g., 250 km/day) + Toll, State Tax, Parking Extra (if applicable) and Driver night charges 200 if he drives post 9 PM 

B. Round Trip
Travel from City A → City B → City A.
Micro-Categories II
Same-Day Round Trip
Start and return on the same day
Charged on:
Round-trip distance + Toll, State Tax, Parking Extra (if applicable) and Driver night charges 200 if he drives post 9 PM 
Multiple-Day Round Trip
Travel spread across multiple days
Charged on:
Daily minimum km × number of days
Total actual km (whichever is higher) + Toll, State Tax, Parking Extra (if applicable) and Driver night charges 200 if he drives post 9 PM  
Service category 2 is hourly car rental which will have time and km boundation and if exceeded then extra charges will be applicable 300 for every half n hour and x rupees for every extra km.

SERVICE CATEGORY 2 — HOURLY CAR RENTAL
Purpose:
 Local city travel within predefined time + distance limits. Extra usage is charged separately.

Rental Package Structure
Each rental package is defined as:
Attribute
Example
Package_Hours
2 / 4 / 6 / 8 / 12
Package_KM
20 / 40 / 60 / 80 / 120
Base_Price
₹XXXX
Extra_Time_Rate
₹300 per 30 minutes
Extra_KM_Rate
₹X per km

Note: Registration on the portal will be mandatory before you can check the fair of different categories of cabs. 



Customer Booking Page 


All the above categories will be applicable for the 4 major cab segments.
Which includes Hatchback, Sedan, SUV and Premium SUV the rates for these will be decided individually based on their segment. 
For example each travel category will have further 4 different segments tabs and the Admin will set their per KM charges accordingly. 

For the customer: They can check the prices for each segment and choose the desired cabs and place their booking. This page will also have a FAQ tab below for the customer's support. 

Final Booking Panel


On the final booking panel the pickup address field will be mandatory for the customer to fill. 
Further there will be add-ons to choose from these add-ons will include 
Assured luggage space i.e carrier for 300
Confirm Car model of within 3 years (or car model not older than 3 years) which will be x% of the entire booking amount. 
Cancellation before 6 hours of departure for X Rs
Pet Allowance for X Rs. 

Note: Just like the Category and Segment rates these rates will also be finalized by the Admin

Apart from this the customer will have a tab where they can check their upcoming bookings and completed bookings. In case of upcoming bookings the details of Car and Driver will only be visible 5 hr before departure. For completed bookings they can write reviews or raise tickets in case of any inconvenience.
The customer will also have a profile tab where they can update the contact details. 

Vendor Portal
In the vendor portal there will be a global booking tab where the vendors can see all the bookings available on the portal and can accept the same. The vendors will be able to sort bookings based on their cities. Upon accepting the booking they will have to select a driver and a vehicle for each trip.
Note: The prices shown on the vendor portal will be Total fair - 10 or 15% as set by the admin. The admin can adjust this commission if required. 
The Vendor can only accept a booking if he has a Lock in balance of 1K in his wallet. If any deductions are made in this amount the vendor will have to recharge the account again to accept further bookings.
In the Trip section they will be able to see their completed and upcoming bookings. For a booking to start they will have to put the OTP given by the customer within the next half an hour from the trip time an auto penalty for late pickup will be escalated by the system. If no OTP is provided within an hour from pickup time the vendor will be fined entire security amount i.e 1000 Rs for abandoning the booking.


In the Drivers and Vehicle section the vendors can add or remove their Drivers and Vehicles. Similarly in the restricted inventory the vehicles with any documents expiring will be moved and will be restricted until the admin re-verifies the particular document of the same.

In the Wallet section the vendor can only top-up the account and if he wants to withdraw the amount in the wallet no matter the fund value, he/she will have to initiate the deactivation of the account which will show a Notice the the amount will be settled in 45 working days.

Admin Portal 
The is the global portal for admin to monitor User and Vendors. Set price, Approve Vehicle and Drivers, Penalty Vendors in case of discrepancies. 



Admin Commission will include the 10% pre deducted commission amount and Cancellation before 6 hours of departure for X Rs Fees (this entire amount will be of admin.)
Total Bookings will be the no. of bookings placed by the customers on the portal including the cancelled, completed, or abandoned. 
Completed booking will be the number of bookings completed and who was the vendor on the same. The admin will also be able to see the customer review on the same panel. 
Note: In case of both the Total and Completed booking the Admin will be able to sort these bookings based on month and vendors (or any one variable). 

The Active vendor will have a List of all the vendors on the portal the admin will have the authority to freeze a vendor account or delete any vendor if required or penalty them based on their misconduct. Further the vehicle and drivers of these vendors will be listed from here itself in their individual profile. The admin will approve these vehicles and drivers after manually verifying the photos of the documents uploaded by the vendors (the vendors will only be able to assign approved drivers and cabs). 

Working of penalty in Active Vendor section will follow = Selection of Penalty Ground which will automatically fetch price from penalty price as mentioned in the below section and the booking ID for vendor to understand which booking had discrepancy.

Instead of Category name it Pricing Panel and in the Pricing panel the Admin will set 3 different types of Prices i.e Service Price, Add On price, Penalty
Service Price segment will open up with first Option to Choose from 2 Major service categories i.e Outstation Ride and Hourly Car Rental
Afterwards the Admin will choose from sub-categories i.e One-Way or Outstation Ride thereafter the admin will select from the micro-categories Same-Day Trip and Multiple-Day Trip for the One-way category and Same-Day Round Trip and Multiple-Day Round Trip then in each of these micro-categories the Admin will select the segment of the cab i.e Hatchback, Sedan, SUV and Premium SUV  and set rates for each segment based on the criteria mentioned in the Customer Portal. 
Add On price segment is for the add on segment which will be offered to the customers on the final booking portal i.e 
Assured luggage space i.e carrier for 300
Confirm Car model of within 3 years (or car model not older than 3 years) which will be x% of the entire booking amount. 
Cancellation before 6 hours of departure for X Rs
Pet Allowance for X Rs. 
All the above mentioned rates will be determined by the Admin
Penalty Price in this price segment where the Admin will set penalty rates for different offences during or after the completion of booking by the vendor. These offense list will be provided in a separate list along with the rates. 
No Revenue Dashboard will be password protected and will only be visible with OTP or Dual Authentication
Total User will be a list of users with all their personal details and in this segment the admin can pause a user account in case of discrepancies or assign a one time applicable for new user. 

