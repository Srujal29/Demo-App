import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/formatters';
import { SafeImage } from '../components/SafeImage';
import { ProductCard } from '../components/ProductCard';
import { 
  Star, 
  ShoppingCart, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  Share2
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, addToast } = useStore();
  const [selectedQty, setSelectedQty] = useState(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    // BUG-03: Add to cart succeeds even if product.stock === 0
    addToCart(product, selectedQty);
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-electric-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <Link to={`/?q=${product.category}`} className="hover:text-electric-400 transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-slate-200 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery & Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Product Visual */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-navy-900 border border-slate-800 shadow-2xl">
            <SafeImage
              src={product.image}
              alt={product.name}
              fallbackTitle={product.name}
              category={product.category}
              className="w-full h-full object-cover object-center"
            />
            {isOutOfStock ? (
              <div 
                data-testid="stock-badge"
                className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md text-xs font-bold"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Out of Stock (0 remaining)</span>
              </div>
            ) : product.badge ? (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-electric-500/20 text-electric-300 border border-electric-500/40 backdrop-blur-md text-xs font-bold">
                {product.badge}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Details & Purchase Actions */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-electric-400 px-2.5 py-0.5 rounded-full bg-electric-500/10 border border-electric-500/20">
                {product.category}
              </span>
              <span className="text-xs text-slate-500">ID: {product.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{product.tagline}</p>

            {/* Rating and Stock */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-900 border border-slate-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount} verified reviews)</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>
                  {isOutOfStock ? (
                    <strong className="text-rose-400">0 in stock</strong>
                  ) : (
                    <span>{product.stock} units available</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="py-6 border-b border-slate-800 flex items-baseline gap-4">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-base text-slate-500 line-through">
                  {formatINR(product.originalPrice)}
                </span>
                <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="py-6 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Overview</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
          </div>

          {/* Purchase Actions */}
          <div className="py-6 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between sm:justify-start border border-slate-700/80 rounded-xl bg-navy-900 px-3 py-2">
              <span className="text-xs text-slate-400 mr-3">Qty</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedQty(Math.max(0, selectedQty - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-sm transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-bold text-white min-w-[20px] text-center">
                  {selectedQty}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQty(selectedQty + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-sm transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* 
              BUG-03: Add to Cart button remains enabled and clickable even when stock === 0!
            */}
            <button
              onClick={handleAddToCart}
              data-testid="add-to-cart"
              className="flex-1 py-3 px-6 rounded-xl bg-electric-600 hover:bg-electric-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-violet transition-all active:scale-98"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart ({formatINR(product.price * selectedQty)})</span>
            </button>
          </div>

          {/* Key Value Guarantees */}
          <div className="py-6 grid grid-cols-3 gap-3 text-center border-b border-slate-800">
            <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800/80">
              <Truck className="w-4 h-4 text-electric-400 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-slate-200">Free Express Delivery</div>
              <div className="text-[10px] text-slate-400">Orders above ₹3,000</div>
            </div>
            <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-slate-200">1-Year Warranty</div>
              <div className="text-[10px] text-slate-400">Standard replacement</div>
            </div>
            <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800/80">
              <RotateCcw className="w-4 h-4 text-neon-cyan mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-slate-200">7-Day Guarantee</div>
              <div className="text-[10px] text-slate-400">Hassle-free return</div>
            </div>
          </div>

          {/* Technical Specs & Features */}
          <div className="pt-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Key Features
              </h3>
              <ul className="space-y-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-electric-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Technical Specifications
              </h3>
              <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-3 text-xs bg-navy-900/40">
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="text-slate-100 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              More from <span className="text-electric-400">{product.category}</span>
            </h2>
            <Link to="/" className="text-xs text-electric-400 hover:underline">
              View all products
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
