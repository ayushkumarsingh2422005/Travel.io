import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'scope', title: '2. Scope & Applicability' },
    { id: 'collection', title: '3. Information Collection' },
    { id: 'usage', title: '4. Usage of Information' },
    { id: 'sharing', title: '5. Sharing Information' },
    { id: 'retention', title: '6. Data Retention' },
    { id: 'cookies', title: '7. Cookies & Tracking' },
    { id: 'security', title: '8. Data Security' },
    { id: 'rights', title: '9. Your Rights' },
    { id: 'links', title: '10. Third-Party Links' },
    { id: 'changes', title: '11. Policy Changes' },
    { id: 'disclaimer', title: '12. Disclaimer' },
    { id: 'deletion', title: '13. Account Deletion' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-indigo-600 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Privacy Policy</h1>
          </div>
          <Link to="/" className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col lg:flex-row gap-8 max-w-7xl">

        {/* Sidebar Navigation */}
        <aside className="lg:w-1/4 hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-hidden">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 border-b border-gray-100 mb-2">
              Table of Contents
            </h3>
            <nav className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                    }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:w-3/4 w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <p className="text-gray-500 text-sm mb-2 font-medium">Last Updated: August 13, 2025</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              At Marco Cabs, we value your trust. This policy outlines how we handle your data with transparency and care.
            </p>
          </div>

          <div className="space-y-6">

            {/* 1. Introduction */}
            <section id="introduction" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">1</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Introduction</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Marco Cabs, operated by Eightbit Solutions Private Limited, (“Marco Cabs”, “we”, “us”, “our”), is committed to protecting the privacy and security of the personal information of all individuals who access our website, mobile applications, or use our services (“Services”).
              </p>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <p className="font-medium text-indigo-900 mb-2">This Privacy Policy explains:</p>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2 text-indigo-800 text-sm">
                    <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    What information we collect.
                  </li>
                  <li className="flex items-start gap-2 text-indigo-800 text-sm">
                    <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    How we use and protect it.
                  </li>
                  <li className="flex items-start gap-2 text-indigo-800 text-sm">
                    <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Your rights regarding data.
                  </li>
                  <li className="flex items-start gap-2 text-indigo-800 text-sm">
                    <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Our legal obligations.
                  </li>
                </ul>
              </div>
            </section>

            {/* 2. Scope */}
            <section id="scope" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">2</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Scope and Applicability</h2>
              </div>
              <p className="text-gray-600 mb-4">This Privacy Policy applies to:</p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {['Riders / Passengers', 'Drivers / Partners', 'Website Visitors'].map((item, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100 font-medium text-gray-700 text-sm">
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 italic border-l-4 border-gray-300 pl-3">
                Note: This policy does not apply to third-party services linked from our platform.
              </p>
            </section>

            {/* 3. Information Collection */}
            <section id="collection" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">3</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Information We Collect</h2>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/3">
                    <h3 className="font-bold text-gray-800 mb-1">Personal Information</h3>
                    <p className="text-xs text-gray-500">Identity details</p>
                  </div>
                  <div className="md:w-2/3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
                    Name, gender, DOB, Contact (mobile, email, address), Login credentials, Government ID (Aadhaar, PAN, DL), Profile Photo.
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/3">
                    <h3 className="font-bold text-gray-800 mb-1">Driver Information</h3>
                    <p className="text-xs text-gray-500">For partners only</p>
                  </div>
                  <div className="md:w-2/3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
                    Vehicle details, Bank account for payouts, Police verification records.
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/3">
                    <h3 className="font-bold text-gray-800 mb-1">Location Data</h3>
                    <p className="text-xs text-gray-500">Real-time & Historical</p>
                  </div>
                  <div className="md:w-2/3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
                    GPS coordinates during active rides and bookings for fare calculation, safety audits, and dispute resolution.
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/3">
                    <h3 className="font-bold text-gray-800 mb-1">Transaction Data</h3>
                    <p className="text-xs text-gray-500">Financial records</p>
                  </div>
                  <div className="md:w-2/3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
                    Ride details (pickup/drop, distance), Fare amount, Payment mode, Promo codes, Cancellation history.
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Usage */}
            <section id="usage" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">4</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">How We Use Your Information</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Service Delivery', desc: 'Match riders/drivers, calculate fares, process payments.' },
                  { title: 'Safety & Security', desc: 'Verify identity, track rides, monitor fraud.' },
                  { title: 'Customer Support', desc: 'Respond to queries and resolve complaints.' },
                  { title: 'Legal Compliance', desc: 'Law enforcement requests and regulatory norms.' },
                  { title: 'Service Improvement', desc: 'Analyze performance and develop features.' },
                  { title: 'Marketing', desc: 'Send relevant offers (only if opted-in).' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-gray-500 text-center border-t pt-4">
                We do <span className="font-bold text-gray-700">not</span> sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </section>

            {/* 5. Sharing */}
            <section id="sharing" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">5</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Sharing of Information</h2>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span><strong>With Drivers / Riders:</strong> Minimal details needed for booking (Name, Location, Contact).</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span><strong>Service Providers:</strong> Vendors for payments, hosting, and support.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span><strong>Legal Authorities:</strong> If required by law or legal process.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span><strong>Business Transfers:</strong> In case of mergers or acquisitions.</span>
                </li>
              </ul>
            </section>

            {/* 6. Retention */}
            <section id="retention" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">6</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Data Retention</h2>
              </div>
              <p className="text-gray-600 mb-4">We retain data only as long as necessary.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-1">Transactional Records</h4>
                  <p className="text-sm text-gray-600">Min. 5 years (Tax/Legal requirements)</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-1">Personal Data</h4>
                  <p className="text-sm text-gray-600">Until account deletion or purpose fulfillment.</p>
                </div>
              </div>
            </section>

            {/* 7. Cookies */}
            <section id="cookies" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">7</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Cookies & Tracking</h2>
              </div>
              <p className="text-gray-600 mb-4">We use cookies to enhance your experience, remember preferences, and analyze traffic. You can disable them in your browser, but some features may break.</p>
            </section>

            {/* 8. Security */}
            <section id="security" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">8</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Data Security</h2>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {['SSL/TLS Encryption', 'Restricted Access', 'Security Audits', 'Multi-factor Auth'].map((tag, i) => (
                  <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-gray-500 text-sm">Note: While we implement robust measures, no online platform can be 100% secure.</p>
            </section>

            {/* 9. Your Rights */}
            <section id="rights" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">9</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Your Rights</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg hover:border-indigo-400 transition-colors">
                  <h4 className="font-bold text-gray-800">Access & Update</h4>
                  <p className="text-sm text-gray-600">View and correct your personal data.</p>
                </div>
                <div className="p-4 border rounded-lg hover:border-indigo-400 transition-colors">
                  <h4 className="font-bold text-gray-800">Withdraw Consent</h4>
                  <p className="text-sm text-gray-600">Opt-out of marketing anytime.</p>
                </div>
                <div className="p-4 border rounded-lg hover:border-indigo-400 transition-colors">
                  <h4 className="font-bold text-gray-800">Delete Account</h4>
                  <p className="text-sm text-gray-600">Request removal (subject to pending items).</p>
                </div>
                <div className="p-4 border rounded-lg hover:border-indigo-400 transition-colors">
                  <h4 className="font-bold text-gray-800">Grievance Redressal</h4>
                  <p className="text-sm text-gray-600">Contact our officer for concerns.</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Grievance Officer</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Name: [To be appointed]</p>
                  <p>Email: <a href="mailto:privacy@marcocabs.com" className="text-indigo-600 hover:underline">privacy@marcocabs.com</a></p>
                  <p>Phone: +91-XXXXXXXXXX</p>
                </div>
              </div>
            </section>

            {/* 10-13 Misc */}
            <section id="links" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-gray-800 mb-2">10. Third-Party Links</h2>
              <p className="text-gray-600">Our platform may contain links to external sites. We are not responsible for their privacy practices.</p>
            </section>

            <section id="changes" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-gray-800 mb-2">11. Changes to Policy</h2>
              <p className="text-gray-600">Updates will be posted here with a revised "Last Updated" date.</p>
            </section>

            <section id="disclaimer" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-gray-800 mb-2">12. Disclaimer</h2>
              <p className="text-gray-600">We do not guarantee error-free performance. We are not liable for damages arising from use, to the extent permitted by law.</p>
            </section>

            <section id="deletion" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-gray-800 mb-2">13. Account Deletion</h2>
              <p className="text-gray-600 mb-2">Email <a href="mailto:support@marcocabs.com" className="text-indigo-600 hover:underline">support@marcocabs.com</a> to request deletion.</p>
              <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-200">
                <strong>Note:</strong> Data is anonymized after deletion. Transaction history is kept for legal reasons.
              </div>
            </section>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
