import { useState } from 'react';
import axios from '../api/axios';
import { GoogleLogin } from '@react-oauth/google';

type Props = {};

export default function Login({}: Props) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/auth/login', form);
      setMessage('Login successful!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogle = async (credentialResponse: any) => {
    setMessage('');
    try {
      const res = await axios.post('/auth/google', { id_token: credentialResponse.credential });
      setMessage('Google login successful!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <div style={{ margin: '1em 0' }}>
        <GoogleLogin onSuccess={handleGoogle} onError={() => setMessage('Google login failed')} />
      </div>
      {message && <div>{message}</div>}
    </div>
  );
}