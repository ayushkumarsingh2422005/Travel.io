import  { useEffect } from 'react';
import Sidebar from './Sidebar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { checkAuth } from '../utils/verifytoken';

const Layout = () => {

    const navigate = useNavigate();
    const location =useLocation();

    useEffect(() => {
        const check = async () => {
          const token = localStorage.getItem('marcocabs_customer_token');
          const type = 'customer';
          
          if (!token) {
            console.log('No token found, redirecting to login');
            navigate('/login', {
  state: {
    from: location.pathname,
  },
});
          }
          
          const result = await checkAuth(type, token);
  
          if (!result) {
           navigate('/login', {
  state: {
    from: location.pathname,
  },
});
          }
        };
    
        check();
      }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 