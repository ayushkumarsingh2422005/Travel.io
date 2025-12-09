import { useState } from 'react';
import axios from '../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', form);
      console.log(res.data);
      localStorage.setItem('marcocabs_admin_token', res.data.token); // Store token in local storage
      toast.success('Login successful!');
      window.location.reload();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
      <div className="flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-white/95 w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-red-700">Admin Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="p-3 border rounded-lg focus:ring focus:ring-red-200 focus:border-red-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="p-3 border rounded-lg focus:ring focus:ring-red-200 focus:border-red-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-medium rounded-lg transition-colors shadow-md"
          >
            Login
          </button>
        </form>
        {/* {message && <div className="text-red-600 text-center mt-2">{message}</div>} */}
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
}