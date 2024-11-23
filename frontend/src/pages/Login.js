import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });
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
        
        // 1. Log the submission attempt
        console.log('Login attempt with:', {
            email: loginInfo.email,
            passwordLength: loginInfo.password?.length
        });

        // 2. Basic validation
        if (!loginInfo.email || !loginInfo.password) {
            handleError('Email and password are required');
            return;
        }

        try {
            // 3. Log the API call attempt
            console.log('Making API call to:', 'https://export-ease-api.vercel.app/auth/login');

            const response = await fetch('https://export-ease-api.vercel.app/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email: loginInfo.email.trim(),
                    password: loginInfo.password
                })
            });

            // 4. Log the raw response
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries([...response.headers]));

            // 5. Get the response data
            const data = await response.json();
            console.log('Response data:', data);

            // 6. Handle the response
            if (response.ok && data.success) {
                // Success case
                handleSuccess('Login successful');
                localStorage.setItem('token', data.jwtToken);
                localStorage.setItem('loggedInUser', data.name);
                navigate('/home');
            } else {
                // Error case
                throw new Error(data.message || 'Login failed');
            }

        } catch (error) {
            // 7. Detailed error logging
            console.error('Login error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            handleError(error.message || 'Login failed. Please try again.');
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
                        autoComplete="email"
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
                        autoComplete="current-password"
                    />
                </div>
                <button type='submit'>Login</button>
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
