
import { Product } from './products.types';
import { menProducts } from './products.men';
import { womenProducts } from './products.women';
import { essentialsProducts } from './products.essentials';

// Combine all products
export const products: Product[] = [
  ...menProducts,
  ...womenProducts,
  ...essentialsProducts
];

// Re-export the Product type
export type { Product } from './products.types';

// Helper functions
export const getBestSellers = () => {
  return products.filter(product => product.isBestSeller);
};

export const getProductsByCategory = (category: string) => {
  return products.filter(product => product.category === category);
};

export const getProductById = (id: string) => {
  return products.find(product => product.id === id);
};
