
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authService } from '../services/api';

type User = {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState(0);

  // Load user from token on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        console.log('Initial auth state check:', { hasToken: !!token, hasStoredUser: !!storedUser });
        
        if (token && storedUser) {
          try {
            // Parse stored user
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('Retrieved stored user:', parsedUser);
            
            // Verify token validity with the server
            try {
              // Get fresh user data from the server
              console.log('Verifying token with server...');
              const userData = await authService.getUserProfile();
              console.log('Fresh user data from server:', userData);
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
              // If token is invalid, clear auth state
              console.error('Token validation failed:', error);
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              setUser(null);
              // Don't show toast on initial load
            }
          } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
          }
        } else {
          console.log('No stored authentication found');
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadUser();
  }, []);

  const refreshToken = async (): Promise<boolean> => {
    const now = Date.now();
    // Prevent multiple refresh attempts within 5 seconds
    if (now - lastRefreshAttempt < 5000) {
      console.log('Skipping token refresh - too soon since last attempt');
      return !!user; // Return current auth status
    }
    
    setLastRefreshAttempt(now);
    
    try {
      console.log('Attempting to refresh authentication...');
      
      // Check if token exists
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No token to refresh');
        return false;
      }
      
      const userData = await authService.getUserProfile();
      console.log('Authentication refreshed successfully:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Failed to refresh authentication:', error);
      // Clear authentication on failure
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Signing in with email:', email);
      const response = await authService.signIn(email, password);
      console.log('Sign in successful, received token and user data:', response);
      
      // Store JWT token
      localStorage.setItem('authToken', response.token);
      
      // Format user data
      const userData = {
        id: response.user.id,
        email: response.user.email,
        name: `${response.user.first_name || ''} ${response.user.last_name || ''}`.trim(),
        first_name: response.user.first_name,
        last_name: response.user.last_name,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Split the name into first_name and last_name
      const nameParts = name.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';
      
      console.log('Signing up with:', { first_name, last_name, email });
      const response = await authService.signUp(first_name, last_name, email, password);
      console.log('Sign up successful, received token and user data:', response);
      
      // Store JWT token
      localStorage.setItem('authToken', response.token);
      
      // Format user data
      const userData = {
        id: response.user.id,
        email: response.user.email,
        name: `${response.user.first_name || ''} ${response.user.last_name || ''}`.trim(),
        first_name: response.user.first_name,
        last_name: response.user.last_name,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    console.log('Signing out user');
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    toast.success('Signed out successfully');
  };

  // Only render children once auth is initialized
  if (!isInitialized) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};