import axios from "../api/axios";
import { useState } from "react";
import { Link } from "react-router-dom";

const ResetPasswordMail = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setError(''); // Clear error when user starts typing
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            if (!email) {
                setError('Email is required');
                return;
            }

            const response = await axios.post('/auth/forgot-password', {
                email:email
            });

            if (response) {
                setSuccess('Email sent successfully! Please check your inbox.');
                setEmail(''); // Clear the form
            } else {
                setError('Failed to send email. Please try again later.');
            }

        } catch (error) {
            console.error('Error sending reset email:', error);
            setError('An error occurred while sending the reset email. Please try again later.');
        }
    }

    return (
        <div className="min-h-screen bg-[url('/bg/carbg.jpg')] bg-cover bg-center bg-gray-500 bg-blend-multiply flex items-center justify-center">
            <div className="flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white/90">
                {/* Left Section - Info */}
                <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-green-600 to-green-700 p-8 w-96 relative">
                    <div className="text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Forgot Password?</h2>
                        <p className="text-lg mb-6">Don't worry! It happens to the best of us.</p>
                        <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                            <p className="text-sm">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Form */}
                <div className="bg-white text-black p-8 w-full md:w-96 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-center mb-6 text-green-700">Reset Password</h1>
                    
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
                                className="w-full p-3 border rounded-lg focus:ring focus:ring-green-200 focus:border-green-500 transition-colors"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-colors shadow-md"
                        >
                            Send Reset Link
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-600 text-sm text-center">{success}</p>
                        </div>
                    )}

                    <div className="text-center text-gray-500 mt-6">
                        Remember your password?{' '}
                        <Link to="/login" className="text-green-700 font-medium hover:underline">
                            Back to Login
                        </Link>
                    </div>

                    <div className="text-center text-gray-500 mt-2">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-green-700 font-medium hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordMail;
