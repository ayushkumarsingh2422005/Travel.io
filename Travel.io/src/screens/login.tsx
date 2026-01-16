import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const carouselImages = [
  '/dummy/customer-1.jpg',
  '/dummy/customer-2.jpg',
  '/dummy/customer-3.jpg',
];

export default function Login() {
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
      console.log(res.data);
      localStorage.setItem('marcocabs_customer_token', res.data.token); // Store token in local storage
      toast.success('Login successful!');
      // Extract redirect info
      const from = location.state?.from || '/';
      const pageState = location.state?.pageState;

      console.log('Redirecting to:', from, 'with state:', pageState);

      // Redirect to original page (with state if any)
      navigate(from, { state: pageState });

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogle = async (credentialResponse: any) => {
    try {
      const res = await axios.post('/auth/google', { id_token: credentialResponse.credential });
      localStorage.setItem('marcocabs_customer_token', res.data.token);
      toast.success(`Google login successful!`);
      // Extract redirect info
      const from = location.state?.from || '/';
      const pageState = location.state?.pageState;

      console.log('Redirecting to:', from, 'with state:', pageState);

      // Redirect to original page (with state if any)
      navigate(from, { state: pageState });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[url('/bg/carbg.jpg')] bg-cover bg-center bg-gray-500 bg-blend-multiply flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-col h-140 md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white/90">
          {/* Carousel Section */}
          <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-blue-700 p-8 w-96 relative">
            <img
              src={carouselImages[carouselIdx]}
              alt="Customer"
              className="w-64 h-80 object-cover rounded-xl shadow-lg border-4 border-white"
            />
            <div className="absolute w-2/3 bottom-10 left-1/2 -translate-x-1/2 bg-white/80 rounded-lg px-6 py-3 shadow text-center">
              <h2 className="text-xl font-bold text-blue-700 mb-1">Welcome Back!</h2>
              <p className="text-blue-700 text-sm">Trusted by 500+ happy customers</p>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {carouselImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`block w-2 h-2 rounded-full ${carouselIdx === idx ? 'bg-white' : 'bg-blue-300'}`}
                />
              ))}
            </div>
          </div>
          {/* Login Form Section */}
          <div className="bg-white text-black p-8 w-full md:w-96 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Log In</h1>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="p-3 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="p-3 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-colors shadow-md"
              >
                Login
              </button>
            </form>
            <div className="text-center text-gray-400 my-4">or</div>
            <div className="flex justify-center mb-2">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => toast.error('Google login failed')}
              />
            </div>
            <div className="text-center text-gray-500 mt-4">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-700 font-medium hover:underline">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
