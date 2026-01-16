import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';

const TermsOfUse = () => {
  const [activeSection, setActiveSection] = useState('contract');

  const sections = [
    { id: 'contract', title: '1. Contractual Relationship' },
    { id: 'definitions', title: '2. Definitions' },
    { id: 'scope', title: '3. Scope of Services' },
    { id: 'eligibility', title: '4. Eligibility & Resp.' },
    { id: 'luggage', title: '5. Luggage Policy' },
    { id: 'booking', title: '6. Booking Process' },
    { id: 'cancellation', title: '7. Cancellation & No-Show' },
    { id: 'payments', title: '8. Payments & Charges' },
    { id: 'standards', title: '9. Driver & Vehicle Stds' },
    { id: 'delays', title: '10. Delays & Majeure' },
    { id: 'liability', title: '11. Liability & Indemnity' },
    { id: 'disputes', title: '12. Dispute Resolution' },
    { id: 'contact', title: '13. Contact Info' },
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Terms of Use</h1>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Terms of Use</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Welcome to Marco Cabs. Please read these terms carefully before using our services. They constitute a legal agreement between you and Marco Cabs.
            </p>
          </div>

          <div className="space-y-6">

            <section id="contract" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">1</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Contractual Relationship</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                These contract terms govern your use of the applications, websites, content, products, and services provided by Marco Cabs (Eightbit Solutions Private Limited).
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                By accessing our services, you agree to be bound by these terms. If you do not agree, you may not use our services.
              </div>
            </section>

            <section id="definitions" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">2</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Definitions</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { term: 'Driver', def: 'Licensed individuals providing transport.' },
                  { term: 'Booking', def: 'Confirmed reservation via Marco Cabs.' },
                  { term: 'Fare', def: 'Total payable amount (base, waiting, taxes etc).' },
                  { term: 'Force Majeure', def: 'Events beyond control (disasters, strikes).' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-900 block mb-1">{item.term}</span>
                    <span className="text-gray-600 text-sm">{item.def}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="scope" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">3</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Scope of Services</h2>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We are a technology platform connecting passengers with independent drivers.</li>
                <li>We do not own vehicles or employ drivers unless stated.</li>
                <li>Service is for personal, lawful use only.</li>
                <li>We reserve the right to refuse bookings or limit passengers based on capacity.</li>
              </ul>
            </section>

            <section id="eligibility" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">4</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">User Eligibility & Responsibilities</h2>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-sm font-bold">Age</div>
                  <p className="text-gray-700">Must be at least 18 years old. Minors must be accompanied by an adult.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">You Agree To:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm pl-4">
                    <li>Provide accurate details.</li>
                    <li>Be punctual at pickup.</li>
                    <li>Avoid unlawful/unsafe conduct.</li>
                    <li>Not damage the vehicle.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Prohibited:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm pl-4">
                    <li>Smoking, Alcohol, Drugs.</li>
                    <li>Illegal goods/weapons.</li>
                    <li>Abuse/Harassment of driver.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="luggage" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">5</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Luggage Policy</h2>
              </div>
              <p className="text-gray-700 mb-2">Luggage must fit within safety limits. Prohibited items include flammables, explosives, and contraband.</p>
              <p className="text-gray-500 text-sm italic">The Company is not responsible for loss/damage to belongings.</p>
            </section>

            <section id="booking" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">6</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Booking Process</h2>
              </div>
              <p className="text-gray-700 mb-3">Bookings can be made via Website, App, or Helpline.</p>
              <div className="bg-indigo-50 p-4 rounded-xl">
                <h4 className="font-semibold text-indigo-800 mb-2">Fare Estimates may vary due to:</h4>
                <div className="flex flex-wrap gap-2 text-sm text-indigo-700">
                  <span className="bg-white px-2 py-1 rounded shadow-sm">Traffic</span>
                  <span className="bg-white px-2 py-1 rounded shadow-sm">Route changes</span>
                  <span className="bg-white px-2 py-1 rounded shadow-sm">Waiting time</span>
                  <span className="bg-white px-2 py-1 rounded shadow-sm">Extra stops</span>
                </div>
              </div>
            </section>

            <section id="cancellation" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">7</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Cancellation & No-Show Policy</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-bold text-green-600">Before Driver Allocation</h4>
                    <p className="text-sm text-gray-600">Cancel without penalty.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-bold text-orange-600">After Driver Allocation</h4>
                    <p className="text-sm text-gray-600">No cancellation accepted. Full fare charged.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-bold text-red-600">No-Show</h4>
                    <p className="text-sm text-gray-600">Wait time &gt; 30 mins = No Show. Full fare charged.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="payments" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">8</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Payments & Charges</h2>
              </div>
              <p className="text-gray-700 mb-2 font-medium">Fare Includes: Base fare, Tolls, Parking, Taxes.</p>
              <ul className="list-disc list-inside text-gray-600 mb-4 text-sm">
                <li>Waiting Charges: Based on rate card.</li>
                <li>Night Charges: Applicable during night hours.</li>
              </ul>
              <p className="text-gray-700 mb-2 font-medium">Extra Charges For: Hill driving, Detours, Extra pickup points.</p>
              <div className="text-xs text-gray-500 mt-2">No refunds for completed trips unless overcharged.</div>
            </section>

            <section id="standards" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">9</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Driver & Vehicle Standards</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Drivers</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    <li>Valid Commercial License.</li>
                    <li>Compliance with Motor Vehicles Act.</li>
                    <li>Professional Conduct.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Vehicles</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    <li>Clean & Roadworthy.</li>
                    <li>Valid Insurance & Permits.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="delays" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">10</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Delays & Force Majeure</h2>
              </div>
              <p className="text-gray-700">Marco Cabs is not responsible for delays caused by Traffic, Road Closures, Weather, Accidents, or Force Majeure events.</p>
            </section>

            <section id="liability" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">11</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Liability & Indemnity</h2>
              </div>
              <p className="text-gray-700 mb-3">We act as an intermediary. We are not liable for personal injury, theft, or service failures beyond our control.</p>
              <div className="bg-gray-50 p-4 border-l-4 border-gray-400 text-sm text-gray-600 italic">
                You agree to indemnify Marco Cabs from claims arising from your breach of terms or unlawful acts.
              </div>
            </section>

            <section id="disputes" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">12</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Dispute Resolution</h2>
              </div>
              <p className="text-gray-700">Governed by laws of India. Exclusive jurisdiction: Courts in Gorakhpur, Uttar Pradesh.</p>
            </section>

            <section id="contact" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 scroll-mt-24 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <span className="font-bold text-xl">13</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Contact Information</h2>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-900">Marco Cabs – Eightbit Solutions Private Limited</p>
                <p className="text-gray-600">403-C Bank Road, Purdilpur, Gorakhpur, Uttar Pradesh – 273001, India</p>
                <div className="mt-4 pt-4 border-t border-gray-200 grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold">Email</span>
                    <p className="text-indigo-600">support@marcocabs.com</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold">Phone</span>
                    <p className="text-gray-800">+91-XXXXXXXXXX</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
