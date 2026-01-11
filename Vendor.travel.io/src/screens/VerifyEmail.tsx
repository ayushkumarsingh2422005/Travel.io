import axios from "../api/axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"
import toast from 'react-hot-toast'; 

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState<'success' | 'error' | 'verifying'>('verifying');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                toast.error('Invalid verification link.');
                return;
            }

            try {
                // Call the backend to verify the token
                // The URL matches the backend route structure mounted in index.js: /vendor/auth/verify-email
                // But axios base URL usually handles the domain and prefix? 
                // Let's check api/axios.ts to be sure about the base URL.
                // Assuming standard setup, we might need '/vendor/auth/verify-email' or just '/auth/verify-email' if the axios instance is scoped.
                // Based on verifytoken.ts, it uses /auth/verifytoken.
                const response = await axios.get(`/auth/verify-email?token=${token}`);

                if (response.status === 200) {
                    setStatus('success');
                    toast.success('Email verified successfully!');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                }
            } catch (error: any) {
                console.error('Verification error:', error);
                setStatus('error');
                toast.error(error.response?.data?.message || 'Email verification failed.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-[url('/bg/carbg.jpg')] bg-cover bg-center bg-gray-500 bg-blend-multiply flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden p-8 text-center">
                
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email...</h2>
                        <p className="text-gray-600">Please wait while we verify your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-6">Your email has been successfully verified. Redirecting to login...</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">The verification link is invalid or has expired.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-green-600 font-medium hover:underline"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
