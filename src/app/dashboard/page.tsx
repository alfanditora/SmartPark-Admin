// pages/admin/dashboard.tsx atau app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getStoredUser, removeStoredAuth, redirectIfNotAuthenticated } from '../../utils/auth';
import UsersManagement from '../../components/UsersManagement';
import ActiveParking from '../../components/ActiveParking';
import ParkingHistory from '../../components/ParkingHistory';

interface User {
  userID: string;
  username: string;
  email: string;
  vehicles: Array<{
    plate: string;
    description: string;
  }>;
  role: string;
}

type ActiveView = 'overview' | 'users' | 'active-parking' | 'parking-history';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const router = useRouter();

  useEffect(() => {
    // Cek authentication saat component mount
    if (!redirectIfNotAuthenticated(router)) {
      return;
    }

    const userData = getStoredUser();
    setUser(userData);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    removeStoredAuth();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F3C7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#007D4B' }}></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'overview', label: 'Dashboard'},
    { id: 'users', label: 'Users'},
    { id: 'active-parking', label: 'Active Parking'},
    { id: 'parking-history', label: 'Parking History'},
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UsersManagement />;
      case 'active-parking':
        return <ActiveParking />;
      case 'parking-history':
        return <ParkingHistory />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#000000' }}>
          Dashboard Overview
        </h2>
        <p className="text-gray-600 mb-4">
          Selamat datang di SmartPark Admin Dashboard. Pantau aktivitas parkir, kelola pengguna, dan akses data penting secara real-time dari satu tempat.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#007D4B' }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveView('users')}
            className="p-4 rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50"
            style={{ borderColor: '#007D4B' }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <p className="font-medium" style={{ color: '#007D4B' }}>Manage Users</p>
              <p className="text-sm text-gray-600">View and manage all users</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveView('active-parking')}
            className="p-4 rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50"
            style={{ borderColor: '#FDD100' }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🚗</div>
              <p className="font-medium" style={{ color: '#E62132' }}>Active Parking</p>
              <p className="text-sm text-gray-600">Monitor current parking sessions</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveView('parking-history')}
            className="p-4 rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50"
            style={{ borderColor: '#E62132' }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <p className="font-medium" style={{ color: '#007D4B' }}>Parking History</p>
              <p className="text-sm text-gray-600">View parking records</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F3C7' }}>
      <header className="bg-white shadow-sm border-b-2" style={{ borderColor: '#007D4B' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="mr-3">
                <Image 
                  src="/assets/images/GOicon.png" 
                  alt="SmartPark Icon" 
                  width={80} 
                  height={80}
                  className="w-20 h-20"
                />
              </div>
              <h1 className="text-xl font-bold" style={{ color: '#000000' }}>
                SmartPark Admin
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium" style={{ color: '#007D4B' }}>{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#E62132' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ActiveView)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeView === item.id
                    ? 'border-current text-current'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={activeView === item.id ? { color: '#007D4B', borderColor: '#007D4B' } : {}}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}