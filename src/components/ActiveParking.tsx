// components/ActiveParking.tsx
'use client';

import { useState, useEffect } from 'react';
import { getStoredToken } from '../utils/auth';

interface ActiveParkingSession {
  parkID: string;
  userID: string;
  vehicle_plate: string;
  in_date: string;
  out_date: string | null;
  payment_status: string;
  total_billing: number;
  vehicle_description: string;
}

interface ApiResponse {
  status: string;
  data: ActiveParkingSession[];
}

export default function ActiveParking() {
  const [activeSessions, setActiveSessions] = useState<ActiveParkingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');

  useEffect(() => {
    fetchActiveParkingSessions();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchActiveParkingSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveParkingSessions = async () => {
    try {
      setError(null);
      
      const auth = getStoredToken();
      if (!auth) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://smartpark-backend.vercel.app/api/parking/admin/active', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const result: ApiResponse = await response.json();
      
      if (result.status === 'success') {
        setActiveSessions(result.data);
      } else {
        throw new Error('Failed to fetch active parking sessions');
      }
    } catch (err) {
      console.error('Error fetching active parking sessions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching active parking sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const calculateDuration = (inDate: string) => {
    const now = new Date();
    const parkingStart = new Date(inDate);
    const diff = now.getTime() - parkingStart.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const filteredSessions = activeSessions.filter(session => {
    const matchesSearch = session.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.vehicle_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.userID.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || session.payment_status === selectedPaymentStatus;
    
    return matchesSearch && matchesPaymentStatus;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#007D4B' }}></div>
            <p className="text-gray-600">Loading active parking sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Active Parking</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchActiveParkingSessions}
            className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#007D4B' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#007D4B' }}>Active Parking Sessions</h2>
            <p className="text-gray-600 mt-1">Monitor all current parking sessions in real-time</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#007D4B' }}></div>
              <span className="text-sm text-gray-600">Auto-refresh every 30s</span>
            </div>
            <span className="px-3 py-1 text-sm font-medium rounded-full text-white" style={{ backgroundColor: '#E62132' }}>
              {activeSessions.length} Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Active</p>
              <p className="text-2xl font-bold" style={{ color: '#007D4B' }}>{activeSessions.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#007D4B' }}>
              <span className="text-white text-2xl">🚗</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payment</p>
              <p className="text-2xl font-bold" style={{ color: '#E62132' }}>
                {activeSessions.filter(s => s.payment_status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#E62132' }}>
              <span className="text-white text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold" style={{ color: '#007D4B' }}>
                {formatCurrency(activeSessions.reduce((acc, session) => acc + session.total_billing, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#007D4B' }}>
              <span className="text-white text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Sessions
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by vehicle plate, description, or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Payment Status
            </label>
            <select
              id="paymentStatus"
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#FFFFFF' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Bill
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    {activeSessions.length === 0 ? (
                      <div className="text-gray-500">
                        <div className="text-4xl mb-4">🚗</div>
                        <p className="text-lg font-medium">No Active Parking Sessions</p>
                        <p className="text-sm">All parking spots are currently available.</p>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <p>No sessions found matching your criteria.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const { date, time } = formatDateTime(session.in_date);
                  return (
                    <tr key={session.parkID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#007D4B' }}>
                            <span className="text-white font-bold text-sm">🚗</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{session.vehicle_plate}</div>
                            <div className="text-sm text-gray-500">{session.vehicle_description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{session.userID}</div>
                        <div className="text-xs text-gray-500">ID: {session.parkID}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{date}</div>
                        <div className="text-sm text-gray-500">{time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: '#007D4B' }}>
                          {calculateDuration(session.in_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            session.payment_status === 'paid'
                              ? 'text-white'
                              : 'text-gray-800'
                          }`}
                          style={{
                            backgroundColor: session.payment_status === 'paid' ? '#007D4B' : '#FDD100'
                          }}
                        >
                          {session.payment_status.charAt(0).toUpperCase() + session.payment_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(session.total_billing)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}