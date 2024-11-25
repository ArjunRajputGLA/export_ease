import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import axios from 'axios'; // Make sure to install axios: npm install axios

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error message when user starts typing
        setErrorMessage('');
    }

    const validateForm = () => {
        if (!loginInfo.email || !loginInfo.password) {
            setErrorMessage('Email and password are required');
            return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginInfo.email)) {
            setErrorMessage('Please enter a valid email address');
            return false;
        }
        return true;
    }

    // Retry logic with delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    const retryRequest = async (fn, retries = 3, interval = 1000) => {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) throw error;
            await delay(interval);
            return retryRequest(fn, retries - 1, interval * 1.5);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            handleError(errorMessage);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const loginRequest = async () => {
                const response = await axios({
                    method: 'POST',
                    url: 'https://export-ease-api.vercel.app/auth/login',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    data: loginInfo,
                    withCredentials: true, // Important for CORS
                    timeout: 15000 // 15 second timeout
                });
                return response.data;
            };

            // Attempt the login with retry logic
            const result = await retryRequest(loginRequest);
            const { success, message, jwtToken, name, error } = result;

            if (success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                setTimeout(() => {
                    navigate('/home');
                }, 1000);
            } else if (error?.details) {
                handleError(error.details[0].message);
            } else {
                handleError(message || 'Login failed');
            }
        } catch (err) {
            let errorMsg = 'An unexpected error occurred';
            
            if (axios.isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    errorMsg = 'Request timed out. Please try again.';
                } else if (err.response) {
                    // Server responded with error
                    switch (err.response.status) {
                        case 401:
                            errorMsg = 'Invalid credentials';
                            break;
                        case 404:
                            errorMsg = 'Service not found';
                            break;
                        case 500:
                            errorMsg = 'Internal server error. Please try again later.';
                            break;
                        case 503:
                            errorMsg = 'Service temporarily unavailable';
                            break;
                        case 504:
                            errorMsg = 'Server timeout. Please try again.';
                            break;
                        default:
                            errorMsg = err.response.data?.message || 'Login failed';
                    }
                } else if (err.request) {
                    // Request made but no response
                    errorMsg = 'No response from server. Please check your internet connection.';
                }
            }
            
            setErrorMessage(errorMsg);
            handleError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container mx-auto px-4 max-w-md py-8">
            <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
            <form onSubmit={handleLogin} className="space-y-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{errorMessage}</span>
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        onChange={handleChange}
                        type="email"
                        name="email"
                        placeholder="Enter your email..."
                        value={loginInfo.email}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                    </label>
                    <input
                        id="password"
                        onChange={handleChange}
                        type="password"
                        name="password"
                        placeholder="Enter your password..."
                        value={loginInfo.password}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded font-bold ${
                        isLoading 
                        ? 'bg-blue-300 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-700 text-white'
                    }`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                        </span>
                    ) : (
                        'Login'
                    )}
                </button>
                <div className="text-center text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-500 hover:text-blue-800 font-bold">
                        Sign up
                    </Link>
                </div>
            </form>
            <ToastContainer />
        </div>
    );
}

export default Login;
