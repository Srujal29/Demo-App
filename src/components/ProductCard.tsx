import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check, Zap, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/formatters';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div
      data-testid="product-card"
      data-product-id={product.id}
      className="group relative flex flex-col bg-navy-900/70 hover:bg-navy-850 border border-slate-800/80 hover:border-electric-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow-violet flex-1"
    >
      {/* Product Image & Badges */}
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-navy-950">
        <SafeImage
          src={product.image}
          alt={product.name}
          fallbackTitle={product.name}
          category={product.category}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-slate-300 border border-slate-700/60 shadow-sm">
            {product.category}
          </span>

          {isOutOfStock ? (
            <span
              data-testid="stock-badge"
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Out of Stock (0)
            </span>
          ) : product.badge ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-electric-500/20 text-electric-300 border border-electric-500/40 backdrop-blur-md shadow-sm">
              {product.badge}
            </span>
          ) : null}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-200">{product.rating}</span>
            <span className="text-xs text-slate-500">({product.reviewsCount})</span>
            <span className="text-xs text-slate-600 ml-auto">
              {isOutOfStock ? '0 in stock' : `${product.stock} in stock`}
            </span>
          </div>

          {/* Title & Tagline */}
          <Link to={`/products/${product.id}`} className="block group-hover:text-electric-300 transition-colors">
            <h3 className="font-bold text-base text-slate-100 line-clamp-1 group-hover:text-electric-300">
              {product.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 mt-1">{product.tagline}</p>
          </Link>
        </div>

        {/* Pricing and Action Button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-white tracking-tight">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-500 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>
            {product.originalPrice && (
              <span className="text-[10px] text-emerald-400 font-semibold">
                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            )}
          </div>

          {/* 
            BUG-03: Out-of-Stock Product Can Be Purchased
            Even if product.stock === 0 (e.g. HyperConnect USB-C Hub), 
            the button is NOT disabled, allowing users/agents to add it to cart!
          */}
          <button
            onClick={handleAddToCart}
            data-testid="add-to-cart"
            aria-label={`Add ${product.name} to cart`}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              isOutOfStock
                ? 'bg-electric-600/90 hover:bg-electric-500 text-white shadow-electric-600/30'
                : 'bg-electric-600 hover:bg-electric-500 text-white shadow-electric-600/30'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
