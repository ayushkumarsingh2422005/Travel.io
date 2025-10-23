import  { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './SideBar';
import Header from './Header';
import { checkAuth } from '../utils/verifytoken';
import { getVendorProfileData } from '../utils/bookingService'; // Import getVendorProfileData

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [kycCompleted, setKycCompleted] = useState(false); // New state for KYC status
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = (menuItem: string) => {
    // Map menu items to routes
    const routeMap: { [key: string]: string } = {
      'dashboard': '/dashboard',
      'booking': '/booking',
      'trips': '/trips',
      'wallet': '/wallet',
      'driver': '/driver',
      'car': '/car',
      'inventory': '/inventory',
      'driver-rewards': '/driver-rewards',
      'penalty': '/penalty',
      'profile': '/profile'
    };

    if (routeMap[menuItem]) {
      navigate(routeMap[menuItem]);
    }
  };

  useEffect(() => {
    const checkAndFetchKyc = async () => {
      const token = localStorage.getItem('marcocabs_vendor_token');
      const type = 'vendor';
  
      if (!token) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
  
      const authResult = await checkAuth(type, token);
      if (!authResult) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      // Fetch vendor profile data to check KYC status
      try {
        const profileData = await getVendorProfileData();
        if (profileData.success && profileData.vendor) {
          // Assuming is_profile_completed is 1 for completed, 0 for not
          setKycCompleted(profileData.vendor.is_profile_completed === 1);
        } else {
          setKycCompleted(false); // Default to false if profile data fetch fails
        }
      } catch (error) {
        console.error("Error fetching vendor profile for KYC:", error);
        setKycCompleted(false); // Default to false on error
      }
    };
  
    checkAndFetchKyc();
  }, [navigate, location]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - hidden on mobile by default */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30`}
      >
        <Sidebar onMenuClick={handleMenuClick} kycCompleted={kycCompleted} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Page Content */}
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
