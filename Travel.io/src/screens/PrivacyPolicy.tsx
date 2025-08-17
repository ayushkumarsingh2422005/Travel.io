import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Privacy Policy</div>
          <Link to="/" className="bg-white/20 rounded-lg p-2 text-white hover:bg-white/30 transition-colors flex gap-1 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl bg-white shadow-lg rounded-lg my-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
        <p className="text-gray-600 text-sm mb-6">Last Updated: August 13, 2025</p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
        <p className="mb-2 text-gray-700">
          Marco Cabs, operated by Eightbit Solutions Private Limited, (“Marco Cabs”, “we”, “us”,
          “our”), is committed to protecting the privacy and security of the personal information of all
          individuals who access our website, mobile applications, or use our services (“Services”).
          This Privacy Policy explains:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>What information we collect from you.</li>
          <li>How we use, store, and protect that information.</li>
          <li>Your rights with respect to your personal data.</li>
          <li>Our obligations under applicable Indian laws, including the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.</li>
        </ul>
        <p className="mb-6 text-gray-700">
          By accessing or using our Services, you acknowledge that you have read, understood, and
          agreed to the terms of this Privacy Policy.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Scope and Applicability</h2>
        <p className="mb-2 text-gray-700">
          This Privacy Policy applies to all users of Marco Cabs, including but not limited to:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Riders / Passengers booking rides through our platform.</li>
          <li>Drivers / Partners providing transportation services through Marco Cabs.</li>
          <li>Visitors accessing our website or mobile applications.</li>
        </ul>
        <p className="mb-6 text-gray-700">
          This policy does not apply to third-party services or websites that may be linked from our
          platform. We recommend reviewing their privacy policies separately.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Information We Collect</h2>
        <p className="mb-2 text-gray-700">
          We collect information from you directly, automatically through technology, and from third
          parties to enable smooth service delivery. This includes:
        </p>
        <h3 className="text-xl font-medium text-gray-700 mb-2">A. Personal Information</h3>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Name, gender, date of birth.</li>
          <li>Contact information: mobile number, email address, postal address.</li>
          <li>Login credentials (username, password, or OTP authentication).</li>
          <li>Government-issued identification numbers (e.g., Aadhaar, PAN, Driving License) when required for verification.</li>
          <li>Profile photograph (optional for riders, mandatory for drivers).</li>
        </ul>
        <h3 className="text-xl font-medium text-gray-700 mb-2">B. Driver / Partner Information</h3>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Vehicle details (registration number, make, model, color, insurance, fitness certificate).</li>
          <li>Bank account details for payouts.</li>
          <li>Police verification records, where applicable.</li>
        </ul>
        <h3 className="text-xl font-medium text-gray-700 mb-2">C. Location Data</h3>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Real-time GPS location of riders and drivers during trip requests and active rides.</li>
          <li>Location at the time of booking for fare calculation and service allocation.</li>
          <li>Historical location records for dispute resolution and safety audits.</li>
        </ul>
        <h3 className="text-xl font-medium text-gray-700 mb-2">D. Transaction Information</h3>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Ride details: pickup and drop locations, date/time, distance traveled, duration.</li>
          <li>Fare and payment details (amount charged, mode of payment, promo codes used).</li>
          <li>Cancellation history.</li>
        </ul>
        <h3 className="text-xl font-medium text-gray-700 mb-2">E. Device & Technical Information</h3>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>IP address, device type, operating system, browser type.</li>
          <li>App usage logs, error/crash reports.</li>
          <li>Mobile network information, Wi-Fi SSID where applicable.</li>
        </ul>
        <h3 className="text-xl font-medium text-gray-700 mb-2">F. Feedback & Communication Records</h3>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Ride ratings, reviews, and complaints submitted by users.</li>
          <li>Communications with our customer support team (via email, chat, or call).</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. How We Use Your Information</h2>
        <p className="mb-2 text-gray-700">We process your personal data for the following purposes:</p>
        <ol className="list-decimal list-inside mb-6 text-gray-700">
          <li>Service Delivery – To match riders with drivers, calculate fares, enable navigation, process payments, and send booking confirmations.</li>
          <li>Safety and Security – To verify identity, track rides in real-time, monitor fraudulent activity, and assist in emergencies.</li>
          <li>Customer Support – To respond to your queries, complaints, and feedback.</li>
          <li>Legal Compliance – To comply with applicable laws, law enforcement requests, and regulatory requirements.</li>
          <li>Service Improvement – To analyze performance, develop new features, and enhance user experience.</li>
          <li>Marketing & Promotions – To send you relevant offers, newsletters, and promotions (only if you opt-in).</li>
        </ol>
        <p className="mb-6 text-gray-700">
          We do not sell, rent, or trade your personal information to third parties for marketing
          purposes.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Sharing of Information</h2>
        <p className="mb-2 text-gray-700">We may share your information only in the following circumstances:</p>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>With Drivers / Riders – Limited details necessary for completing a booking (e.g., name, pickup location, contact number).</li>
          <li>With Service Providers – Trusted vendors who provide payment processing, cloud hosting, analytics, or customer support.</li>
          <li>With Law Enforcement / Regulatory Authorities – Where required under applicable law or legal process.</li>
          <li>In Business Transfers – If our company is merged, acquired, or undergoes restructuring, your information may be transferred as part of the transaction.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Data Retention</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Personal data will be retained only as long as necessary to fulfill the purposes outlined in this policy.</li>
          <li>Transactional records will be retained for a minimum of 5 years as per Indian tax and legal requirements.</li>
          <li>Upon request for account deletion, your personal data will be anonymized or deleted, except where retention is required by law.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cookies and Tracking Technologies</h2>
        <p className="mb-2 text-gray-700">We use cookies, web beacons, and similar technologies to:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Keep you logged in across sessions.</li>
          <li>Remember your preferences.</li>
          <li>Measure website/app traffic and trends.</li>
          <li>Deliver targeted advertisements (only if consented).</li>
        </ul>
        <p className="mb-6 text-gray-700">
          You can disable cookies in your browser/app settings, but some features may not work
          correctly.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Data Security</h2>
        <p className="mb-2 text-gray-700">We implement reasonable security measures, including:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Data encryption (SSL/TLS).</li>
          <li>Restricted employee access to personal data.</li>
          <li>Regular security audits.</li>
          <li>Multi-factor authentication for sensitive accounts.</li>
        </ul>
        <p className="mb-6 text-gray-700">
          However, no online platform can guarantee absolute security. You acknowledge the inherent
          risks of transmitting data over the internet.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Your Rights</h2>
        <p className="mb-2 text-gray-700">As a user, you have the right to:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Access, correct, or update your personal information.</li>
          <li>Withdraw consent for marketing communications.</li>
          <li>Request deletion of your account (subject to pending transactions).</li>
          <li>File a grievance with our Grievance Officer for any concerns.</li>
        </ul>
        <div className="border-t border-gray-200 pt-4 mt-4 text-gray-700">
          <p className="font-semibold">Grievance Officer:</p>
          <p>Name: [To be appointed]</p>
          <p>Email: privacy@marcocabs.com</p>
          <p>Phone: +91-XXXXXXXXXX</p>
        </div>
        <p className="mb-6 text-gray-700"></p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Third-Party Links</h2>
        <p className="mb-6 text-gray-700">
          Our website/app may contain links to third-party websites. We are not responsible for their
          privacy practices and encourage you to review their policies before providing any
          information.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Changes to this Privacy Policy</h2>
        <p className="mb-2 text-gray-700">We may update this Privacy Policy from time to time. Updates will be notified by:</p>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Posting the revised policy on our website/app.</li>
          <li>Updating the “Last Updated” date at the top.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Disclaimer</h2>
        <p className="mb-6 text-gray-700">
          While we take every reasonable step to keep the information on our platform accurate and
          secure, we do not guarantee that our website/app will be error-free or uninterrupted. To the
          extent permitted by law, we are not liable for damages arising from your use of our Services.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Account Deletion Process</h2>
        <p className="mb-2 text-gray-700">You can request account deletion by emailing support@marcocabs.com.</p>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>Your account will be deleted once there are no open bookings or disputes.</li>
          <li>Transaction history will be retained as required by law, but all personally identifiable information will be anonymized.</li>
        </ul>
      </main>
{/* 
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
      </footer> */}
    </div>
  );
};

export default PrivacyPolicy;
