
import { apiRequest } from './apiUtils';

export const ordersService = {
  createOrder: (orderData: any) => 
    apiRequest<any>('orders/', 'POST', orderData),
  
  getOrders: () => 
    apiRequest<any[]>('orders/'),
  
  getOrderById: (id: string) => 
    apiRequest<any>(`orders/${id}/`),
};