// utils/auth.ts
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
  return localStorage.getItem('token');
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const removeStoredAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user && user.role === 'admin');
};

export const redirectIfNotAuthenticated = (router: any): boolean => {
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
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};