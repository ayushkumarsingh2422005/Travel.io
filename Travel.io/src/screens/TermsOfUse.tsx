import { Link } from 'react-router-dom';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Terms of Use</div>
          <Link to="/" className="bg-white/20 rounded-lg p-2 text-white hover:bg-white/30 transition-colors flex gap-1 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl bg-white shadow-lg rounded-lg my-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">TERMS OF USE</h1>
        <p className="text-gray-600 text-sm mb-6">Last Updated: 13 August 2025</p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. CONTRACTUAL RELATIONSHIP</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">1.1</span> These Terms of Use (“Terms”) govern the access or use by you (“User”/“You”) of
          applications, websites, content, products, and services (the “Services”) provided by Marco
          Cabs, operated by Eightbit Solutions Private Limited, having its registered office at 403-C
          Bank Road, Purdilpur, Gorakhpur, Uttar Pradesh – 273001, India (“Company”, “we”, “our”, or
          “us”).
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">1.2</span> By accessing or using our Services, you acknowledge that you have read, understood,
          and agreed to be bound by these Terms, which establish a contractual relationship between
          you and Marco Cabs.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">1.3</span> If you do not agree to these Terms, you must not access or use the Services.
        </p>
        <p className="mb-6 text-gray-700">
          <span className="font-medium">1.4</span> The Company reserves the right to modify these Terms at any time. Modifications will be
          effective upon posting on our website or app, and your continued use constitutes
          acceptance.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. DEFINITIONS</h2>
        <p className="mb-2 text-gray-700">For the purposes of these Terms:</p>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>“Driver” means any licensed individual engaged through the platform to provide transport services.</li>
          <li>“Booking” means a confirmed reservation for a cab service through Marco Cabs.</li>
          <li>“Fare” means the total amount payable, including base fare, waiting charges, tolls, parking, and applicable taxes.</li>
          <li>“Force Majeure” means events beyond reasonable control, including natural disasters, strikes, political unrest, accidents, and technical failures.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. SCOPE OF SERVICES</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">3.1</span> Marco Cabs is a technology platform that connects passengers with independent drivers
          or transport operators.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">3.2</span> The Company does not own vehicles or employ drivers unless explicitly stated.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">3.3</span> Services are intended for personal and lawful transportation purposes only.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">3.4</span> The Company reserves the right to:
        </p>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Refuse any booking without assigning reasons;</li>
          <li>Cancel services in the event of safety or legal concerns;</li>
          <li>Limit the number of passengers per vehicle as per vehicle capacity and legal norms.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. USER ELIGIBILITY & RESPONSIBILITIES</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">4.1</span> You must be at least 18 years old to make a booking.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">4.2</span> Minors must be accompanied by an adult at all times.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">4.3</span> You agree to:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Provide accurate booking details;</li>
          <li>Be ready at the pickup location on time;</li>
          <li>Not engage in any unlawful or unsafe conduct;</li>
          <li>Not cause damage to the vehicle.</li>
        </ul>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">4.4</span> Prohibited activities inside the cab:
        </p>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Smoking, alcohol consumption, or drug use;</li>
          <li>Transporting illegal or dangerous goods;</li>
          <li>Harassment or abuse of the driver.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. LUGGAGE POLICY</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">5.1</span> Users may carry luggage within the legal and safety limits of the vehicle.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">5.2</span> Prohibited items include flammable goods, explosives, firearms, and contraband
          substances.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">5.3</span> Oversized or excess luggage may attract extra charges or refusal of service.
        </p>
        <p className="mb-6 text-gray-700">
          <span className="font-medium">5.4</span> The Company is not responsible for loss or damage to personal belongings left in the
          vehicle.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. BOOKING PROCESS</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">6.1</span> Bookings can be made through the Marco Cabs website, mobile app, or customer
          service helpline.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">6.2</span> Fare estimates are provided at the time of booking and may vary due to:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Traffic conditions;</li>
          <li>Route changes;</li>
          <li>Waiting time;</li>
          <li>Additional stops requested by the passenger.</li>
        </ul>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">6.3</span> All bookings are subject to driver and vehicle availability.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. CANCELLATION & NO-SHOW POLICY</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">7.1</span> Cancellations Before Driver Allocation
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>You may cancel without penalty before driver details are assigned.</li>
        </ul>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">7.2</span> Cancellation After Driver Details Are Shared
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Once driver details are shared with you, cancellation will not be accepted. The full fare will be charged.</li>
        </ul>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">7.3</span> No-Show
        </p>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>If you fail to board within 30 minutes of the scheduled pickup without informing customer support, the trip will be marked as a no-show, and the full fare will be charged.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. PAYMENTS & CHARGES</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">8.1</span> The fare includes:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Base fare;</li>
          <li>Tolls, parking, and state taxes (if applicable);</li>
          <li>Waiting charges: [Specify per-minute or per-hour rate];</li>
          <li>Night charges: applicable between [xx:xx PM] and [xx:xx AM].</li>
        </ul>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">8.2</span> Payment can be made via cash, UPI, credit/debit cards, or other approved methods.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">8.3</span> Additional charges apply for:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Hill area driving;</li>
          <li>Detours or route changes;</li>
          <li>Extra pickup/drop points.</li>
        </ul>
        <p className="mb-6 text-gray-700">
          <span className="font-medium">8.4</span> No refunds will be issued for completed trips except in cases of proven overcharge or
          duplicate payment.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. DRIVER & VEHICLE STANDARDS</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">9.1</span> All drivers are required to:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Hold a valid commercial driving license;</li>
          <li>Comply with the Motor Vehicles Act, 1988;</li>
          <li>Maintain professional conduct.</li>
        </ul>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">9.2</span> Vehicles must:
        </p>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Be clean, roadworthy, and legally compliant;</li>
          <li>Have valid insurance, permits, and fitness certificates.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. DELAYS & FORCE MAJEURE</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">10.1</span> Marco Cabs is not responsible for delays caused by:
        </p>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Traffic congestion;</li>
          <li>Road closures;</li>
          <li>Weather conditions;</li>
          <li>Accidents;</li>
          <li>Force Majeure events.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. LIABILITY & INDEMNITY</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">11.1</span> The Company acts only as an intermediary between you and the driver.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">11.2</span> To the fullest extent permitted by law, the Company shall not be liable for:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Personal injury;</li>
          <li>Loss or theft of property;</li>
          <li>Service delays or failures due to circumstances beyond our control.</li>
        </ul>
        <p className="mb-6 text-gray-700">
          <span className="font-medium">11.3</span> You agree to indemnify and hold harmless Marco Cabs and its affiliates from any
          claims, damages, or expenses arising from:
        </p>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Your breach of these Terms;</li>
          <li>Your unlawful or negligent acts during the service.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. DISPUTE RESOLUTION & GOVERNING LAW</h2>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">12.1</span> These Terms are governed by the laws of India.
        </p>
        <p className="mb-2 text-gray-700">
          <span className="font-medium">12.2</span> Any disputes shall be subject to the exclusive jurisdiction of the courts in Gorakhpur,
          Uttar Pradesh.
        </p>
        <p className="mb-6 text-gray-700">
          <span className="font-medium">12.3</span> Disputes may be resolved through arbitration under the Arbitration and Conciliation Act,
          1996, with the arbitration seat in Gorakhpur.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. CONTACT INFORMATION</h2>
        <p className="mb-2 text-gray-700">For queries, complaints, or feedback, please contact:</p>
        <div className="border-t border-gray-200 pt-6 mt-6 text-gray-700">
          <p className="font-semibold">Marco Cabs – Eightbit Solutions Private Limited</p>
          <p>403-C Bank Road, Purdilpur, Gorakhpur, Uttar Pradesh – 273001, India</p>
          <p>Email: [Your official email]</p>
          <p>Phone: [Your customer support number]</p>
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

export default TermsOfUse;
