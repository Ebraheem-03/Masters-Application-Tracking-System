import type { Application, User, Document, ProfileResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Debug logging
console.log('API_BASE_URL:', API_BASE_URL);
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth-token');
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Log more details for debugging
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      data
    });
    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return data;
};

// Helper function to handle network errors
const makeRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  } catch (error) {
    console.error('Network Error:', error);
    // Check if it's a network error (backend not running)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    throw error;
  }
};

// API client with authentication
export const api = {
  // Auth endpoints
  auth: {
    register: async (credentials: { name: string; email: string; password: string }) => {
      console.log('Making register request to:', `${API_BASE_URL}/auth/register`);
      try {
        const response = await makeRequest(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
        console.log('Register response status:', response.status);
        return handleResponse(response);
      } catch (error) {
        console.error('Register request failed:', error);
        throw error;
      }
    },

    login: async (credentials: { email: string; password: string }) => {
      console.log('Making login request to:', `${API_BASE_URL}/auth/login`);
      try {
        const response = await makeRequest(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
        console.log('Login response status:', response.status);
        return handleResponse(response);
      } catch (error) {
        console.error('Login request failed:', error);
        throw error;
      }
    },

    logout: async () => {
      const token = getAuthToken();
      if (!token) return;

      const response = await makeRequest(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    getProfile: async (): Promise<ProfileResponse> => {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await makeRequest(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await makeRequest(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return handleResponse(response);
    },

    forgotPassword: async (email: string) => {
      const response = await makeRequest(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },

    resetPassword: async (email: string, otp: string, newPassword: string) => {
      const response = await makeRequest(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      return handleResponse(response);
    },
  },

  // Applications endpoints
  applications: {
    getAll: async (filters?: {
      priority?: string;
      status?: string;
      country?: string;
      startingSemester?: string;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await makeRequest(`${API_BASE_URL}/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await makeRequest(`${API_BASE_URL}/applications/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    create: async (application: Omit<Application, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await makeRequest(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(application),
      });
      return handleResponse(response);
    },

    update: async (id: string, updates: Partial<Application>) => {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await makeRequest(`${API_BASE_URL}/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await makeRequest(`${API_BASE_URL}/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },
  },
};

export default api;