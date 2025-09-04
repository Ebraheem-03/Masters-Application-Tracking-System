import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse } from '@/types';
import { api } from '@/lib/api';

// Development mode flag
const isDevelopment = import.meta.env.DEV;
const hasApiConfig = !!(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL);
const useFallbackMode = isDevelopment && !hasApiConfig;

// Mock user for development
const mockUser: User = {
  _id: 'user1',
  email: 'demo@example.com',
  name: 'Demo User',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          if (useFallbackMode) {
            // Simulate login in development mode
            console.log('Using fallback mode for authentication');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const mockToken = 'mock-jwt-token';
            localStorage.setItem('auth-token', mockToken);
            
            set({
              user: mockUser,
              token: mockToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
          
          const response: AuthResponse = await api.auth.login({ email, password });
          
          // Store token in localStorage
          localStorage.setItem('auth-token', response.data.token);
          
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Login error:', error);
          
          // If it's a network error and we're in development, use fallback
          if (isDevelopment && error instanceof Error && error.message.includes('Unable to connect to server')) {
            console.log('Backend unavailable, using fallback authentication');
            const mockToken = 'mock-jwt-token';
            localStorage.setItem('auth-token', mockToken);
            
            set({
              user: mockUser,
              token: mockToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
          
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response: AuthResponse = await api.auth.register({ name, email, password });
          
          // Store token in localStorage
          localStorage.setItem('auth-token', response.data.token);
          
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call logout API
          await api.auth.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error);
        } finally {
          // Remove token from localStorage
          localStorage.removeItem('auth-token');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      getProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const token = localStorage.getItem('auth-token');
          if (!token) {
            throw new Error('No auth token');
          }
          
          if (useFallbackMode || token === 'mock-jwt-token') {
            // Use mock user in development mode
            console.log('Using fallback mode for profile');
            await new Promise(resolve => setTimeout(resolve, 300));
            
            set({
              user: mockUser,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
          
          const response = await api.auth.getProfile();
          
          set({
            user: response.data.user,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Get profile error:', error);
          
          // If it's a network error and we're in development, use fallback
          const token = localStorage.getItem('auth-token');
          if (isDevelopment && token && error instanceof Error && error.message.includes('Unable to connect to server')) {
            console.log('Backend unavailable, using fallback profile');
            set({
              user: mockUser,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
          
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to get profile',
          });
          
          // If getting profile fails, user might not be authenticated
          if (error instanceof Error && error.message.includes('No auth token')) {
            get().logout();
          }
        }
      },

      updateProfile: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          set({ isLoading: true, error: null });
          
          if (useFallbackMode) {
            // Simulate API call for password change in development
            console.log('Simulating password change in fallback mode');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set({ isLoading: false, error: null });
            return;
          }
          
          await api.auth.changePassword(currentPassword, newPassword);
          
          set({ isLoading: false, error: null });
        } catch (error) {
          console.error('Change password error:', error);
          
          // If it's a network error and we're in development, use fallback
          if (isDevelopment && error instanceof Error && error.message.includes('Unable to connect to server')) {
            console.log('Backend unavailable, simulating password change');
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false, error: null });
            return;
          }
          
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to change password',
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          if (useFallbackMode) {
            // Simulate API call for forgot password in development
            console.log('Simulating forgot password in fallback mode');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set({ isLoading: false, error: null });
            return;
          }
          
          await api.auth.forgotPassword(email);
          
          set({ isLoading: false, error: null });
        } catch (error) {
          console.error('Forgot password error:', error);
          
          // If it's a network error and we're in development, use fallback
          if (isDevelopment && error instanceof Error && error.message.includes('Unable to connect to server')) {
            console.log('Backend unavailable, simulating forgot password');
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false, error: null });
            return;
          }
          
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to send reset email',
          });
          throw error;
        }
      },

      resetPassword: async (email: string, otp: string, newPassword: string) => {
        try {
          set({ isLoading: true, error: null });
          
          if (useFallbackMode) {
            // Simulate API call for reset password in development
            console.log('Simulating password reset in fallback mode');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            set({ isLoading: false, error: null });
            return;
          }
          
          await api.auth.resetPassword(email, otp, newPassword);
          
          set({ isLoading: false, error: null });
        } catch (error) {
          console.error('Reset password error:', error);
          
          // If it's a network error and we're in development, use fallback
          if (isDevelopment && error instanceof Error && error.message.includes('Unable to connect to server')) {
            console.log('Backend unavailable, simulating password reset');
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false, error: null });
            return;
          }
          
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to reset password',
          });
          throw error;
        }
      },

      deleteAccount: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Simulate API call for account deletion
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Remove token and clear state
          localStorage.removeItem('auth-token');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to delete account',
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);