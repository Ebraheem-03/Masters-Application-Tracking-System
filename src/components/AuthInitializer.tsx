import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export function AuthInitializer() {
  const { getProfile, token } = useAuthStore();

  useEffect(() => {
    // Check if we have a token in localStorage and try to get the user profile
    const storedToken = localStorage.getItem('auth-token');
    if (storedToken && !token) {
      // Set the token in the store
      useAuthStore.setState({ token: storedToken, isAuthenticated: true });
      
      // Try to get the user profile
      getProfile().catch(() => {
        // If getting profile fails, clear the invalid token
        localStorage.removeItem('auth-token');
        useAuthStore.setState({ token: null, isAuthenticated: false, user: null });
      });
    }
  }, [getProfile, token]);

  return null; // This component doesn't render anything
}
