import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ProductCategory, Product } from '../types';
import { 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Search, 
  ArrowUpDown,
  Tag,
  Zap
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = ['All', 'Electronics', 'Accessories', 'Lifestyle'];

export const StorefrontPage: React.FC = () => {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const queryParam = searchParams.get('q') || '';
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [searchQuery, setSearchQuery] = useState(queryParam);

  // BUG-14: Separate active filter query in state that fails to reset when category filter is clicked
  const [activeFilterQuery, setActiveFilterQuery] = useState(queryParam);

  // Sync search input if query param changes
  React.useEffect(() => {
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam);
      setActiveFilterQuery(queryParam);
    }
  }, [queryParam]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setActiveFilterQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  /**
   * BUG-14: Search + Category Filter Query Desynchronization
   * Clicking a category visually clears the search query in the input and URL,
   * but fails to clear activeFilterQuery in memory, producing 0 results for mismatched categories!
   */
  const handleCategoryClick = (category: ProductCategory) => {
    setSelectedCategory(category);
    // Visually clear search params
    setSearchParams({});
    setSearchQuery('');
    // BUG-14: Intentionally omitted: setActiveFilterQuery('')
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setActiveFilterQuery('');
    setSearchParams({});
    setSelectedCategory('All');
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'All' || product.category === selectedCategory;
        const matchesQuery =
          !activeFilterQuery.trim() ||
          product.name.toLowerCase().includes(activeFilterQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(activeFilterQuery.toLowerCase()) ||
          product.tagline.toLowerCase().includes(activeFilterQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(activeFilterQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured default
      });
  }, [products, selectedCategory, activeFilterQuery, sortBy]);

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pb-16 border-b border-slate-800/80 bg-gradient-to-b from-navy-900/60 via-navy-950 to-navy-950">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-electric-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-500/10 border border-electric-500/30 text-electric-300 text-xs font-semibold uppercase tracking-wider mb-5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-electric-400" />
              <span>Next-Gen Audio, Ergonomics & Power Essentials</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Elevate Your Workspace with{' '}
              <span className="bg-gradient-to-r from-electric-400 via-indigo-400 to-neon-cyan bg-clip-text text-transparent">
                Precision Tech
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Engineered for seamless productivity, high-fidelity sound, and tactile bliss. Discover curated hardware built for creators and engineers.
            </p>

            {/* Value Badges */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-900/70 border border-slate-800 text-left">
                <Truck className="w-4 h-4 text-electric-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Free Shipping</div>
                  <div className="text-[10px] text-slate-400">On orders ₹3,000+</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-900/70 border border-slate-800 text-left">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">1-Year Warranty</div>
                  <div className="text-[10px] text-slate-400">Official guarantee</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-900/70 border border-slate-800 text-left">
                <RefreshCw className="w-4 h-4 text-neon-cyan shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Easy Returns</div>
                  <div className="text-[10px] text-slate-400">7-day replacement</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-900/70 border border-slate-800 text-left">
                <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Use SAVE10</div>
                  <div className="text-[10px] text-slate-400">10% instant discount</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Controls: Categories & Sorting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none" data-testid="category-filter">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-electric-600 text-white shadow-glow-violet'
                    : 'bg-navy-900/90 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort & Filter Indicator */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs text-slate-400">
              Showing <span className="font-bold text-slate-200">{filteredProducts.length}</span> items
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Sort:</span>
              </label>
              <select
                id="sort-select"
                data-testid="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products"
                className="bg-navy-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-electric-500"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty Search Results */
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              We couldn't find any products matching your active filters. Try adjusting your search or category selection.
            </p>
            <button
              onClick={handleClearAllFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-electric-600 hover:bg-electric-500 text-white transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
