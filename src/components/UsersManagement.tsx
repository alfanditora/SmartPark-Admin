// components/UsersManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { getStoredToken } from '../utils/auth';

interface Vehicle {
  plate: string;
  description: string;
}

interface User {
  userID: string;
  username: string;
  email: string;
  vehicles: Vehicle[];
  role: string;
  rfid?: string;
}

interface ApiResponse {
  status: string;
  data: User[];
}

interface RfidModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  mode: 'add' | 'edit';
  onSuccess: () => void;
}

function RfidModal({ isOpen, onClose, user, mode, onSuccess }: RfidModalProps) {
  const [rfidValue, setRfidValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setRfidValue(user.rfid || '');
      setError(null);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rfidValue.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const auth = getStoredToken();
      if (!auth) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://smartpark-backend.vercel.app/api/users/admin/rfid', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: user.userID,
          rfid: rfidValue.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status === 404) {
          throw new Error('User not found.');
        } else if (response.status === 409) {
          throw new Error('RFID already assigned to another user.');
        } else {
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error managing RFID:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while managing RFID');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRfid = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const auth = getStoredToken();
      if (!auth) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://smartpark-backend.vercel.app/api/users/admin/rfid/${user.userID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status === 404) {
          throw new Error('User not found.');
        } else if (response.status === 400) {
          throw new Error('User doesn\'t have an RFID assigned.');
        } else {
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error removing RFID:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while removing RFID');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border-1 border-black shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#007D4B' }}>
            {mode === 'add' ? 'Add RFID' : 'Edit RFID'} - {user?.username}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="rfid" className="block text-sm font-medium text-gray-700 mb-2">
              RFID Tag
            </label>
            <input
              type="text"
              id="rfid"
              value={rfidValue}
              onChange={(e) => setRfidValue(e.target.value)}
              placeholder="Enter RFID tag identifier"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex justify-between">
            <div>
              {mode === 'edit' && user?.rfid && (
                <button
                  type="button"
                  onClick={handleRemoveRfid}
                  disabled={isLoading}
                  className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#E62132' }}
                >
                  {isLoading ? 'Removing...' : 'Remove RFID'}
                </button>
              )}
            </div>
            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !rfidValue.trim()}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#007D4B' }}
              >
                {isLoading ? 'Saving...' : (mode === 'add' ? 'Add RFID' : 'Update RFID')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [rfidModal, setRfidModal] = useState<{
    isOpen: boolean;
    user: User | null;
    mode: 'add' | 'edit';
  }>({
    isOpen: false,
    user: null,
    mode: 'add'
  });

  useEffect(() => {
    fetchUsers();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      
      const auth = getStoredToken();
      if (!auth) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://smartpark-backend.vercel.app/api/users/all', {
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
        setUsers(result.data);
      } else {
        throw new Error('Failed to fetch users data');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRfidAction = (user: User) => {
    setRfidModal({
      isOpen: true,
      user,
      mode: user.rfid ? 'edit' : 'add'
    });
  };

  const handleRfidModalClose = () => {
    setRfidModal({
      isOpen: false,
      user: null,
      mode: 'add'
    });
  };

  const handleRfidSuccess = () => {
    fetchUsers(); // Refresh the users list
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.vehicles.some(vehicle => 
                           vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.description.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#007D4B' }}></div>
            <p className="text-gray-600">Loading users...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
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
            <h2 className="text-2xl font-bold" style={{ color: '#007D4B' }}>Users Management</h2>
            <p className="text-gray-600 mt-1">Manage all registered users in the system</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#007D4B' }}></div>
              <span className="text-sm text-gray-600">Auto-refresh every 30s</span>
            </div>
            <span className="px-3 py-1 text-sm font-medium rounded-full text-white" style={{ backgroundColor: '#E62132' }}>
              Total: {users.length} users
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by username, email, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
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
                  User Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#007D4B' }}>
                          <span className="text-white font-medium text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">ID: {user.userID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {user.vehicles.length === 0 ? (
                          <span className="text-sm text-gray-400">No vehicles registered</span>
                        ) : (
                          user.vehicles.map((vehicle, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium text-gray-900">{vehicle.plate}</div>
                              <div className="text-gray-500 text-xs">{vehicle.description}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin'
                            ? 'text-white'
                            : 'text-gray-800'
                        }`}
                        style={{
                          backgroundColor: user.role === 'admin' ? '#E62132' : '#FDD100'
                        }}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">
                          {user.rfid || 'Not assigned'}
                        </span>
                        {user.rfid && (
                          <div className="w-2 h-2 bg-green-400 rounded-full" title="RFID assigned"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRfidAction(user)}
                        className="text-white hover:opacity-80 px-3 py-1 rounded text-xs transition-opacity"
                        style={{ backgroundColor: user.rfid ? '#E62132' : '#007D4B' }}
                      >
                        {user.rfid ? 'Edit RFID' : 'Add RFID'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#007D4B' }}>
          User Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F9F3C7' }}>
            <div className="text-2xl font-bold" style={{ color: '#E62132' }}>
              {users.filter(u => u.role === 'user').length}
            </div>
            <div className="text-sm text-gray-600">Regular Users</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F9F3C7' }}>
            <div className="text-2xl font-bold" style={{ color: '#E62132' }}>
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Admin Users</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F9F3C7' }}>
            <div className="text-2xl font-bold" style={{ color: '#E62132' }}>
              {users.reduce((acc, user) => acc + user.vehicles.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Vehicles</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F9F3C7' }}>
            <div className="text-2xl font-bold" style={{ color: '#E62132' }}>
              {users.filter(u => u.rfid).length}
            </div>
            <div className="text-sm text-gray-600">Users with RFID</div>
          </div>
        </div>
      </div>

      <RfidModal
        isOpen={rfidModal.isOpen}
        onClose={handleRfidModalClose}
        user={rfidModal.user}
        mode={rfidModal.mode}
        onSuccess={handleRfidSuccess}
      />
    </div>
  );
}