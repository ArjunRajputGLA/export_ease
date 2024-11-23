import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        
        // Form validation
        if (!email?.trim() || !password?.trim()) {
            handleError('Email and password are required');
            return;
        }

        setIsLoading(true);

        try {
            const url = `https://export-ease-api.vercel.app/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include', // Include cookies if your API uses them
                body: JSON.stringify(loginInfo)
            });

            const result = await response.json();

            // Handle different response scenarios
            if (!response.ok) {
                throw new Error(result.message || 'Login failed');
            }

            if (result.success && result.jwtToken) {
                handleSuccess(result.message || 'Login successful');
                localStorage.setItem('token', result.jwtToken);
                localStorage.setItem('loggedInUser', result.name);
                
                setTimeout(() => {
                    navigate('/home');
                }, 1000);
            } else {
                throw new Error(result.message || 'Invalid response from server');
            }

        } catch (error) {
            console.error('Login error:', error);
            handleError(error.message || 'An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='container'>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor='email'>Email</label>
                    <input
                        id='email'
                        onChange={handleChange}
                        type='email'
                        name='email'
                        placeholder='Enter your email...'
                        value={loginInfo.email}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor='password'>Password</label>
                    <input
                        id='password'
                        onChange={handleChange}
                        type='password'
                        name='password'
                        placeholder='Enter your password...'
                        value={loginInfo.password}
                        disabled={isLoading}
                    />
                </div>
                <button type='submit' disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <span>
                    Don't have an account?{' '}
                    <Link to="/signup">Signup</Link>
                </span>
            </form>
            <ToastContainer />
        </div>
    )
}

export default Login
