// components/NotFoundPage.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getStoredToken } from '../utils/auth';

export default function NotFoundPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add try-catch to handle any potential localStorage issues
    try {
      const token = getStoredToken();
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGoHome = () => {
    try {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleGoBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleNavigation = (path: string) => {
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F9F3C7' }}>
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold" style={{ color: '#E62132' }}>
            404
          </h1>
          <div className="text-6xl mt-4">
            🚗
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#007D4B' }}>
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
            The page you&apos;re looking for seems to have driven away. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-md"
            style={{ backgroundColor: '#007D4B' }}
          >
            🏠 Go to Homepage
          </button>
          <button
            onClick={handleGoBack}
            className="px-6 py-3 font-medium rounded-lg border-2 hover:opacity-90 transition-opacity shadow-md"
            style={{ 
              color: '#E62132', 
              borderColor: '#E62132',
              backgroundColor: 'white'
            }}
          >
            ← Go Back
          </button>
        </div>

        <div className="mt-12">
          <p className="text-gray-500 mb-4">You might be looking for:</p>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#007D4B' }}></div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {isLoggedIn ? (
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="text-sm px-4 py-2 rounded-full border hover:opacity-80 transition-opacity"
                  style={{ 
                    color: '#007D4B', 
                    borderColor: '#007D4B',
                    backgroundColor: 'white'
                  }}
                >
                  📊 Dashboard
                </button>
              ) : (
                <button
                  onClick={() => handleNavigation('/login')}
                  className="text-sm px-4 py-2 rounded-full border hover:opacity-80 transition-opacity"
                  style={{ 
                    color: '#007D4B', 
                    borderColor: '#007D4B',
                    backgroundColor: 'white'
                  }}
                >
                  🔐 Login
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-16">
          <p className="text-gray-400 text-sm">
            SmartPark System © 2025
          </p>
        </div>
      </div>
    </div>
  );
}