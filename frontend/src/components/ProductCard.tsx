
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/utils/products';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };
  
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block h-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full overflow-hidden rounded-md bg-accent p-2 transition-all duration-300 hover:shadow-md">
        <div className="relative aspect-square overflow-hidden rounded-md bg-white">
          {!isImageLoaded && (
            <div className="absolute inset-0 shimmer bg-slate-100" />
          )}
          <img
            src={product.image}
            alt={product.name}
            className={cn(
              "h-full w-full object-cover object-center transition-transform duration-300",
              isImageLoaded ? "image-loaded" : "image-fade-in",
              isHovered && "scale-105"
            )}
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* Quick add button */}
          <div 
            className={cn(
              "absolute inset-x-0 bottom-0 flex items-center justify-center p-2 transition-all duration-300",
              isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            )}
          >
            <Button 
              variant="secondary" 
              className="w-full justify-center gap-2 rounded-md shadow-md"
              onClick={handleAddToCart}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add to Cart</span>
            </Button>
          </div>
        </div>
        
        <div className="mt-3 flex flex-col space-y-1 p-1">
          <h3 className="line-clamp-1 font-medium text-base">{product.name}</h3>
          <div className="flex items-center justify-between">
            <p className="font-medium">₱{product.price.toFixed(2)}</p>
            <button 
              onClick={handleAddToCart}
              className="rounded-full p-1.5 transition-colors hover:bg-accent-foreground/10"
              aria-label="Add to cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {product.isBestSeller && (
          <div className="absolute left-4 top-4 z-10 rounded-sm bg-black px-2 py-1">
            <span className="text-xs font-medium text-white">Best Seller</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
