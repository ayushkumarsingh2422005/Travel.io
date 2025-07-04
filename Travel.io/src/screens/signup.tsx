import { useState } from 'react';
import axios from '../api/axios';
import { GoogleLogin } from '@react-oauth/google';

type Props = {};

export default function Signup({}: Props) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', gender: '', age: '', current_address: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('/auth/signup', form);
      setMessage('Signup successful!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleGoogle = async (credentialResponse: any) => {
    setMessage('');
    try {
      const res = await axios.post('/auth/google', { id_token: credentialResponse.credential });
      setMessage('Google signup successful!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Google signup failed');
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required />
        <input name="current_address" placeholder="Current Address" value={form.current_address} onChange={handleChange} required />
        <button type="submit">Sign Up</button>
      </form>
      <div style={{ margin: '1em 0' }}>
        <GoogleLogin onSuccess={handleGoogle} onError={() => setMessage('Google signup failed')} />
      </div>
      {message && <div>{message}</div>}
    </div>
  );
}