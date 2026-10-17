import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, RotateCcw, Menu, X, Sparkles, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ searchQuery = '', onSearchChange }) => {
  const { cartCount, resetDemo } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-navy-950/85 border-b border-slate-800/80 shadow-lg shadow-black/20 transition-all">
      {/* Top Banner Notice for QA Test Target */}
      <div className="bg-gradient-to-r from-electric-900/60 via-navy-900 to-electric-950/60 border-b border-electric-500/20 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200">QA-NEXUS Testbed Active</span>
            <span className="hidden sm:inline text-slate-400">| Standard free delivery on orders over ₹3,000</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetDemo}
              data-testid="reset-demo"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-electric-300 hover:text-electric-200 border border-slate-700/60 transition-colors shadow-sm"
              title="Reset cart, coupons, and orders to initial baseline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-electric-600 via-indigo-600 to-neon-cyan p-0.5 shadow-glow-violet transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-electric-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-electric-400 bg-clip-text text-transparent">
                NEX<span className="text-electric-400">CART</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">
                Storefront
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Search headphones, keyboards, watches..."
                data-testid="search-input"
                className="w-full bg-navy-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </form>
          </div>

          {/* Navigation Links and Cart */}
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'text-electric-300 bg-electric-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Catalog
              </Link>
            </nav>

            {/* Cart Icon */}
            <Link
              to="/cart"
              data-testid="cart-icon-link"
              className="relative p-2.5 rounded-xl bg-navy-900/80 border border-slate-700/70 hover:border-electric-500/50 hover:bg-slate-800/80 text-slate-200 transition-all group flex items-center justify-center shadow-sm"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-200 group-hover:text-electric-400" />
              {cartCount > 0 && (
                <span
                  data-testid="nav-cart-count"
                  className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-electric-600 to-indigo-600 text-white font-bold text-[11px] min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-navy-950 shadow-md animate-pulse"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-navy-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-electric-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </form>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Storefront Catalog
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center justify-between"
            >
              <span>Shopping Cart</span>
              <span className="bg-electric-600/30 text-electric-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                {cartCount} items
              </span>
            </Link>
            <button
              onClick={() => {
                resetDemo();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-500/10 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo Session
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
