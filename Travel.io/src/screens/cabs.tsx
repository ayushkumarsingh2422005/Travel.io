import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const cabData = [
  {
    id: 1,
    type: 'Hatchback',
    models: 'Wagon R, Swift, Alto, Similar',
    price: 2000,
    includedKms: 135,
    extraFare: '10/KMs',
    driverAllowance: 'Included',
    fuelCharges: 'Included',
    tollTax: 'Not Included',
    image: 'https://via.placeholder.com/180x80?text=Hatchback',
  },
  {
    id: 2,
    type: 'Sedan',
    models: 'Dzire, Etios, Tigor, Similar',
    price: 2500,
    includedKms: 135,
    extraFare: '10/KMs',
    driverAllowance: 'Included',
    fuelCharges: 'Included',
    tollTax: 'Not Included',
    image: 'https://via.placeholder.com/180x80?text=Sedan',
  },
  {
    id: 3,
    type: 'SUV',
    models: 'Innova, Ertiga, Marazzo, Similar',
    price: 3500,
    includedKms: 135,
    extraFare: '13/KMs',
    driverAllowance: 'Included',
    fuelCharges: 'Included',
    tollTax: 'Not Included',
    image: 'https://via.placeholder.com/180x80?text=SUV',
  },
  {
    id: 4,
    type: 'Premium SUV',
    models: 'Innova Crysta, Kia Carnes, Scorpio',
    price: 5800,
    includedKms: 135,
    extraFare: '18/KMs',
    driverAllowance: 'Included',
    fuelCharges: 'Included',
    tollTax: 'Not Included',
    image: 'https://via.placeholder.com/180x80?text=Premium+SUV',
  },
];

const faqs = [
  {
    q: 'Is local sightseeing included in outstation trip?',
    a: `For Round trip bookings, all the local sightseeing in mentioned cities is included.\nFor One way Multi-stop trip, all the local sightseeing in mentioned cities is included.\nFor One way trip, with only one pickup and one drop, sightseeing is not included.`
  },
  {
    q: 'How to change pickup date, time and return date?',
    a: 'Please click on Departure / Return date on top of this page.'
  },
  {
    q: 'Are Driver charges / Driver bata included in the price? Do i need to arrange for Driver food and accomodation during the trip?',
    a: 'Yes, all driver charges are included in the price. Driver will take care of his food and accomodation. You need not to arrange that.'
  },
  {
    q: 'What are extra charges if i need to travel in night hours?',
    a: 'There is no extra charges for traveling in night hours. Night charges are included in the price.'
  },
  {
    q: 'Please tell me any extra charge other than the price shown above.',
    a: `• 5% GST is extra.\n• Parking charges, if any, are extra and need to be paid by you as per actuals.\n• Toll tax and State tax may or may not be extra depending on the trip. Please check 'Other Terms' mentioned below price.`
  },
  {
    q: 'How much before departure, i have to book the cab?',
    a: 'Although you can book the cab up to 1 hour prior to departure time but we suggest to book 1 day in advance to avoid last minute rush.'
  },
  {
    q: 'Can I book cab by calling customer support?',
    a: `We are happy to provide you any clarifications required through customer support team but cab booking has to be done either through our website or through our android and iOS mobile app 'CabBazar - Outstation taxi'.`
  },
  {
    q: 'I want to book cab without paying any advance amount. I will pay on boarding the cab.',
    a: 'Sorry, it is not possible. You need to pay a small 15-20% amount in advance to book the cab on CabBazar.'
  },
  {
    q: 'I need a one way cab for travelling to more than one destination. I will drop at last destination and need not to return to Pickup location.',
    a: 'You can book a one way multi-stop cab. Please select One way trip and add all your destination cities in the itinerary.'
  },
  {
    q: 'Can we pickup additional passengers on the way in one way trip?',
    a: `You may book one way multi-stop cab by adding additional stops in itinerary.\nFor One way trip with only one pickup and one drop, Additional pickup or drop will incur additional charges.`
  },
  {
    q: 'Do I need to pay both side Toll tax for one way trip?',
    a: 'For One way trip, you need to pay one side Toll tax only.'
  },
  {
    q: 'Whether the cab will have FASTag?',
    a: 'Yes, all our cabs have FASTag installed by default.'
  },
  {
    q: 'Where to mention the complete pickup address?',
    a: 'You will have the option to mention complete pickup address on next screen.'
  },
  {
    q: 'When will I get car and driver details after booking?',
    a: 'In most cases, car and driver details are shared within minutes after booking. In few rare cases, it may take more time and may be shared up to two hours before departure.'
  },
  {
    q: 'Will advance amount be refunded if I cancel the booking?',
    a: 'It may or may not be refunded. Please refer to our Cancellation and Refund policy for details.'
  },
  {
    q: 'How can i make the advance payment? Which payment gateway should i choose?',
    a: `You can pay with all online payment modes like Netbanking, Debit / Credit card, UPI, Payment Wallet Apps like PhonePe, GooglePay, PayTM etc. To pay with Netbanking, Debit / Credit card, UPI, you can choose any payment gateway (PayTM or RazorPay). To pay with PayTM wallet, choose 'PayTM' payment gateway. To pay with other payment wallet apps like PhonePe, GooglePay etc, choose 'RazorPay' payment gateway.`
  },
  {
    q: 'Can I travel with pets?',
    a: 'Yes, you can. But you will be charged an additional amount of Rs. 840 for small cars (hatchbak, Sedan) and Rs. 1050 for bigger cars (SUV, Innova). Please select \'Pet Allowed\' add-on while booking.'
  },
];

export default function Cabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeData = location.state || {};
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleBook = (cab: typeof cabData[0]) => {
    navigate('/prices', { state: { ...routeData, cabType: cab.type } });
  };

  const handleFaqClick = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Select Your Cab</div>
          <button
            className="bg-white/20 rounded-lg p-2 text-white hover:bg-white/30 transition-colors"
            onClick={() => navigate('/')}
          >
            <div className='flex gap-1 '>

            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
            </div>
          </button>
        </div>
      </header>
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cabData.map((cab) => (
            <div key={cab.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
              <img src={cab.image} alt={cab.type} className="w-44 h-20 object-contain mb-4" />
              <div className="text-xl font-bold mb-1">{cab.type}</div>
              <div className="text-gray-600 mb-2 text-center">{cab.models}</div>
              <div className="text-2xl font-bold text-green-700 mb-2">₹{cab.price}</div>
              <div className="text-sm text-gray-500 mb-2">Included KMs: <span className="font-semibold">{cab.includedKms}</span></div>
              <div className="text-sm text-gray-500 mb-2">Extra fare per KM: <span className="font-semibold">{cab.extraFare}</span></div>
              <div className="text-sm text-gray-500 mb-2">Driver Allowance: <span className="font-semibold">{cab.driverAllowance}</span></div>
              <div className="text-sm text-gray-500 mb-2">Fuel Charges: <span className="font-semibold">{cab.fuelCharges}</span></div>
              <div className="text-sm text-gray-500 mb-4">Toll/State Tax: <span className="font-semibold">{cab.tollTax}</span></div>
              <button
                className="w-full p-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors mt-auto"
                onClick={() => handleBook(cab)}
              >
                Book
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-12 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Frequently Asked Questions (FAQs)</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`transition-all duration-300 border rounded-xl shadow-md overflow-hidden ${isOpen ? 'border-l-8 border-green-600 bg-green-50' : 'border-gray-200 bg-white'}`}
              >
                <button
                  className="w-full flex justify-between items-center px-6 py-5 font-semibold text-lg text-gray-800 focus:outline-none hover:bg-green-100 transition-colors"
                  onClick={() => handleFaqClick(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <svg
                    className={`w-6 h-6 ml-4 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-green-600' : 'rotate-0 text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`transition-all duration-300 px-6 text-gray-700 text-base bg-green-50 ${isOpen ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'} whitespace-pre-line`}
                  style={{ overflow: 'hidden' }}
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-2xl font-bold">MARCO</div>
              <p className="text-gray-400 text-sm mt-1">Your reliable travel partner across India</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Marco Cab Services. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 