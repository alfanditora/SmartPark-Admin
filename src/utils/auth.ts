// utils/auth.ts
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

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

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error accessing localStorage for token:', error);
    return null;
  }
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error accessing localStorage for user:', error);
    return null;
  }
};

export const removeStoredAuth = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing stored auth:', error);
  }
};

export const isAuthenticated = (): boolean => {
  try {
    const token = getStoredToken();
    const user = getStoredUser();
    return !!(token && user && user.role === 'admin');
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const redirectIfNotAuthenticated = (router: AppRouterInstance): boolean => {
  if (!isAuthenticated()) {
    router.push('/login');
    return false;
  }
  return true;
};

// Fungsi untuk membuat request dengan authentication header
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getStoredToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  return fetch(url, {
    ...options,
    headers
  });
};