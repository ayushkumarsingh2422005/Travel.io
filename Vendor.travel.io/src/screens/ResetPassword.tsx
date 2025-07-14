import axios from "../api/axios";
import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

const ResetPassword = () => {
     const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setError(''); // Clear error when user starts typing
    };

    const handleChangeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        setError(''); // Clear error when user starts typing
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {

            console.log('Resetting password with token:', token);
            if (!token) {
                setError('The session has expired. Please try again.');
                return;
            }
            if (!password) {
                setError('Password is required');
                return;
            }
            if (!confirmPassword) {
                setError('Confirm password is required');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            const response = await axios.post(`/auth/reset-password`, {
                token: token,
                password: password
            });

            const pageState = location.state?.pageState;

            if (response) {
                setSuccess('Password reset successfully! You can now log in.');
                setTimeout(() => {
                    navigate('/login', { state: pageState });
                }, 2000);
                setError('');
            } else {
                setError('Failed to reset password. Please try again later.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setError('An error occurred while resetting the password. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-[url('/bg/carbg.jpg')] bg-cover bg-center bg-gray-500 bg-blend-multiply flex items-center justify-center">
            <div className="flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white/90">
                {/* Left Section - Info */}
                <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-green-600 to-green-700 p-8 w-96 relative">
                    <div className="text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Reset Your Password</h2>
                        <p className="text-lg mb-6">Create a new secure password for your account.</p>
                        <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                            <p className="text-sm">
                                Make sure your new password is strong and different from your previous passwords.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Form */}
                <div className="bg-white text-black p-8 w-full md:w-96 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-center mb-6 text-green-700">New Password</h1>
                    
                    <form onSubmit={handleResetPassword} className="flex flex-col space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={password}
                                onChange={handleChangePassword}
                                placeholder="Enter your new password"
                                className="w-full p-3 border rounded-lg focus:ring focus:ring-green-200 focus:border-green-500 transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleChangeConfirmPassword}
                                placeholder="Confirm your new password"
                                className="w-full p-3 border rounded-lg focus:ring focus:ring-green-200 focus:border-green-500 transition-colors"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-colors shadow-md"
                        >
                            Reset Password
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
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-green-700 font-medium hover:underline"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
