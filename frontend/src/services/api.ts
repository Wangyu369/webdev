
import { toast } from 'sonner';
import { DjangoAddress } from '@/utils/products.types';

// Base API URL - you'll need to change this to your Django backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Helper to get the auth token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Default headers for API requests
const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic fetch wrapper with improved error handling
export async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any, 
  requireAuth: boolean = true
): Promise<T> {
  try {
    // Ensure endpoint starts with a slash if it doesn't already
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${formattedEndpoint}`;
    console.log('Making API request to:', url, 'with method:', method);
    
    const options: RequestInit = {
      method,
      headers: getHeaders(requireAuth),
      credentials: 'include',
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    console.log('Request options:', {
      method: options.method,
      headers: options.headers,
      hasBody: !!options.body,
    });
    
    const response = await fetch(url, options).catch(error => {
      console.error('Network error during fetch:', error);
      throw new Error(`Network error: ${error.message || 'Failed to connect to the server'}`);
    });
    
    console.log('API response status:', response.status);
    
    // Handle unauthorized errors (expired token, etc.)
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      toast.error('Session expired. Please sign in again.');
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    
    // Parse the JSON response
    let responseData;
    try {
      responseData = await response.json();
      console.log('API response data:', responseData);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      if (response.status === 204) {
        // No content response
        return {} as T;
      }
      throw new Error(`Invalid response format: ${e.message}`);
    }
    
    // Handle other error responses
    if (!response.ok) {
      const errorMessage = responseData.detail || responseData.message || responseData.error || 'An error occurred';
      console.error('API request failed with error:', errorMessage, responseData);
      throw new Error(errorMessage);
    }
    
    return responseData as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API endpoints
export const authService = {
  signIn: (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email);
    return apiRequest<{ token: string; refresh: string; user: any }>('auth/login/', 'POST', { email, password }, false);
  },
  
  signUp: (first_name: string, last_name: string, email: string, password: string) => {
    console.log('Signing up with:', { first_name, last_name, email, password });
    return apiRequest<{ token: string; refresh: string; user: any }>('auth/register/', 'POST', { 
      first_name, 
      last_name, 
      email, 
      password,
      password_confirm: password
    }, false);
  },
  
  getUserProfile: () => 
    apiRequest<any>('auth/profile/'),
    
  getUserAddresses: () =>
    apiRequest<DjangoAddress[]>('auth/addresses/'),
    
  createAddress: (addressData: Omit<DjangoAddress, 'id'>) =>
    apiRequest<DjangoAddress>('auth/addresses/', 'POST', addressData),
    
  updateAddress: (id: string, addressData: Partial<DjangoAddress>) =>
    apiRequest<DjangoAddress>(`auth/addresses/${id}/`, 'PATCH', addressData),
    
  deleteAddress: (id: string) =>
    apiRequest<void>(`auth/addresses/${id}/`, 'DELETE'),
};

// Products API endpoints
export const productsService = {
  getProducts: () => 
    apiRequest<any[]>('products/', 'GET', undefined, false),
  
  getProductsByCategory: (category: string) => 
    apiRequest<any[]>(`products/?category=${category}`, 'GET', undefined, false),
  
  getProductById: (id: string) => 
    apiRequest<any>(`products/${id}/`, 'GET', undefined, false),
  
  getBestSellers: () => 
    apiRequest<any[]>('products/bestsellers/', 'GET', undefined, false),
};

// Orders API endpoints
export const ordersService = {
  createOrder: (orderData: any) => 
    apiRequest<any>('orders/', 'POST', orderData),
  
  getOrders: () => 
    apiRequest<any[]>('orders/'),
  
  getOrderById: (id: string) => 
    apiRequest<any>(`orders/${id}/`),
};