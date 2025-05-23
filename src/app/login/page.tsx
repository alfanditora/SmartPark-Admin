// app/login/page.tsx (Next.js 13+ dengan App Router)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

interface LoginResponse {
  status: string;
  data: {
    user: {
      userID: string;
      username: string;
      email: string;
      vehicles: Array<{
        plate: string;
        description: string;
      }>;
      role: string;
    };
    token: string;
  };
}

interface ErrorResponse {
  status: string;
  message: string;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleError, setRoleError] = useState(''); // state untuk alert role bukan admin
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRoleError('');

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://smartpark-backend.vercel.app/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse | ErrorResponse = await res.json();

      if (res.ok && data.status === 'success') {
        const loginData = data as LoginResponse;

        if (loginData.data.user.role !== 'admin') {
          setRoleError('Access denied. You are not authorized as admin.');
          setLoading(false);
          return;
        }

        localStorage.setItem('token', loginData.data.token);
        localStorage.setItem('user', JSON.stringify(loginData.data.user));
        router.push('/dashboard');
      } else {
        setError((data as ErrorResponse).message || 'Login failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>SmartPark - Login</title>
        <meta name="description" content="Login to SmartPark" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <html lang="en" />
      </Head>

      <div className="min-h-screen flex">
        {/* Left side - branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-white justify-center items-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-yellow-50 to-amber-50" />
          <div className="relative z-10 text-center px-10 transform -translate-y-14">
            <div className="mb-6">
              <img
                src="/assets/images/GOicon.png"
                alt="SmartPark Logo"
                width={256}
                height={256}
                className="mx-auto mb-6 drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 -mt-16">
              Welcome to <span className="text-red-600">SmartPark Admin</span>
            </h1>
            <p className="mt-2 -translate-y-1 transform text-gray-60">
              Intelligent parking management system for the modern world.
            </p>
          </div>
        </div>

        {/* Right side - login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6" style={{ backgroundColor: '#F9F3C7' }}>
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-yellow-200">
            <div className="text-center mb-6">
              <img
                src="/assets/images/GOicon.png"
                alt="SmartPark Logo"
                width={80}
                height={80}
                className="mx-auto mb-4 drop-shadow-lg lg:hidden"
              />
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <p className="text-sm text-gray-600">Enter your credentials to access your account</p>
            </div>

            {/* Error umum */}
            {error && (
              <div className="mb-4 text-sm text-white p-3 rounded-md bg-red-600">
                {error}
              </div>
            )}

            {/* Alert role bukan admin */}
            {roleError && (
              <div className="mb-4 text-sm text-white p-3 rounded-md bg-red-700 font-semibold">
                {roleError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 transition-colors duration-200"
                  placeholder="you@example.com"
                  aria-label="Email address"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 transition-colors duration-200"
                    placeholder="Password"
                    aria-label="Password"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-2 px-4 rounded-md transition duration-200 shadow-md disabled:opacity-50 hover:shadow-lg"
                style={{
                  backgroundColor: '#007D4B'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#005a36'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007D4B'}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Admin Only Credential
            </div>
          </div>
        </div>
      </div>
    </>
  );
}