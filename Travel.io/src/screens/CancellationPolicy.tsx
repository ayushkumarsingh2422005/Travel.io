import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';

const CancellationPolicy = () => {
  const [activeSection, setActiveSection] = useState('cancellation');

  const sections = [
    { id: 'cancellation', title: '1. Cancellation Policy' },
    { id: 'refund', title: '2. Refund Policy' },
    { id: 'liability', title: '3. Liability' },
    { id: 'law', title: '4. Governing Law' },
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
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Cancellation & Refund</h1>
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
              Sections
            </h3>
            <nav className="space-y-0.5">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Cancellation and Refund Policy</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              We strive to be transparent with our cancellation terms. Please review the conditions under which cancellations and refunds are processed.
            </p>
          </div>

          <div className="space-y-6">

            <section id="cancellation" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <span className="font-bold text-xl">1</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Cancellation Policy</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    1.1 How to Cancel
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    Call our 24x7 Helpline at <strong>+91-XXXXXXXXXX</strong>. Cancellations via SMS/Email are not valid.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-green-200 bg-green-50 p-4 rounded-xl">
                    <h4 className="font-bold text-green-800 mb-2">Before Driver Details Shared</h4>
                    <p className="text-sm text-green-700">No cancellation fee. Full refund of advance amount.</p>
                  </div>
                  <div className="border border-red-200 bg-red-50 p-4 rounded-xl">
                    <h4 className="font-bold text-red-800 mb-2">After Driver Details Shared</h4>
                    <p className="text-sm text-red-700">No cancellation accepted. Advance amount forfeited.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">1.4 Driver Cancellations</h3>
                  <p className="text-gray-600 mb-2">Drivers may cancel if:</p>
                  <ul className="list-disc list-inside text-gray-600 text-sm mb-2">
                    <li>You are unreachable.</li>
                    <li>Incorrect pickup details.</li>
                    <li>Wait time exceeds 45 mins.</li>
                  </ul>
                  <p className="text-sm text-red-500 font-medium">Check waiting fees: ₹3.50 - ₹10.00 / min after 45 mins.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">1.5 Force Majeure</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-gray-700 text-sm mb-2">For cancellations due to Natural Disasters, Riots, or Acts of God:</p>
                    <p className="font-bold text-blue-700">-&gt; You receive a voucher of equivalent value, valid indefinitely.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="refund" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <span className="font-bold text-xl">2</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Refund Policy</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-gray-50">
                  <h4 className="font-bold text-gray-800">Processing Time</h4>
                  <p className="text-gray-600 text-sm">7–10 business days from cancellation confirmation.</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Eligibility for Refund/Voucher</h4>
                  <ul className="list-none space-y-2">
                    {[
                      'Driver cancels without valid reason',
                      'Vehicle breakdown during trip (unrepairable)',
                      'Force Majeure events',
                      'Trip change confirmed by Company'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Non-Refundable If:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    <li>You cancel after receiving driver details.</li>
                    <li>No-Show at pickup.</li>
                    <li>Misconduct with driver.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="liability" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <span className="font-bold text-xl">3</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Limitation of Liability</h2>
              </div>
              <p className="text-gray-700 mb-2">Drivers act as independent contractors.</p>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                <li>Company is not responsible for loss, theft, or injury during the trip.</li>
                <li>Liability is strictly limited to the refund/voucher amount.</li>
              </ul>
            </section>

            <section id="law" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <span className="font-bold text-xl">4</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Governing Law</h2>
              </div>
              <p className="text-gray-700 mb-4">Governed by laws of India. Jurisdiction: Courts in Gorakhpur, Uttar Pradesh.</p>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-900">Marco Cabs – Eightbit Solutions Private Limited</p>
                <p className="text-gray-600 text-sm">403-C Bank Road, Purdilpur, Gorakhpur, Uttar Pradesh – 273001</p>
                <p className="text-blue-600 text-sm mt-1">support@marcocabs.com | +91-XXXXXXXXXX</p>
              </div>
            </section>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CancellationPolicy;
