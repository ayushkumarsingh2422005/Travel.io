import { Link } from 'react-router-dom';

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Cancellation and Refund Policy</div>
          <Link to="/" className="bg-white/20 rounded-lg p-2 text-white hover:bg-white/30 transition-colors flex gap-1 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl bg-white shadow-lg rounded-lg my-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Cancellation and Refund Policy</h1>
        <p className="text-gray-600 text-sm mb-6">Last Updated: August 13, 2025</p>

        <p className="mb-4 text-gray-700">
          This Cancellation and Refund Policy (“Policy”) is issued by Marco Cabs, operated by
          Eightbit Solutions Private Limited (“Company”, “We”, “Us”, “Our”), a company
          incorporated under the Companies Act, 2013, having its registered office at 403-C Bank
          Road, Purdilpur, Gorakhpur, Uttar Pradesh – 273001, India.
        </p>
        <p className="mb-6 text-gray-700">
          By booking a ride with us, you (“Customer”, “You”, “Your”) agree to be bound by this Policy,
          which is an integral part of our Terms of Use. Please read it carefully before making a
          booking.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Cancellation Policy</h2>
        <h3 className="text-xl font-medium text-gray-700 mb-2">1.1 How to Cancel</h3>
        <p className="mb-4 text-gray-700">
          Cancellations may only be made by calling our 24x7 Customer Care Helpline at
          +91-XXXXXXXXXX. Cancellations requested through any other means (e.g., SMS, email, or
          messaging apps) will not be considered valid.
        </p>

        <h3 className="text-xl font-medium text-gray-700 mb-2">1.2 Cancellation Before Driver Details Are Shared</h3>
        <p className="mb-4 text-gray-700">
          If you cancel your booking before driver and/or vehicle details are communicated to you, no
          cancellation fee will be charged, and any advance amount paid will be refunded in
          accordance with Section 2 of this Policy.
        </p>

        <h3 className="text-xl font-medium text-gray-700 mb-2">1.3 Cancellation After Driver Details Are Shared</h3>
        <p className="mb-2 text-gray-700">
          Once the driver and/or vehicle details have been communicated to you (via SMS, WhatsApp,
          email, or any other official communication channel), no cancellations will be accepted.
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>In such cases, the entire advance amount paid will be forfeited as a cancellation fee.</li>
          <li>This condition is strictly enforced to ensure driver allocation efficiency and operational fairness.</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-700 mb-2">1.4 Driver-Initiated Cancellations</h3>
        <p className="mb-2 text-gray-700">Drivers may cancel your booking if:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>They have waited at the pickup location for 45 minutes or more from the scheduled pickup time.</li>
          <li>Incorrect or misleading pickup details are provided.</li>
          <li>You are unreachable on the phone number or email provided at the time of booking.</li>
        </ul>
        <p className="mb-2 text-gray-700">In such cases, the Company may, at its sole discretion:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Forfeit the complete advance amount paid by you, or</li>
          <li>Charge waiting fees: ₹3.50/minute (Hatchback/Sedan), ₹4.00/minute (SUV/Innova), ₹10.00/minute (Tempo Traveller) after the first 45 minutes.</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-700 mb-2">1.5 Force Majeure Cancellations</h3>
        <p className="mb-2 text-gray-700">If a booking is canceled due to events beyond human control, including but not limited to:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Natural disasters (floods, earthquakes, cyclones, storms)</li>
          <li>Acts of God (fire, lightning)</li>
          <li>War, riots, civil disturbances, terrorist acts</li>
          <li>Government restrictions or road closures</li>
          <li>Epidemics or pandemics</li>
        </ul>
        <p className="mb-6 text-gray-700">You will be issued a voucher of equivalent value to the advance paid, valid indefinitely for future bookings.</p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Refund Policy</h2>
        <h3 className="text-xl font-medium text-gray-700 mb-2">2.1 Processing Time</h3>
        <p className="mb-4 text-gray-700">
          Refunds will be processed within 7–10 business days from the date of cancellation
          confirmation. Processing time depends on your payment method and bank policies. The
          Company shall not be responsible for delays caused by third-party payment processors or
          incorrect account details provided by you.
        </p>

        <h3 className="text-xl font-medium text-gray-700 mb-2">2.2 Non-Refundable Circumstances</h3>
        <p className="mb-2 text-gray-700">No refund or voucher will be provided if:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>You cancel after receiving driver/vehicle details.</li>
          <li>You fail to show up at the pickup location within the driver’s waiting time limit.</li>
          <li>You engage in misconduct, abuse, or inappropriate behavior toward the driver or company staff.</li>
          <li>You make direct payments to the driver outside the invoiced amount.</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-700 mb-2">2.3 Refund or Voucher Eligibility</h3>
        <p className="mb-2 text-gray-700">You may receive either a refund or a voucher of equivalent value (at the Company’s sole discretion) if:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>The allocated driver cancels without a valid reason, and no replacement driver can be arranged in reasonable time.</li>
          <li>The allocated vehicle suffers a breakdown during the trip and cannot be repaired or replaced in a reasonable time.</li>
          <li>Cancellation occurs due to force majeure events (Section 1.5).</li>
          <li>You request a change in vehicle type, trip duration, or itinerary in advance, and such change is confirmed by the Company.</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-700 mb-2">2.4 Voucher Terms</h3>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Vouchers issued have no expiry date unless otherwise stated.</li>
          <li>Vouchers are non-transferable and can only be used by the original booking customer.</li>
          <li>Vouchers cannot be exchanged for cash.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Limitation of Liability</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>The Company shall not be responsible for any loss, theft, damage, or injury arising during the trip, as drivers operate as independent contractors.</li>
          <li>We will, however, provide reasonable assistance to help you recover any verifiable loss.</li>
          <li>The Company’s liability is strictly limited to the refund or voucher amount as per this Policy.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Governing Law and Jurisdiction</h2>
        <p className="mb-6 text-gray-700">
          This Policy shall be governed by and construed in accordance with the laws of India. All
          disputes shall be subject to the exclusive jurisdiction of the courts in Gorakhpur, Uttar
          Pradesh.
        </p>

        <div className="border-t border-gray-200 pt-6 mt-6 text-gray-700">
          <p className="font-semibold">Marco Cabs – Eightbit Solutions Private Limited</p>
          <p>403-C Bank Road, Purdilpur, Gorakhpur, Uttar Pradesh – 273001</p>
          <p>Customer Care: +91-XXXXXXXXXX | Email: support@marcocabs.com</p>
        </div>
      </main>

      {/* <footer className="bg-gray-900 text-white py-8">
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
      </footer> */}
    </div>
  );
};

export default CancellationPolicy;
