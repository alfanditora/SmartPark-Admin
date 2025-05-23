// components/ParkingHistory.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStoredToken } from '../utils/auth';

interface ParkingHistoryRecord {
  parkID: string;
  userID: string;
  vehicle_plate: string;
  in_date: string;
  out_date: string;
  payment_status: string;
  total_billing: number;
  user_name: string;
  user_email: string;
  vehicle_description: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse {
  status: string;
  data: ParkingHistoryRecord[];
  pagination: PaginationInfo;
}

export default function ParkingHistory() {
  const [historyRecords, setHistoryRecords] = useState<ParkingHistoryRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('in_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchParkingHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const auth = getStoredToken();
      if (!auth) {
        throw new Error('No authentication token found');
      }

      // Build query parameters
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        page: pagination.page.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      if (selectedPaymentStatus !== 'all') {
        params.append('status', selectedPaymentStatus);
      }
      
      if (startDate) {
        params.append('startDate', new Date(startDate).toISOString());
      }
      
      if (endDate) {
        params.append('endDate', new Date(endDate).toISOString());
      }

      const response = await fetch(`https://smartpark-backend.vercel.app/api/parking/admin/history?${params}`, {
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
        setHistoryRecords(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error('Failed to fetch parking history');
      }
    } catch (err) {
      console.error('Error fetching parking history:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching parking history');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, selectedPaymentStatus, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchParkingHistory();
  }, [fetchParkingHistory]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const calculateDuration = (inDate: string, outDate: string) => {
    const start = new Date(inDate);
    const end = new Date(outDate);
    const diff = end.getTime() - start.getTime();
    
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

  const filteredRecords = historyRecords.filter(record => {
    if (!searchTerm) return true;
    
    return record.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
           record.vehicle_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           record.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           record.user_email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPaymentStatus('all');
    setStartDate('');
    setEndDate('');
    setSortBy('in_date');
    setSortOrder('desc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#007D4B' }}></div>
            <p className="text-gray-600">Loading parking history...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Parking History</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchParkingHistory}
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
            <h2 className="text-2xl font-bold" style={{ color: '#007D4B' }}>Parking History</h2>
            <p className="text-gray-600 mt-1">View all completed parking sessions and transactions</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="px-3 py-1 text-sm font-medium rounded-full text-white" style={{ backgroundColor: '#E62132' }}>
              Total: {pagination.total} records
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold" style={{ color: '#007D4B' }}>{pagination.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#007D4B' }}>
              <span className="text-white text-lg">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Sessions</p>
              <p className="text-2xl font-bold" style={{ color: '#007D4B' }}>
                {historyRecords.filter(r => r.payment_status === 'paid').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#FDD100' }}>
              <span className="text-lg" style={{ color: '#007D4B' }}>✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payment</p>
              <p className="text-2xl font-bold" style={{ color: '#E62132' }}>
                {historyRecords.filter(r => r.payment_status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#E62132' }}>
              <span className="text-white text-lg">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold" style={{ color: '#007D4B' }}>
                {formatCurrency(historyRecords.reduce((acc, record) => acc + record.total_billing, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#007D4B' }}>
              <span className="text-white text-lg">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by vehicle, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              id="paymentStatus"
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            >
              <option value="in_date">Check-in Date</option>
              <option value="out_date">Check-out Date</option>
              <option value="total_billing">Total Billing</option>
              <option value="payment_status">Payment Status</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#007D4B' }}
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#FFFFFF' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle & User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-out Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    {historyRecords.length === 0 ? (
                      <div className="text-gray-500">
                        <div className="text-4xl mb-4">📋</div>
                        <p className="text-lg font-medium">No Parking History Found</p>
                        <p className="text-sm">No parking sessions match your current filters.</p>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <p>No records found matching your search criteria.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const inDateTime = formatDateTime(record.in_date);
                  const outDateTime = formatDateTime(record.out_date);
                  return (
                    <tr key={record.parkID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#007D4B' }}>
                            <span className="text-white font-bold text-sm">🚗</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{record.vehicle_plate}</div>
                            <div className="text-sm text-gray-500">{record.vehicle_description}</div>
                            <div className="text-xs text-gray-400">{record.user_name} ({record.user_email})</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{inDateTime.date}</div>
                        <div className="text-sm text-gray-500">{inDateTime.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{outDateTime.date}</div>
                        <div className="text-sm text-gray-500">{outDateTime.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: '#007D4B' }}>
                          {calculateDuration(record.in_date, record.out_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.payment_status === 'paid'
                              ? 'text-white'
                              : 'text-gray-800'
                          }`}
                          style={{
                            backgroundColor: record.payment_status === 'paid' ? '#007D4B' : '#FDD100'
                          }}
                        >
                          {record.payment_status.charAt(0).toUpperCase() + record.payment_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(record.total_billing)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-white hover:opacity-80 px-3 py-1 rounded text-xs transition-opacity mr-2"
                          style={{ backgroundColor: '#007D4B' }}
                        >
                          View Details
                        </button>
                        <button
                          className="text-white hover:opacity-80 px-3 py-1 rounded text-xs transition-opacity"
                          style={{ backgroundColor: '#E62132' }}
                        >
                          Export
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.page - 2, pagination.pages - 4)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === pagination.page
                        ? 'text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                    style={pageNum === pagination.page ? { backgroundColor: '#007D4B' } : {}}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}