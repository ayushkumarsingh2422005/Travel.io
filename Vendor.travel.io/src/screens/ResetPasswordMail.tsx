import axios from "../api/axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast'; // Import toast

const ResetPasswordMail = () => {
    const [email, setEmail] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!email) {
                toast.error('Email is required');
                return;
            }

            const response = await axios.post('/auth/forgot-password', {
                email: email
            });

            if (response) {
                toast.success('Email sent successfully! Please check your inbox.');
                setEmail(''); // Clear the form
            } else {
                toast.error('Failed to send email. Please try again later.');
            }

        } catch (error: any) {
            console.error('Error sending reset email:', error);
            toast.error(error.response?.data?.message || 'An error occurred while sending the reset email. Please try again later.');
        }
    }

    return (
        <div className="min-h-screen bg-[url('/bg/carbg.jpg')] bg-cover bg-center bg-gray-500 bg-blend-multiply flex items-center justify-center">
            <div className="flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
                {/* Left Section - Info */}
                <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 w-96 relative">
                    <div className="text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Forgot Password?</h2>
                        <p className="text-lg mb-6">Don't worry! It happens to the best of us.</p>
                        <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm border border-white/10">
                            <p className="text-sm">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Form */}
                <div className="bg-white text-black p-8 w-full md:w-96 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">Reset Password</h1>

                    <form onSubmit={handleSendEmail} className="flex flex-col space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-200"
                        >
                            Send Reset Link
                        </button>
                    </form>

                    <div className="text-center text-gray-500 mt-6 text-sm">
                        Remember your password?{' '}
                        <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                            Back to Login
                        </Link>
                    </div>

                    <div className="text-center text-gray-500 mt-2 text-sm">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordMail;
