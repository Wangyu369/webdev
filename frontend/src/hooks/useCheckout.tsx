
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { ordersService } from '@/services/api';
import { toast } from 'sonner';
import { Address, PaymentMethod, DjangoOrderCreate } from '@/utils/products.types';
import { useAuth } from '@/context/AuthContext';

export const useCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, totalPrice, clearCart } = useCart();
  const { refreshToken, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const processCheckout = async (
    shippingAddress: Address,
    paymentMethod: PaymentMethod
  ) => {
    setIsProcessing(true);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('User not authenticated before checkout, attempting to refresh token');
        const tokenRefreshed = await refreshToken();
        
        if (!tokenRefreshed) {
          console.error('Failed to refresh authentication token');
          toast.error('Your session has expired. Please sign in again to continue.');
          navigate('/cart');
          return null;
        }
        console.log('Authentication token refreshed successfully');
      }
      
      // Validate items before sending
      if (!items || items.length === 0) {
        console.error('No items in cart');
        toast.error('Your cart is empty. Please add items before checking out.');
        navigate('/cart');
        return null;
      }
      
      // Format order data for the Django API
      const orderItems = items.map(item => {
        // Validate each item has required fields
        if (!item.product || !item.product.id) {
          console.error('Invalid product in cart item:', item);
          throw new Error('Invalid product data in cart');
        }
        
        return {
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        };
      });
      
      // Create order data object with validated items
      const orderData: DjangoOrderCreate = {
        items: orderItems,
        total_amount: totalPrice,
        payment_method: paymentMethod,
        shipping_first_name: shippingAddress.firstName,
        shipping_last_name: shippingAddress.lastName,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_zip: shippingAddress.zip,
        shipping_phone: shippingAddress.phone
      };
      
      console.log('Sending order to API with items:', JSON.stringify(orderItems, null, 2));
      console.log('Complete order data:', JSON.stringify(orderData, null, 2));
      
      // Send order to the API
      const response = await ordersService.createOrder(orderData);
      
      // Handle successful order
      toast.success(`Order placed successfully! Order #${response.id}`);
      clearCart();
      
      // Redirect to success page with order info
      navigate('/', { 
        state: { 
          orderSuccess: true,
          orderId: response.id,
          paymentMethod
        } 
      });
      
      return response;
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Specific error handling
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          toast.error('Your session has expired. Please sign in again to continue.');
          // Navigate back to cart page for re-authentication
          navigate('/cart');
        } else {
          const errorMsg = error.message || 'Failed to process your order';
          toast.error(errorMsg);
          console.error('Detailed error:', error);
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    processCheckout,
    isProcessing
  };
};