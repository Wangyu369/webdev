
import { apiRequest } from './apiUtils';

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