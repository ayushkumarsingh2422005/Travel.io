import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Import toast

const carouselImages = [
  '/dummy/customer-1.jpg',
  '/dummy/customer-2.jpg',
  '/dummy/customer-3.jpg',
];

export default function VendorLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [carouselIdx, setCarouselIdx] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', form);
      localStorage.setItem('marcocabs_vendor_token', res.data.token);
      toast.success('Login successful!'); // Success toast
      // Extract redirect info
      const from = location.state?.from || '/';
      const pageState = location.state?.pageState;

      console.log('Redirecting to:', from, 'with state:', pageState);

      // Redirect to original page (with state if any)
      navigate(from, { state: pageState });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed'); // Error toast
    }
  };

  const handleGoogle = async (credentialResponse: any) => {
    try {
      const res = await axios.post('/auth/google', { id_token: credentialResponse.credential });
      console.log('Login response:', res.data);
      localStorage.setItem('marcocabs_vendor_token', res.data.token);
      toast.success('Google login successful!'); // Success toast
      // Extract redirect info
      const from = location.state?.from || '/';
      const pageState = location.state?.pageState;

      console.log('Redirecting to:', from, 'with state:', pageState);

      // Redirect to original page (with state if any)
      navigate(from, { state: pageState });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google login failed'); // Error toast
    }
  };

  return (
    <div className="min-h-screen bg-[url('/bg/carbg.jpg')] bg-cover bg-center bg-gray-500 bg-blend-multiply flex items-center justify-center">
      <div className="flex flex-col h-140 md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
        {/* Carousel Section */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 w-96 relative">
          <img
            src={carouselImages[carouselIdx]}
            alt="Vendor"
            className="w-64 h-80 object-cover rounded-xl shadow-lg border-4 border-white/20"
          />
          <div className="absolute w-2/3 bottom-10 left-1/2 -translate-x-1/2 bg-white/90 rounded-lg px-6 py-3 shadow-lg text-center backdrop-blur-md">
            <h2 className="text-xl font-bold text-indigo-700 mb-1">Welcome Back!</h2>
            <p className="text-indigo-600 text-sm">Trusted by 500+ happy vendors</p>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {carouselImages.map((_, idx) => (
              <span
                key={idx}
                className={`block w-2 h-2 rounded-full transition-all duration-300 ${carouselIdx === idx ? 'bg-white w-4' : 'bg-indigo-300/50'}`}
              />
            ))}
          </div>
        </div>
        {/* Login Form Section */}
        <div className="bg-white text-black p-8 w-full md:w-96 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">Vendor Log In</h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
            />
            <div className="text-center text-gray-500 mt-4 text-sm">
              Forget Password ?{' '}
              <Link to="/forget-password" className="text-indigo-600 font-medium hover:underline">Reset Password</Link>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-200"
            >
              Login
            </button>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="transform transition-transform hover:scale-105">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => toast.error('Google login failed')} // Error toast
              />
            </div>
          </div>
          <div className="text-center text-gray-500 mt-2 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-medium hover:underline">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
