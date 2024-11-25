import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

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

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            handleError(errorMessage);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch('https://export-ease-api.vercel.app/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });

            if (!response.ok) {
                // Handle HTTP errors
                if (response.status === 500) {
                    throw new Error('Internal server error. Please try again later.');
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const result = await response.json();
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
            setErrorMessage(err.message || 'An unexpected error occurred');
            handleError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container">
            <h1>Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                {errorMessage && (
                    <div className="text-red-500 text-sm">{errorMessage}</div>
                )}
                <div>
                    <label htmlFor="email" className="block mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        onChange={handleChange}
                        type="email"
                        name="email"
                        placeholder="Enter your email..."
                        value={loginInfo.email}
                        className="w-full p-2 border rounded"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        onChange={handleChange}
                        type="password"
                        name="password"
                        placeholder="Enter your password..."
                        value={loginInfo.password}
                        className="w-full p-2 border rounded"
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <div className="text-center">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </div>
            </form>
            <ToastContainer />
        </div>
    );
}

export default Login;
