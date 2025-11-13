import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const carouselImages = [
  '/dummy/customer-1.jpg',
  '/dummy/customer-2.jpg',
  '/dummy/customer-3.jpg',
];

export default function VendorSignup() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', gender: '', age: '', current_address: '', description: ''
  });
  const [carouselIdx, setCarouselIdx] = useState(0);
  const navigate = useNavigate();
   const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/signup', form);
         localStorage.setItem('marcocabs_vendor_token', res.data.token);
          // Extract redirect info
    const from = location.state?.from || '/';
    const pageState = location.state?.pageState;

    console.log('Redirecting to:', from, 'with state:', pageState);

    // Redirect to original page (with state if any)
    navigate(from, { state: pageState });
    toast.success('Signup successful!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleGoogle = async (credentialResponse: any) => {
    try {
      const res = await axios.post('/auth/google', { id_token: credentialResponse.credential });
        // Extract redirect info
    const from = location.state?.from || '/';
    const pageState = location.state?.pageState;
      console.log('Login response:', res.data);
      localStorage.setItem('marcocabs_vendor_token', res.data.token); // added this while adding toast reverify 
    console.log('Redirecting to:', from, 'with state:', pageState);

    // Redirect to original page (with state if any)
    navigate(from, { state: pageState });
      toast.success('Google signup successful!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-[url('/bg/carbg.jpg')] bg-cover bg-center bg-gray-500 bg-blend-multiply flex items-center justify-center">
      <div className="flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white/90">
        {/* Carousel Section */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-green-600 to-green-700 p-8 w-96 relative">
          <img
            src={carouselImages[carouselIdx]}
            alt="Vendor"
            className="w-64 h-60 object-cover rounded-xl shadow-lg border-4 border-white"
          />
          <div className="absolute w-2/3 bottom-10 left-1/2 -translate-x-1/2  bg-white/80 rounded-lg px-6 py-3 shadow text-center">
            <h2 className="text-xl font-bold text-green-700 mb-1">Join as Vendor!</h2>
            <p className="text-green-700 text-sm">Sign up and partner with 500+ happy customers</p>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {carouselImages.map((_, idx) => (
              <span
                key={idx}
                className={`block w-2 h-2 rounded-full ${carouselIdx === idx ? 'bg-white' : 'bg-green-300'}`}
              />
            ))}
          </div>
        </div>
        {/* Signup Form Section */}
        <div className="bg-white text-black p-8 w-full md:w-96 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-center mb-6 text-green-700">Vendor Sign Up</h1>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg h-10 focus:ring focus:ring-green-200 focus:border-green-500"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg h-10 focus:ring focus:ring-green-200 focus:border-green-500"
            />
            <input
              name="phone"
              type="text"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg h-10 focus:ring focus:ring-green-200 focus:border-green-500"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg h-10 focus:ring focus:ring-green-200 focus:border-green-500"
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg focus:ring focus:ring-green-200 focus:border-green-500"
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              name="age"
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              required
              min="18"
              className="p-3 border rounded-lg h-10 focus:ring focus:ring-green-200 focus:border-green-500"
            />
            <input
              name="current_address"
              type="text"
              placeholder="Current Address"
              value={form.current_address}
              onChange={handleChange}
              required
              className="p-3 border rounded-lg h-10 focus:ring focus:ring-green-200 focus:border-green-500"
            />
            <textarea
              name="description"
              placeholder="Business Description (Optional)"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="p-3 border rounded-lg focus:ring focus:ring-green-200 focus:border-green-500 resize-none"
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r h-10 from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-colors shadow-md"
            >
              Sign Up as Vendor
            </button>
          </form>
          <div className="text-center text-gray-400 my-4">or</div>
          <div className="flex justify-center mb-2">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => toast.error('Google signup failed')}
            />
          </div>
          <div className="text-center text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 font-medium hover:underline">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
